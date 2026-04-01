"""Tribunal CLI — main entry point.

Commands:
  tribunal init       Set up hooks in the current project
  tribunal status     Show current rules and audit summary
  tribunal rules      List active rules
  tribunal audit      Show recent audit log entries
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
from pathlib import Path

import yaml

from . import __version__


# ── Config Templates ──────────────────────────────────────────────────────────

_CLAUDE_CONFIG = {
    "hooks": {
        "PreToolUse": [
            {
                "if": {"matcher": "FileEdit|FileWrite|Bash"},
                "run": [{"command": "tribunal-gate"}],
            }
        ],
        "PostToolUse": [
            {
                "if": {"matcher": "FileEdit|FileWrite|Bash"},
                "run": [{"command": "tribunal-gate"}],
            }
        ],
        "SessionStart": [
            {
                "run": [{"command": "tribunal-gate"}],
            }
        ],
    }
}

_DEFAULT_RULES = {
    "rules": {
        "tdd-python": {
            "trigger": "PreToolUse",
            "match": {"tool": "FileEdit|FileWrite", "path": "*.py"},
            "action": "block",
            "condition": "no-matching-test",
            "message": "Write a failing test first. Create tests/test_<module>.py before editing production code.",
        },
        "tdd-typescript": {
            "trigger": "PreToolUse",
            "match": {"tool": "FileEdit|FileWrite", "path": "*.ts"},
            "action": "block",
            "condition": "no-matching-test-ts",
            "message": "Write a failing test first. Create <module>.test.ts before editing production code.",
        },
        "no-secrets": {
            "trigger": "PreToolUse",
            "match": {"tool": "FileEdit|FileWrite"},
            "action": "block",
            "condition": "contains-secret",
            "message": "Possible secret/credential detected. Use environment variables instead.",
        },
    }
}


# ── Commands ──────────────────────────────────────────────────────────────────


def cmd_init(args: argparse.Namespace) -> int:
    """Set up Tribunal hooks in the current project."""
    project_dir = Path.cwd()

    # 1. Create .tribunal/ directory and rules.yaml
    tribunal_dir = project_dir / ".tribunal"
    tribunal_dir.mkdir(exist_ok=True)

    rules_path = tribunal_dir / "rules.yaml"
    if rules_path.exists() and not args.force:
        print(f"  ✓ Rules already exist at {rules_path.relative_to(project_dir)}")
    else:
        with open(rules_path, "w") as f:
            yaml.dump(_DEFAULT_RULES, f, default_flow_style=False, sort_keys=False)
        print(f"  ✓ Created {rules_path.relative_to(project_dir)}")

    # 2. Create/update .claude/claudeconfig.json
    claude_dir = project_dir / ".claude"
    claude_dir.mkdir(exist_ok=True)

    config_path = claude_dir / "claudeconfig.json"
    if config_path.exists():
        with open(config_path) as f:
            existing = json.load(f)
        # Merge hooks into existing config
        existing.setdefault("hooks", {})
        for event, hooks in _CLAUDE_CONFIG["hooks"].items():
            existing_hooks = existing["hooks"].get(event, [])
            # Check if tribunal-gate is already configured
            has_tribunal = any(
                "tribunal-gate" in str(h.get("run", []))
                for h in existing_hooks
            )
            if not has_tribunal:
                existing["hooks"][event] = existing_hooks + hooks
        with open(config_path, "w") as f:
            json.dump(existing, f, indent=2)
        print(f"  ✓ Updated {config_path.relative_to(project_dir)} (merged hooks)")
    else:
        with open(config_path, "w") as f:
            json.dump(_CLAUDE_CONFIG, f, indent=2)
        print(f"  ✓ Created {config_path.relative_to(project_dir)}")

    # 3. Create .tribunal/.gitkeep for version control
    gitkeep = tribunal_dir / ".gitkeep"
    if not gitkeep.exists():
        gitkeep.touch()

    # 4. Add audit log to .gitignore
    gitignore = project_dir / ".gitignore"
    ignore_line = ".tribunal/audit.jsonl"
    ignore_state = ".tribunal/state.json"
    if gitignore.exists():
        content = gitignore.read_text()
        additions = []
        if ignore_line not in content:
            additions.append(ignore_line)
        if ignore_state not in content:
            additions.append(ignore_state)
        if additions:
            with open(gitignore, "a") as f:
                f.write("\n# tribunal audit log (local only)\n")
                for line in additions:
                    f.write(line + "\n")
            print(f"  ✓ Added tribunal paths to .gitignore")
    else:
        with open(gitignore, "w") as f:
            f.write("# tribunal audit log (local only)\n")
            f.write(ignore_line + "\n")
            f.write(ignore_state + "\n")
        print(f"  ✓ Created .gitignore with tribunal exclusions")

    # 5. Check if tribunal-gate is on PATH
    if not shutil.which("tribunal-gate"):
        print()
        print("  ⚠  tribunal-gate not found on PATH.")
        print("     Make sure tribunal is installed: pip install tribunal")
        print()

    print()
    print("  ⚖  Tribunal initialized.")
    print()
    print("  Your Claude Code sessions now enforce:")
    print("    • TDD — tests required before production code")
    print("    • Secret scanning — no hardcoded credentials")
    print("    • Audit trail — all tool calls logged")
    print()
    print("  Customize rules in .tribunal/rules.yaml")
    print("  View audit log with: tribunal audit")
    return 0


def cmd_status(args: argparse.Namespace) -> int:
    """Show current Tribunal status."""
    project_dir = Path.cwd()
    rules_path = project_dir / ".tribunal" / "rules.yaml"
    config_path = project_dir / ".claude" / "claudeconfig.json"
    audit_path = project_dir / ".tribunal" / "audit.jsonl"

    print(f"\n  ⚖  Tribunal v{__version__}\n")

    # Check hooks
    if config_path.exists():
        with open(config_path) as f:
            config = json.load(f)
        hooks = config.get("hooks", {})
        hook_count = sum(len(v) for v in hooks.values())
        has_tribunal = "tribunal-gate" in json.dumps(hooks)
        if has_tribunal:
            print(f"  ✓ Hooks active — {hook_count} hook(s) in .claude/claudeconfig.json")
        else:
            print(f"  ⚠ Hooks exist but tribunal-gate not configured")
    else:
        print("  ✗ No .claude/claudeconfig.json — run: tribunal init")

    # Check rules
    if rules_path.exists():
        with open(rules_path) as f:
            data = yaml.safe_load(f) or {}
        rules = data.get("rules", {})
        enabled = sum(1 for r in rules.values() if isinstance(r, dict) and r.get("enabled", True))
        print(f"  ✓ {enabled} rule(s) active in .tribunal/rules.yaml")
        for name, rdef in rules.items():
            if isinstance(rdef, dict) and rdef.get("enabled", True):
                action = rdef.get("action", "block")
                icon = "⛔" if action == "block" else "⚠️" if action == "warn" else "📝"
                print(f"    {icon} {name}: {rdef.get('message', '')[:60]}")
    else:
        print("  ✗ No .tribunal/rules.yaml — run: tribunal init")

    # Audit summary
    if audit_path.exists():
        lines = audit_path.read_text().strip().split("\n")
        total = len(lines)
        blocked = sum(1 for l in lines if '"allowed":false' in l)
        print(f"  📋 {total} audit entries ({blocked} blocked)")
    else:
        print("  📋 No audit log yet")

    print()
    return 0


def cmd_rules(args: argparse.Namespace) -> int:
    """List active rules."""
    project_dir = Path.cwd()
    rules_path = project_dir / ".tribunal" / "rules.yaml"

    if not rules_path.exists():
        print("No rules found. Run: tribunal init")
        return 1

    with open(rules_path) as f:
        data = yaml.safe_load(f) or {}

    rules = data.get("rules", {})
    print(f"\n  ⚖  Tribunal Rules ({len(rules)} total)\n")

    for name, rdef in rules.items():
        if not isinstance(rdef, dict):
            continue
        enabled = rdef.get("enabled", True)
        action = rdef.get("action", "block")
        trigger = rdef.get("trigger", "?")
        match = rdef.get("match", {})
        condition = rdef.get("condition", "")
        message = rdef.get("message", "")

        status = "✓" if enabled else "✗"
        action_icon = "⛔" if action == "block" else "⚠️" if action == "warn" else "📝"

        print(f"  {status} {name}")
        print(f"    {action_icon} {action} on {trigger}")
        if match:
            print(f"    match: {json.dumps(match)}")
        if condition:
            print(f"    condition: {condition}")
        if message:
            print(f"    → {message[:80]}")
        print()

    return 0


def cmd_audit(args: argparse.Namespace) -> int:
    """Show recent audit log entries."""
    project_dir = Path.cwd()
    audit_path = project_dir / ".tribunal" / "audit.jsonl"

    if not audit_path.exists():
        print("No audit log yet. Start a Claude Code session with tribunal hooks active.")
        return 0

    lines = audit_path.read_text().strip().split("\n")
    count = args.count if hasattr(args, "count") else 20

    recent = lines[-count:]
    print(f"\n  📋 Audit Log (last {len(recent)} of {len(lines)} entries)\n")

    for line in recent:
        try:
            entry = json.loads(line)
            ts = entry.get("ts", "?")
            hook = entry.get("hook", "?")
            tool = entry.get("tool", "?")
            allowed = entry.get("allowed", True)
            path = entry.get("path", "")
            cmd = entry.get("command", "")

            icon = "✓" if allowed else "⛔"
            detail = path or cmd[:50] or ""

            print(f"  {icon} {ts} {hook:15s} {tool:12s} {detail}")
        except json.JSONDecodeError:
            continue

    print()
    return 0


# ── Main ──────────────────────────────────────────────────────────────────────


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="tribunal",
        description="Enterprise-grade discipline for Claude Code.",
    )
    parser.add_argument(
        "--version", action="version", version=f"tribunal {__version__}"
    )

    sub = parser.add_subparsers(dest="command")

    # init
    init_p = sub.add_parser("init", help="Set up Tribunal in the current project")
    init_p.add_argument("--force", action="store_true", help="Overwrite existing config")

    # status
    sub.add_parser("status", help="Show current Tribunal status")

    # rules
    sub.add_parser("rules", help="List active rules")

    # audit
    audit_p = sub.add_parser("audit", help="Show recent audit log")
    audit_p.add_argument("-n", "--count", type=int, default=20, help="Number of entries")

    args = parser.parse_args()

    if args.command == "init":
        sys.exit(cmd_init(args))
    elif args.command == "status":
        sys.exit(cmd_status(args))
    elif args.command == "rules":
        sys.exit(cmd_rules(args))
    elif args.command == "audit":
        sys.exit(cmd_audit(args))
    else:
        parser.print_help()
        sys.exit(0)
