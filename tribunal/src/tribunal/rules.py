"""Rule engine — evaluates project rules against hook events.

Rules are defined in .tribunal/rules.yaml and evaluated in order.
Each rule has a trigger (hook event), match conditions, and an action.
"""

from __future__ import annotations

import fnmatch
import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml

from .protocol import HookEvent, HookVerdict


@dataclass
class RuleMatch:
    """Conditions that must be true for a rule to fire."""

    tool: str | None = None  # glob pattern for tool name (e.g. "FileEdit|Bash")
    path: str | None = None  # glob pattern for file path in tool_input

    def matches(self, event: HookEvent) -> bool:
        if self.tool and event.tool_name:
            tools = [t.strip() for t in self.tool.split("|")]
            if not any(fnmatch.fnmatch(event.tool_name, t) for t in tools):
                return False
        elif self.tool and not event.tool_name:
            return False

        if self.path:
            file_path = _extract_path(event)
            if file_path and not fnmatch.fnmatch(file_path, self.path):
                return False
            elif not file_path:
                return False

        return True


@dataclass
class Rule:
    """A single tribunal rule."""

    name: str
    trigger: str  # PreToolUse, PostToolUse, SessionStart, etc.
    match: RuleMatch = field(default_factory=RuleMatch)
    action: str = "block"  # block, warn, log
    message: str = ""
    condition: str | None = None  # built-in condition name
    run: str | None = None  # shell command to run for validation
    enabled: bool = True


@dataclass
class RuleResult:
    """Result of evaluating a single rule."""

    rule: Rule
    triggered: bool
    blocked: bool = False
    message: str = ""


def _extract_path(event: HookEvent) -> str | None:
    """Extract the file path from a tool's input, if present."""
    inp = event.tool_input
    for key in ("path", "file_path", "filePath", "filename"):
        if key in inp:
            return inp[key]
    # Bash commands: try to extract path from command string
    if event.tool_name == "Bash" and "command" in inp:
        return None  # Bash commands don't have a single path
    return None


class RuleEngine:
    """Loads rules from config and evaluates them against hook events."""

    def __init__(self, rules: list[Rule] | None = None):
        self.rules = rules or []

    @classmethod
    def from_config(cls, config_path: str | Path) -> RuleEngine:
        """Load rules from a .tribunal/rules.yaml file."""
        path = Path(config_path)
        if not path.exists():
            return cls([])

        with open(path) as f:
            data = yaml.safe_load(f) or {}

        rules_data = data.get("rules", {})
        rules: list[Rule] = []

        for name, rdef in rules_data.items():
            if not isinstance(rdef, dict):
                continue
            match_data = rdef.get("match", {})
            match = RuleMatch(
                tool=match_data.get("tool"),
                path=match_data.get("path"),
            )
            rules.append(Rule(
                name=name,
                trigger=rdef.get("trigger", "PreToolUse"),
                match=match,
                action=rdef.get("action", "block"),
                message=rdef.get("message", f"Blocked by rule: {name}"),
                condition=rdef.get("condition"),
                run=rdef.get("run"),
                enabled=rdef.get("enabled", True),
            ))

        return cls(rules)

    @classmethod
    def from_project(cls, cwd: str | None = None) -> RuleEngine:
        """Load rules from the project's .tribunal/rules.yaml."""
        project_dir = Path(cwd) if cwd else Path.cwd()
        config_path = project_dir / ".tribunal" / "rules.yaml"
        engine = cls.from_config(config_path)

        # Also load built-in rules if no project rules exist
        if not engine.rules:
            engine.rules = _default_rules()

        return engine

    def evaluate(self, event: HookEvent) -> HookVerdict:
        """Evaluate all matching rules against a hook event. Returns a verdict."""
        results: list[RuleResult] = []

        for rule in self.rules:
            if not rule.enabled:
                continue
            if rule.trigger != event.hook_event_name:
                continue
            if not rule.match.matches(event):
                continue

            # Check built-in conditions
            triggered, msg = _check_condition(rule, event)
            if not triggered:
                continue

            blocked = rule.action == "block"
            message = msg or rule.message
            results.append(RuleResult(
                rule=rule,
                triggered=True,
                blocked=blocked,
                message=message,
            ))

        # If any rule blocks, the verdict is block
        blocking = [r for r in results if r.blocked]
        if blocking:
            reasons = "\n".join(
                f"⛔ [{r.rule.name}] {r.message}" for r in blocking
            )
            return HookVerdict(
                allow=False,
                reason=f"Tribunal blocked this operation:\n{reasons}",
            )

        # Collect warnings
        warnings = [r for r in results if r.triggered and not r.blocked]
        if warnings:
            context = "\n".join(
                f"⚠️ [{r.rule.name}] {r.message}" for r in warnings
            )
            return HookVerdict(allow=True, additional_context=context)

        return HookVerdict(allow=True)


# ── Built-in Conditions ──────────────────────────────────────────────────────


def _check_condition(rule: Rule, event: HookEvent) -> tuple[bool, str]:
    """Check a rule's built-in condition. Returns (triggered, message)."""
    cond = rule.condition
    if not cond:
        return True, ""

    checker = _CONDITIONS.get(cond)
    if checker:
        return checker(rule, event)

    return False, ""


def _condition_no_matching_test(rule: Rule, event: HookEvent) -> tuple[bool, str]:
    """Block if writing a Python source file that has no corresponding test file."""
    file_path = _extract_path(event)
    if not file_path:
        return False, ""

    # Only apply to Python source files (not test files themselves)
    if not file_path.endswith(".py"):
        return False, ""
    basename = os.path.basename(file_path)
    if basename.startswith("test_") or basename.endswith("_test.py"):
        return False, ""
    if "/tests/" in file_path or "/test/" in file_path:
        return False, ""
    if basename in ("__init__.py", "conftest.py", "setup.py"):
        return False, ""

    # Check if a corresponding test file exists
    cwd = event.cwd
    module_name = basename.removesuffix(".py")
    test_patterns = [
        f"tests/test_{module_name}.py",
        f"tests/{module_name}_test.py",
        f"test/test_{module_name}.py",
        f"test_{module_name}.py",
    ]

    # Also check relative to the file's directory
    file_dir = os.path.dirname(file_path)
    if file_dir:
        test_patterns.extend([
            os.path.join(file_dir, f"test_{module_name}.py"),
            os.path.join(file_dir, "tests", f"test_{module_name}.py"),
        ])

    for pattern in test_patterns:
        full = os.path.join(cwd, pattern)
        if os.path.exists(full):
            return False, ""

    return True, f"No test file found for {file_path}. Write tests first (e.g. tests/test_{module_name}.py)."


def _condition_contains_secret(rule: Rule, event: HookEvent) -> tuple[bool, str]:
    """Check if tool input contains patterns that look like secrets."""
    # Get the content being written
    content = ""
    inp = event.tool_input

    # FileEdit: check new_string / edits
    if "new_string" in inp:
        content = inp["new_string"]
    elif "content" in inp:
        content = inp["content"]
    elif "edits" in inp and isinstance(inp["edits"], list):
        content = " ".join(str(e.get("new_string", "")) for e in inp["edits"])
    elif "command" in inp:
        content = inp["command"]

    if not content:
        return False, ""

    # Patterns that indicate hardcoded secrets
    secret_patterns = [
        (r'(?:api[_-]?key|apikey)\s*[=:]\s*["\']?[A-Za-z0-9_\-]{20,}', "API key"),
        (r'(?:secret|password|passwd|pwd)\s*[=:]\s*["\']?[^\s"\']{8,}', "password/secret"),
        (r'(?:token)\s*[=:]\s*["\']?[A-Za-z0-9_\-\.]{20,}', "auth token"),
        (r'(?:aws_access_key_id|aws_secret_access_key)\s*[=:]\s*["\']?[A-Za-z0-9/+=]{16,}', "AWS credential"),
        (r'-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----', "private key"),
        (r'sk-[A-Za-z0-9]{20,}', "OpenAI-style API key"),
        (r'ghp_[A-Za-z0-9]{36}', "GitHub personal access token"),
        (r'xox[bpras]-[A-Za-z0-9\-]{10,}', "Slack token"),
    ]

    for pattern, label in secret_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            return True, f"Possible {label} detected in code. Use environment variables instead."

    return False, ""


def _condition_cost_exceeded(rule: Rule, event: HookEvent) -> tuple[bool, str]:
    """Check if session cost exceeds budget (reads from .tribunal/state.json)."""
    cwd = event.cwd
    state_path = os.path.join(cwd, ".tribunal", "state.json")
    if not os.path.exists(state_path):
        return False, ""

    import json
    with open(state_path) as f:
        state = json.load(f)

    session_cost = state.get("session_cost_usd", 0.0)
    budget = state.get("cost_budget_usd", 0.0)

    if budget > 0 and session_cost > budget:
        return True, f"Session cost ${session_cost:.2f} exceeds budget ${budget:.2f}."

    return False, ""


def _condition_no_matching_test_ts(rule: Rule, event: HookEvent) -> tuple[bool, str]:
    """Block if writing a TypeScript source file with no corresponding test."""
    file_path = _extract_path(event)
    if not file_path:
        return False, ""

    if not (file_path.endswith(".ts") or file_path.endswith(".tsx")):
        return False, ""
    basename = os.path.basename(file_path)
    if ".test." in basename or ".spec." in basename:
        return False, ""
    if "/tests/" in file_path or "/__tests__/" in file_path or "/test/" in file_path:
        return False, ""

    module_name = basename.rsplit(".", 1)[0]
    ext = basename.rsplit(".", 1)[1]

    cwd = event.cwd
    test_patterns = [
        f"**/{module_name}.test.{ext}",
        f"**/{module_name}.spec.{ext}",
        f"**/__tests__/{module_name}.{ext}",
    ]

    # Simple existence check (not full glob, just common locations)
    file_dir = os.path.dirname(file_path)
    checks = [
        os.path.join(cwd, file_dir, f"{module_name}.test.{ext}"),
        os.path.join(cwd, file_dir, f"{module_name}.spec.{ext}"),
        os.path.join(cwd, file_dir, "__tests__", f"{module_name}.{ext}"),
        os.path.join(cwd, "tests", f"{module_name}.test.{ext}"),
        os.path.join(cwd, "test", f"{module_name}.test.{ext}"),
    ]

    for check in checks:
        if os.path.exists(check):
            return False, ""

    return True, f"No test file found for {file_path}. Write tests first (e.g. {module_name}.test.{ext})."


# Condition registry
_CONDITIONS: dict[str, Any] = {
    "no-matching-test": _condition_no_matching_test,
    "no-matching-test-ts": _condition_no_matching_test_ts,
    "contains-secret": _condition_contains_secret,
    "cost-exceeded": _condition_cost_exceeded,
}


# ── Default Rules ─────────────────────────────────────────────────────────────


def _default_rules() -> list[Rule]:
    """Built-in rules when no .tribunal/rules.yaml exists."""
    return [
        Rule(
            name="tdd-python",
            trigger="PreToolUse",
            match=RuleMatch(tool="FileEdit|FileWrite", path="*.py"),
            action="block",
            message="Write a failing test first.",
            condition="no-matching-test",
        ),
        Rule(
            name="no-secrets",
            trigger="PreToolUse",
            match=RuleMatch(tool="FileEdit|FileWrite"),
            action="block",
            message="Possible secret detected.",
            condition="contains-secret",
        ),
    ]
