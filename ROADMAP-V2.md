# Tribunal V2 Roadmap — From Tool to Platform

> Authored: April 2, 2026 · Based on architecture audit of Tribunal 0.7.0 + Claude Code v2.1.88 internals  
> Scope: 6 months · 6 phases · 4 workstreams  
> Status: **PHASES 5-8 COMPLETE — v1.1.0 shipped. 21 modules, 371 tests, full hook lifecycle + multi-agent governance.**

---

## Executive Summary

Tribunal 0.7.0 shipped 18 modules, 20 CLI commands, and 266 tests covering hooks, rules, cost governance, review agents, MCP, skills, memory, analytics, bundles, dashboards, and a marketplace. All four V1 roadmap phases are complete.

**V2 transforms Tribunal from a local CLI tool into a production-grade platform.** The V1 codebase has solid modular architecture but critical gaps in error handling, test coverage (30% of modules untested), state management (no file locking), and operational hardening. V2 addresses these while expanding into distribution, multi-agent governance, a VS Code extension, and a team analytics backend.

This roadmap is organized into **4 parallel workstreams** that can be staffed independently, with a **critical path** that must be executed in order.

---

## Architecture Assessment — What V1 Got Right and What Needs Work

### Strengths to Preserve

| Strength | Detail |
|----------|--------|
| **Minimal dependencies** | Only PyYAML — no framework lock-in, fast installs |
| **Clean module graph** | No circular deps. 11 of 18 modules are fully standalone |
| **Protocol-agnostic hooks** | JSON stdin/stdout works with any editor, not just Claude Code |
| **Config cascade** | 4-level resolution (default → user → project → managed) with enterprise override |
| **Extension points** | MCP server, skill system, plugin manifests all follow Claude Code conventions |

### Critical Technical Debt

| Issue | Severity | Impact | Module |
|-------|----------|--------|--------|
| **Silent fail-open on errors** | 🔴 HIGH | Gate exits 0 (allow) on any exception — malformed events bypass all rules | `gate.py:17` |
| **No file locking on state.json** | 🔴 HIGH | Concurrent Claude Code sessions corrupt cost data (last-write-wins) | `cost.py` |
| **Unbounded audit log** | 🟡 MEDIUM | `.tribunal/audit.jsonl` grows without limit — disk exhaustion on long projects | `audit.py` |
| **No config schema validation** | 🟡 MEDIUM | Malformed YAML returns empty defaults silently — misconfigs go undetected | `config.py` |
| **Memory limits not enforced** | 🟡 MEDIUM | Code claims 200 file / 25KB limits but never checks or enforces them | `memory.py` |
| **Review spec agent is a stub** | 🟡 MEDIUM | `_review_spec()` is a TODO placeholder — marketed feature doesn't work | `review.py` |
| **Missing tool = silent skip** | 🟡 MEDIUM | If eslint/ruff/tsc not installed, rules pass silently instead of warning | `rules.py:308` |
| **CLI monolith** | 🟢 LOW | 800 LOC single file with 20+ subcommands — maintainability risk | `cli.py` |
| **No type annotations** | 🟢 LOW | Internal dicts used for config — TypedDict/dataclass would catch key errors | Various |
| **30% modules untested** | 🟢 LOW | protocol, gate, audit, memory, analytics, airgap, dashboard, cli untested | `tests/` |

---

## Integration Surface — Untapped Claude Code Capabilities

Claude Code v2.1.88 exposes significantly more than Tribunal currently uses. This table maps what's available vs. what V1 leverages.

### Hook Events (28 available, 3 used)

| Hook Event | V1 Status | V2 Opportunity |
|------------|-----------|----------------|
| `PreToolUse` | ✅ Used | Gate rules, block tool calls |
| `PostToolUse` | ✅ Used | Audit logging |
| `SessionStart` | ✅ Used | Bootstrap initialization |
| `PostToolUseFailure` | ❌ Unused | Track tool failures, detect flaky patterns |
| `SessionEnd` | ❌ Unused | Session summary, cost finalization, analytics flush |
| `SubagentStart` / `SubagentStop` | ❌ Unused | Multi-agent governance — enforce policies on sub-agents |
| `TaskCreated` / `TaskCompleted` | ❌ Unused | Task-level cost tracking, progress audit |
| `FileChanged` | ❌ Unused | Real-time file monitoring without polling |
| `CwdChanged` | ❌ Unused | Detect project context switches mid-session |
| `PermissionRequest` / `PermissionDenied` | ❌ Unused | Permission escalation tracking, compliance audit |
| `PreCompact` / `PostCompact` | ❌ Unused | Context window management awareness |
| `ConfigChange` | ❌ Unused | Detect settings tampering during session |
| `TeammateIdle` | ❌ Unused | Team coordination, idle cost detection |
| `Stop` / `StopFailure` | ❌ Unused | Graceful shutdown, cleanup triggers |

### MCP Capabilities (7 transports, 1 used)

| Capability | V1 Status | V2 Opportunity |
|------------|-----------|----------------|
| stdio transport | ✅ Used | `tribunal-mcp` server |
| Resource subscriptions | ❌ Unused | Push rule updates to Claude without restart |
| Prompts integration | ❌ Unused | Register Tribunal prompts in Claude's prompt library |
| Sampling API | ❌ Unused | Let Tribunal request Claude to analyze audit data |
| SSE / WebSocket transport | ❌ Unused | Remote/team MCP server for shared governance |

### Memory System (4 types, 1 used)

| Memory Type | V1 Status | V2 Opportunity |
|-------------|-----------|----------------|
| `project` | ✅ Used | Rule injection |
| `user` | ❌ Unused | User-specific coding preferences, past violations |
| `feedback` | ❌ Unused | Learning from blocked actions — Why/How patterns |
| `reference` | ❌ Unused | Link to external compliance docs, Jira tickets |

### Cost Metrics (extended fields unused)

| Metric | V1 Status | V2 Opportunity |
|--------|-----------|----------------|
| `costUSD` per model | ✅ Used | Budget enforcement |
| `cacheReadInputTokens` | ❌ Unused | Cache efficiency analytics |
| `cacheCreationInputTokens` | ❌ Unused | Cache cost attribution |
| `webSearchRequests` | ❌ Unused | Web search cost governance |
| `totalLinesAdded` / `Removed` | ❌ Unused | Code churn metrics, velocity tracking |
| `totalAPIDuration` | ❌ Unused | Latency profiling |
| `totalToolDuration` | ❌ Unused | Tool efficiency analytics |

---

## V2 Roadmap — 6 Phases, 4 Workstreams

### Workstream Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     TRIBUNAL V2 WORKSTREAMS                     │
│                                                                 │
│  W1: HARDEN         W2: DISTRIBUTE      W3: EXPAND             │
│  ─────────          ──────────────       ─────────              │
│  Error handling     PyPI publish         28 hook events         │
│  File locking       GitHub Actions CI    Multi-agent gov        │
│  Log rotation       Homebrew/pipx        VS Code extension      │
│  Schema validation  Docker image         Team dashboard         │
│  Test coverage      Docs site            Cross-editor adapters  │
│  Type annotations   SDK / API            Rule packs             │
│                                                                 │
│                     W4: GROW                                    │
│                     ─────────                                   │
│                     Community rules                             │
│                     Conference talks                            │
│                     Blog content                                │
│                     Partner integrations                        │
│                     Enterprise pilots                           │
└─────────────────────────────────────────────────────────────────┘
```

### Critical Path (must execute in order)

```
Phase 5 (Harden) → Phase 6 (Ship) → Phase 7 (Hooks Expansion)
                                   → Phase 8 (Multi-Agent)
                                   → Phase 9 (VS Code + Dashboard)
                                   → Phase 10 (Ecosystem)
```

Phase 5 and 6 are **blockers** — you cannot ship to PyPI with silent fail-open bugs or 30% untested modules. Phases 7-10 can run in parallel after Phase 6.

---

### Phase 5: Harden (Workstream W1)

**Goal:** Fix all critical technical debt. Make Tribunal production-safe before public release.

**Milestone:** Every module tested, all HIGH severity bugs fixed, CI green.

#### 5.1 — Fix Fail-Open Gate (P0 — Safety Critical)

The gate currently catches all exceptions and exits 0, silently allowing everything when errors occur. This is the single most dangerous bug.

```python
# CURRENT (gate.py:17) — DANGEROUS
try:
    event = read_hook_event()
except Exception as e:
    sys.stderr.write(f"tribunal: failed to parse hook event: {e}\n")
    sys.exit(0)  # ← Allows EVERYTHING on error

# FIXED — Fail-closed with configurable behavior
try:
    event = read_hook_event()
except json.JSONDecodeError as e:
    sys.stderr.write(f"tribunal: malformed hook JSON: {e}\n")
    sys.exit(2)  # ← BLOCK on parse errors (fail-closed)
except Exception as e:
    policy = os.environ.get("TRIBUNAL_FAIL_MODE", "closed")
    sys.stderr.write(f"tribunal: hook error: {e}\n")
    sys.exit(2 if policy == "closed" else 0)
```

**Tasks:**
- [ ] Change gate.py default to fail-closed (exit 2 on error)
- [ ] Add `TRIBUNAL_FAIL_MODE` env var (values: `closed`, `open`) for enterprise override
- [ ] Add specific exception handling: `json.JSONDecodeError`, `KeyError`, `FileNotFoundError`
- [ ] Log all errors to audit trail before exiting
- [ ] Write tests for every error path

#### 5.2 — Atomic State Writes + File Locking (P0)

Concurrent Claude Code sessions writing to `.tribunal/state.json` will corrupt data.

```python
# Implementation: atomic write with advisory locking
import fcntl
import tempfile

def atomic_write_json(path: Path, data: dict) -> None:
    """Write JSON atomically with advisory file locking."""
    lock_path = path.with_suffix(".lock")
    with open(lock_path, "w") as lock_fd:
        fcntl.flock(lock_fd, fcntl.LOCK_EX)
        try:
            with tempfile.NamedTemporaryFile(
                mode="w", dir=path.parent, suffix=".tmp", delete=False
            ) as tmp:
                json.dump(data, tmp, indent=2)
                tmp.flush()
                os.fsync(tmp.fileno())
                tmp_path = tmp.name
            os.replace(tmp_path, path)  # atomic on POSIX
        finally:
            fcntl.flock(lock_fd, fcntl.LOCK_UN)
```

**Tasks:**
- [ ] Create `tribunal/io.py` with `atomic_write_json()` and `locked_read_json()`
- [ ] Migrate `cost.py`, `config.py`, `marketplace.py` to use atomic writes
- [ ] Add Windows support via `msvcrt.locking()` fallback
- [ ] Write concurrent write test with threading

#### 5.3 — Audit Log Rotation (P1)

```python
# Implementation: rotate at 10MB, keep 5 archived logs
def rotate_audit_log(audit_path: Path, max_bytes: int = 10_000_000, keep: int = 5):
    if not audit_path.exists() or audit_path.stat().st_size < max_bytes:
        return
    for i in range(keep - 1, 0, -1):
        src = audit_path.with_suffix(f".{i}.jsonl")
        dst = audit_path.with_suffix(f".{i+1}.jsonl")
        if src.exists():
            src.rename(dst)
    audit_path.rename(audit_path.with_suffix(".1.jsonl"))
```

**Tasks:**
- [ ] Add `rotate_audit_log()` to `audit.py`
- [ ] Call rotation check in `log_event()` before writing
- [ ] Make max size and retention count configurable in `config.yaml`
- [ ] Add `tribunal audit rotate` CLI command for manual rotation
- [ ] Add `tribunal audit stats` showing log size and entry count

#### 5.4 — Config Schema Validation (P1)

```python
# Implementation: validate config.yaml against expected schema
CONFIG_SCHEMA = {
    "rules": {"type": dict, "values": {
        "trigger": {"type": str, "enum": ["PreToolUse", "PostToolUse"]},
        "match": {"type": dict},
        "condition": {"type": str},
        "action": {"type": str, "enum": ["block", "warn", "log"]},
        "message": {"type": str},
    }},
    "budget": {"type": dict, "keys": {"session", "daily"}},
    "model_routing": {"type": dict},
}

def validate_config(config: dict) -> list[str]:
    """Return list of validation errors. Empty = valid."""
    errors = []
    for key in config:
        if key not in CONFIG_SCHEMA:
            errors.append(f"Unknown config key: '{key}'")
    # ... type checks, enum validation, nested validation
    return errors
```

**Tasks:**
- [ ] Add `validate_config()` to `config.py`
- [ ] Validate on load — log warnings for unknown keys, error for invalid types
- [ ] Add `tribunal config validate` CLI command
- [ ] Create JSON Schema file for editor autocompletion
- [ ] Test with malformed YAML, missing required fields, wrong types

#### 5.5 — Memory Limit Enforcement (P1)

**Tasks:**
- [ ] Add file count check before writing (cap at 200)
- [ ] Add file size check before writing (cap at 25KB)
- [ ] Implement LRU eviction when at capacity (oldest Tribunal memory removed)
- [ ] Add `tribunal memory stats` showing count/size/capacity
- [ ] Test boundary conditions (199, 200, 201 files; 24KB, 25KB, 26KB)

#### 5.6 — Missing Tool Detection (P1)

```python
# CURRENT (rules.py:308) — Silent skip
except FileNotFoundError:
    return False, ""  # Command not found = silent pass

# FIXED — Warn and optionally block
except FileNotFoundError:
    msg = f"Rule '{rule.name}' requires '{cmd}' but it's not installed"
    sys.stderr.write(f"tribunal: WARNING: {msg}\n")
    audit.log_event({"warning": msg, "rule": rule.name})
    if rule.require_tool:
        return True, msg  # Block if rule says tool is required
    return False, msg
```

**Tasks:**
- [ ] Add `require_tool: true/false` field to rule schema (default: false)
- [ ] Emit warning to stderr when tools are missing
- [ ] Log missing tool warnings to audit trail
- [ ] Add `tribunal doctor` command that checks all rule dependencies are installed

#### 5.7 — Test Coverage to 90%+ (P0)

| Module | Tests Needed |
|--------|-------------|
| `protocol.py` | JSON parsing, malformed input, field extraction, edge cases |
| `gate.py` | End-to-end: stdin → evaluate → stdout, error paths, fail-closed |
| `audit.py` | JSONL write, rotation, concurrent append, path extraction |
| `memory.py` | Inject, list, clear, limit enforcement, malformed frontmatter |
| `analytics.py` | Trend detection, anomaly detection, empty data, edge cases |
| `airgap.py` | Create, export, import, validate, corrupted bundles |
| `dashboard.py` | Stats computation, HTML generation, empty audit logs |
| `cli.py` | Subcommand dispatch, argument parsing, error messages |

**Tasks:**
- [ ] Write tests for every untested module (target: 400+ total tests)
- [ ] Add negative path tests (malformed input, missing files, permission errors)
- [ ] Add concurrent write tests for state.json
- [ ] Add integration test: full hook flow (stdin → gate → rules → audit → stdout)
- [ ] Add CI fixture for config cascade resolution

#### 5.8 — Type Annotations (P2)

**Tasks:**
- [ ] Add TypedDict definitions for config structures
- [ ] Add return type annotations to all public functions
- [ ] Add mypy to CI with `--strict` mode
- [ ] Create `py.typed` marker for PEP 561 compliance

**Phase 5 Exit Criteria:**
- ✅ gate.py fails closed on errors
- ✅ state.json uses atomic writes with locking
- ✅ Audit logs rotate at 10MB
- ✅ Config validates against schema on load
- ✅ Memory limits enforced
- ✅ Missing tools emit warnings
- ✅ 400+ tests, 90%+ module coverage
- ✅ Zero HIGH severity issues remaining

---

### Phase 6: Ship (Workstream W2)

**Goal:** Make Tribunal installable by anyone in the world. Production CI/CD pipeline.

**Milestone:** `pip install tribunal` works. Every push runs tests. Tags auto-publish.

#### 6.1 — PyPI Publication (P0)

**Tasks:**
- [ ] Reserve `tribunal` name on PyPI (or choose `tribunal-ai` if taken)
- [ ] Create PyPI API token, store as GitHub secret `PYPI_API_TOKEN`
- [ ] Configure `pyproject.toml` with classifiers, URLs, license metadata
- [ ] Test build: `python -m build && twine check dist/*`
- [ ] Publish v1.0.0 (bump from 0.7.0 — V2 harden phase makes it prod-ready)

#### 6.2 — GitHub Actions CI/CD (P0)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        python-version: ["3.10", "3.11", "3.12", "3.13"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
      - run: pip install -e ".[dev]"
        working-directory: tribunal
      - run: pytest tests/ -v --tb=short
        working-directory: tribunal
      - run: mypy src/tribunal/ --strict
        working-directory: tribunal

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install ruff
      - run: ruff check tribunal/src/

  publish:
    needs: [test, lint]
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    permissions:
      id-token: write  # trusted publishing
    steps:
      - uses: actions/checkout@v4
      - run: pip install build
      - run: python -m build
        working-directory: tribunal
      - uses: pypa/gh-action-pypi-publish@release/v1
        with:
          packages-dir: tribunal/dist/
```

**Tasks:**
- [ ] Create `.github/workflows/ci.yml` (test matrix: 4 Python versions × 3 OS)
- [ ] Create `.github/workflows/publish.yml` (triggered on version tags)
- [ ] Add `[project.optional-dependencies] dev = ["pytest", "mypy", "ruff"]`
- [ ] Configure PyPI trusted publishing (no API key needed)
- [ ] Add CI badge to README.md

#### 6.3 — Website Build CI (P1)

```yaml
# .github/workflows/website.yml
name: Website
on:
  push:
    branches: [main]
    paths: [src/**, public/**, package.json]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npx next build
      - run: npx eslint src/
```

**Tasks:**
- [ ] Create website CI workflow
- [ ] Add Cloudflare Pages deployment (via Wrangler action or Cloudflare GitHub integration)
- [ ] Add Lighthouse CI for performance regression detection

#### 6.4 — Distribution Channels (P2)

**Tasks:**
- [ ] Create Homebrew formula: `brew install tribunal`
- [ ] Document pipx installation: `pipx install tribunal`
- [ ] Create Docker image: `docker run ghcr.io/thebotclub/tribunal init`
- [ ] Publish to conda-forge for data science teams
- [ ] Create install script: `curl -fsSL https://tribunal.dev/install.sh | sh`

#### 6.5 — Documentation Site (P1)

**Tasks:**
- [ ] Create `/docs` directory with MkDocs or Starlight
- [ ] Write getting-started guide (install → init → first blocked action)
- [ ] Write rule authoring guide with examples for each condition type
- [ ] Write MCP server setup guide
- [ ] Write enterprise deployment guide (managed policies, fleet config)
- [ ] Write migration guide from other tools
- [ ] API reference auto-generated from docstrings
- [ ] Deploy to docs.tribunal.dev (Cloudflare Pages subdomain)

**Phase 6 Exit Criteria:**
- ✅ `pip install tribunal` installs v1.0.0 from PyPI
- ✅ Every push runs tests on 3 OS × 4 Python versions
- ✅ Version tags auto-publish to PyPI
- ✅ Website builds and deploys on merge to main
- ✅ Documentation site live at docs.tribunal.dev

---

### Phase 7: Hook Expansion (Workstream W3a)

**Goal:** Use all 28 Claude Code hook events. Tribunal sees everything.

**Milestone:** Full session lifecycle coverage — from start to end, including sub-agents.

#### 7.1 — Session Lifecycle Hooks (P0)

| Hook | Purpose | Tribunal Action |
|------|---------|----------------|
| `SessionEnd` | Session completed | Flush analytics, write session summary to memory, finalize cost |
| `PostToolUseFailure` | Tool call failed | Track failure patterns, detect flaky tools, alert on repeated failures |
| `FileChanged` | File modified on disk | Real-time monitoring without `PostToolUse` — catches external changes |
| `CwdChanged` | Working directory changed | Detect project context switches, load new project rules |
| `ConfigChange` | Settings modified | Detect tampering — alert if hooks/permissions changed mid-session |

**Tasks:**
- [ ] Update `tribunal init` to register all lifecycle hooks in `claudeconfig.json`
- [ ] Add `SessionEnd` handler: flush pending analytics, write session summary
- [ ] Add `PostToolUseFailure` handler: track failure rates per tool
- [ ] Add `FileChanged` handler: run rules on external file changes
- [ ] Add `CwdChanged` handler: reload rules for new project context
- [ ] Add `ConfigChange` handler: alert on unauthorized config modifications
- [ ] Update protocol.py to handle new event types

#### 7.2 — Permission Audit Trail (P1)

| Hook | Purpose | Tribunal Action |
|------|---------|----------------|
| `PermissionRequest` | Claude asked for permission | Log what was requested and why |
| `PermissionDenied` | Permission was denied | Track denied actions for compliance reporting |

**Tasks:**
- [ ] Add permission event logging to audit trail
- [ ] Create `tribunal audit permissions` command showing permission history
- [ ] Add permission escalation detection (deny → subsequent allow = escalation)
- [ ] Generate compliance report: "Actions requested vs. actions allowed"

#### 7.3 — Compact Awareness (P2)

| Hook | Purpose | Tribunal Action |
|------|---------|----------------|
| `PreCompact` | Context about to be compacted | Save critical Tribunal state to memory before compaction |
| `PostCompact` | Context was compacted | Re-inject essential rules after context loss |

**Tasks:**
- [ ] Add compact handlers that persist Tribunal state across context compactions
- [ ] Re-inject active rules and budget status after compaction
- [ ] Track compaction frequency for session complexity analytics

**Phase 7 Exit Criteria:**
- ✅ All 28 hook events handled (15 actively processed, 13 logged-only)
- ✅ Full session lifecycle: start → tools → failures → files → cwd → config → compact → end
- ✅ Permission audit trail with escalation detection
- ✅ Zero events "unknown" in audit log

---

### Phase 8: Multi-Agent Governance (Workstream W3b)

**Goal:** Enforce policies across Claude Code's coordinator mode — main agent + sub-agents.

**Milestone:** Every sub-agent runs under Tribunal's rules. Cross-agent cost budgets. Task-level tracking.

This is the **highest-value differentiator**. No other tool governs multi-agent AI sessions.

#### 8.1 — Sub-Agent Lifecycle Tracking (P0)

```
COORDINATOR SESSION
├── MainAgent (session_abc)
│   ├── SubAgent-1 (task_001) — "Research API docs"
│   │   └── tools: WebSearch ×3, Read ×5
│   ├── SubAgent-2 (task_002) — "Write implementation"
│   │   └── tools: FileEdit ×12, Bash ×3
│   └── SubAgent-3 (task_003) — "Write tests"
│       └── tools: FileEdit ×8, Bash ×5
└── TRIBUNAL
    ├── Per-agent cost tracking
    ├── Per-agent rule enforcement
    ├── Cross-agent budget (shared pool)
    └── Task completion audit
```

**Tasks:**
- [ ] Handle `SubagentStart` / `SubagentStop` hooks
- [ ] Handle `TaskCreated` / `TaskCompleted` hooks
- [ ] Create per-agent audit trails (separate JSONL per task ID)
- [ ] Track cost per sub-agent with shared session budget
- [ ] Add `tribunal status --agents` showing all active sub-agents and their costs

#### 8.2 — Cross-Agent Policy Enforcement (P0)

```yaml
# .tribunal/config.yaml — Multi-agent policies
multi_agent:
  max_concurrent_agents: 3
  per_agent_budget: 1.00            # Each sub-agent capped at $1
  shared_session_budget: 5.00       # Total across all agents
  agent_permissions:
    research:                        # Agents with "research" in task description
      allow: [WebSearch, Read, Grep]
      deny: [FileEdit, Bash]         # Research agents can't modify code
    implementation:
      allow: [FileEdit, Bash, Read]
      deny: [WebSearch]              # Implementation agents stay focused
```

**Tasks:**
- [ ] Add `multi_agent` section to config schema
- [ ] Implement per-agent budget tracking with shared pool
- [ ] Implement task-description-based permission matching
- [ ] Add `max_concurrent_agents` enforcement
- [ ] Create `tribunal agents` command showing agent tree with costs

#### 8.3 — Task-Level Analytics (P1)

**Tasks:**
- [ ] Track time per task, cost per task, tools per task
- [ ] Add task efficiency metrics (cost per line of code, time per file)
- [ ] Generate per-task reports in dashboard
- [ ] Add task dependency tracking (which agent blocked on which)

#### 8.4 — Agent Communication Monitoring (P2)

**Tasks:**
- [ ] Monitor `TeammateIdle` events for idle cost detection
- [ ] Track inter-agent message patterns
- [ ] Detect agent loops (same tool called repeatedly with no progress)
- [ ] Alert on runaway agents (cost or time threshold without task completion)

**Phase 8 Exit Criteria:**
- ✅ Sub-agent lifecycle fully tracked (start → tools → end)
- ✅ Per-agent cost budgets enforced
- ✅ Task-description-based permissions working
- ✅ `tribunal agents` shows live agent tree
- ✅ Dashboard shows per-agent analytics

---

### Phase 9: VS Code Extension + Team Dashboard (Workstream W3c)

**Goal:** Bring Tribunal into the editor where developers live, and give teams a shared view.

**Milestone:** VS Code sidebar shows rules, audit, cost. Team dashboard aggregates across members.

#### 9.1 — VS Code Extension (P0)

```
┌──────────────────────────────────────────────┐
│ TRIBUNAL                              [gear] │
├──────────────────────────────────────────────┤
│ ▸ Status                                     │
│   ● 5 rules active                           │
│   ● Budget: $1.23 / $5.00 (24%)             │
│   ● Session: 47 tool calls, 2 blocked        │
│                                              │
│ ▸ Rules                                      │
│   ✓ tdd-python          active               │
│   ✓ no-secrets          active               │
│   ✓ cost-budget         active ($5/session)  │
│   ○ lint-check          disabled              │
│   ○ type-check          disabled              │
│                                              │
│ ▸ Recent Audit                               │
│   ⛔ 14:32 FileEdit blocked (no test)        │
│   ✅ 14:33 FileEdit allowed (test exists)    │
│   ✅ 14:33 Bash allowed (pytest)             │
│   ⚠️ 14:35 Cost warning ($4.50/$5.00)       │
│                                              │
│ ▸ Cost                                       │
│   ████████░░░░ 67% of session budget          │
│   Today: $3.45  |  Weekly: $18.20            │
│   Trend: ↗ rising (15% above average)        │
│                                              │
│ ▸ Agents (coordinator mode)                  │
│   ├ Agent-1: Research    $0.34  ✅            │
│   ├ Agent-2: Implement   $0.89  🔄           │
│   └ Agent-3: Test        $0.12  🔄           │
└──────────────────────────────────────────────┘
```

**Tasks:**
- [ ] Scaffold VS Code extension: `yo code --type ext-webview`
- [ ] Create TreeView provider for rules, audit, and cost
- [ ] Add status bar item showing budget usage
- [ ] Add file system watcher on `.tribunal/audit.jsonl` for live updates
- [ ] Add file system watcher on `.tribunal/state.json` for cost updates
- [ ] Add webview panel for detailed analytics charts
- [ ] Add command palette: "Tribunal: Show Status", "Tribunal: Toggle Rule"
- [ ] Add CodeLens on test files showing Tribunal gate status
- [ ] Publish to VS Code Marketplace: `ext install thebotclub.tribunal`

#### 9.2 — Team Dashboard Backend (P1)

The tribunal.dev website already runs on Cloudflare Pages. Add a Cloudflare Workers backend for team analytics.

```
┌─────────────────────────────────────────────────┐
│          TRIBUNAL TEAM DASHBOARD                │
│          team.tribunal.dev                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  Team Cost This Week              $142.38       │
│  ████████████████░░░░░░░  72% of weekly budget  │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │  Member       Sessions  Cost    Blocks   │   │
│  │  ────────     ────────  ────    ──────   │   │
│  │  alice        12        $45.20  23       │   │
│  │  bob          8         $38.90  45       │   │
│  │  charlie      15        $58.28  12       │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  Top Blocked Rules                              │
│  1. no-matching-test    56 blocks (62%)         │
│  2. contains-secret     18 blocks (20%)         │
│  3. cost-exceeded       16 blocks (18%)         │
│                                                 │
│  Violation Trend (30 days)                      │
│  ▂▃▅▆▅▃▂▂▃▄▅▆▇▅▃▂▁▂▃▄▅▆▅▄▃▂▂▃▄                │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Architecture:**

```
Developer laptops                 Cloud
┌────────────┐                   ┌──────────────────────┐
│ tribunal   │ ──audit sync──→   │ Cloudflare Workers   │
│ (local)    │                   │ ┌──────────────────┐ │
│            │ ←─config pull──   │ │ /api/audit       │ │
└────────────┘                   │ │ /api/cost        │ │
                                 │ │ /api/team        │ │
                                 │ └────────┬─────────┘ │
                                 │          │           │
                                 │ ┌────────┴─────────┐ │
                                 │ │ Cloudflare D1    │ │
                                 │ │ (SQLite at edge) │ │
                                 │ └──────────────────┘ │
                                 │                      │
                                 │ ┌──────────────────┐ │
                                 │ │ Dashboard UI     │ │
                                 │ │ team.tribunal.dev│ │
                                 │ └──────────────────┘ │
                                 └──────────────────────┘
```

**Tasks:**
- [ ] Create Cloudflare Workers API: `/api/audit`, `/api/cost`, `/api/team`
- [ ] Create Cloudflare D1 schema: team members, sessions, cost data, audit events
- [ ] Add `tribunal sync push` command: upload anonymized audit data to team API
- [ ] Add `tribunal sync pull` command: download team config/rules
- [ ] Build dashboard UI with charts (sessions, costs, violations over time)
- [ ] Add authentication: team invite links with API keys
- [ ] Add data retention policy (90 days default)
- [ ] Deploy to team.tribunal.dev

**Phase 9 Exit Criteria:**
- ✅ VS Code extension published with sidebar panel
- ✅ Team dashboard live at team.tribunal.dev
- ✅ Audit data syncs from local → cloud
- ✅ Team cost aggregation working
- ✅ 30-day violation trend charts rendering

---

### Phase 10: Ecosystem (Workstream W4)

**Goal:** Build community, expand beyond Claude Code, create network effects.

**Milestone:** 1000+ PyPI downloads/month. 5+ community rule packs. 2+ editor adapters.

#### 10.1 — Pre-Built Rule Packs (P0)

| Pack | Rules | Target Audience |
|------|-------|----------------|
| `tribunal-soc2` | Audit logging, access control, secret prevention, change tracking | Compliance teams |
| `tribunal-startup` | Light TDD, basic cost limits, fast iteration mode | Early-stage teams |
| `tribunal-junior` | Strict TDD, verbose warnings, learning-oriented messages | Junior developers |
| `tribunal-security` | OWASP checks, dependency scanning, secret detection, CSP headers | Security teams |
| `tribunal-ml` | Notebook discipline, data pipeline testing, GPU cost limits | ML engineers |
| `tribunal-oss` | License checking, contributing guide enforcement, changelog updates | Open source maintainers |

**Tasks:**
- [ ] Create `tribunal-packs` repository with curated rule sets
- [ ] Add `tribunal install pack <name>` command
- [ ] Each pack: rules.yaml + skills/ + README with rationale
- [ ] Publish packs to PyPI as `tribunal-pack-soc2`, etc.
- [ ] Add pack showcase to docs.tribunal.dev

#### 10.2 — Cross-Editor Adapters (P1)

Tribunal's hook protocol is JSON stdin/stdout — editor-agnostic by design. But each editor needs a thin adapter layer.

| Editor | Adapter Approach | Priority |
|--------|-----------------|----------|
| **Cursor** | Custom extension or `.cursor/rules` integration | P1 |
| **Windsurf** | Codeium's extension API | P2 |
| **Aider** | `.aider.conf.yml` hooks | P2 |
| **Continue.dev** | Custom MCP tool provider | P2 |
| **Cline** | VS Code extension settings | P2 |

**Tasks:**
- [ ] Abstract hook protocol into `tribunal.adapters` module
- [ ] Create Cursor adapter: translate Cursor tool calls to Tribunal hook events
- [ ] Create Aider adapter: integrate with aider's pre/post-command hooks
- [ ] Create generic adapter for any tool that supports stdin/stdout hooks
- [ ] Document adapter creation for community contributors

#### 10.3 — SDK / Programmatic API (P1)

```python
# For teams building custom integrations
from tribunal import Tribunal

t = Tribunal(project_dir="/path/to/project")

# Evaluate a tool call programmatically
result = t.evaluate(
    tool="FileEdit",
    input={"path": "src/main.py", "new_string": "..."},
    trigger="PreToolUse"
)
print(result.allowed)    # True/False
print(result.reason)     # "No matching test file"
print(result.rule_name)  # "tdd-python"

# Query cost
cost = t.get_cost()
print(cost.session_usd)  # 1.23
print(cost.budget_remaining)  # 3.77

# Stream audit events
for event in t.audit_stream():
    print(event.tool, event.verdict, event.timestamp)
```

**Tasks:**
- [ ] Create `tribunal.api` module with `Tribunal` class
- [ ] Expose all module functionality through clean Python API
- [ ] Add async support for audit streaming
- [ ] Write SDK documentation with examples
- [ ] Publish separate `tribunal-sdk` package for lightweight imports

#### 10.4 — Community & Growth (P2)

**Tasks:**
- [ ] Create GitHub Discussions for community support
- [ ] Write blog posts: "Why Your AI Coding Agent Needs Discipline"
- [ ] Create demo video: 3-minute Tribunal setup and first blocked action
- [ ] Submit to Awesome Claude Code lists
- [ ] Present at AI engineering meetups / conferences
- [ ] Create contributor guide with "good first issue" labels
- [ ] Set up Discord or Slack community channel

**Phase 10 Exit Criteria:**
- ✅ 3+ rule packs published to PyPI
- ✅ 1+ cross-editor adapter working (Cursor priority)
- ✅ SDK package published with docs
- ✅ Community channels active
- ✅ 1000+ monthly PyPI downloads

---

## Timeline & Milestones

```
2026
Apr    May    Jun    Jul    Aug    Sep    Oct
│      │      │      │      │      │      │
├──────┤      │      │      │      │      │
│ P5   │      │      │      │      │      │
│Harden│      │      │      │      │      │
│      ├──────┤      │      │      │      │
│      │ P6   │      │      │      │      │
│      │ Ship │      │      │      │      │
│      │      ├──────┤      │      │      │
│      │      │ P7   │      │      │      │
│      │      │Hooks │      │      │      │
│      │      ├──────┼──────┤      │      │
│      │      │ P8 Multi-   │      │      │
│      │      │ Agent Gov   │      │      │
│      │      │      ├──────┼──────┤      │
│      │      │      │ P9 VS Code │      │
│      │      │      │ + Dashboard│      │
│      │      │      │      ├──────┼──────┤
│      │      │      │      │P10 Ecosystem│
│      │      │      │      │      │      │
▼      ▼      ▼      ▼      ▼      ▼      ▼

KEY MILESTONES:
  🔒 Apr 30 — Phase 5 done (all HIGH bugs fixed, 400+ tests)
  📦 May 31 — Phase 6 done (PyPI live, CI green)
  🎯 Jun 30 — Phase 7 done (28 hook events, full lifecycle)
  🤖 Jul 31 — Phase 8 done (multi-agent governance)
  🖥️ Aug 31 — Phase 9 done (VS Code extension + team dashboard)
  🌍 Sep 30 — Phase 10 done (rule packs, adapters, community)
```

---

## Version Strategy

| Version | Phase | Headline |
|---------|-------|----------|
| **1.0.0** | P5 + P6 | Production-ready. PyPI published. CI green. Fail-closed. |
| **1.1.0** | P7 | Full hook lifecycle. 28 events. Permission audit. |
| **1.2.0** | P8 | Multi-agent governance. Sub-agent budgets. Task tracking. |
| **2.0.0** | P9 | VS Code extension. Team dashboard. Cloud sync. |
| **2.1.0** | P10 | Rule packs. Cross-editor. SDK. Ecosystem. |

---

## Success Metrics

| Metric | Current (v0.7.0) | Target (v1.0.0) | Target (v2.0.0) |
|--------|-------------------|------------------|------------------|
| **Test count** | 266 | 400+ | 600+ |
| **Module coverage** | 70% | 95% | 98% |
| **Hook events used** | 3 / 28 | 15 / 28 | 28 / 28 |
| **PyPI downloads/mo** | 0 | 100+ | 1,000+ |
| **Rule packs** | 0 | 0 | 5+ |
| **Editor support** | Claude Code only | Claude Code | +Cursor, +Aider |
| **GitHub stars** | — | 50+ | 500+ |
| **VS Code installs** | 0 | 0 | 100+ |
| **Team dashboard users** | 0 | 0 | 10+ teams |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Claude Code changes hook protocol | Medium | High | Pin to known-good versions. Abstract protocol layer. |
| `tribunal` name taken on PyPI | Low | Medium | Fallback: `tribunal-ai` or `tribunal-dev` |
| VS Code extension rejected from marketplace | Low | Low | Self-host vsix, distribute via GitHub Releases |
| Multi-agent governance adds too much latency | Medium | Medium | Async audit (log post-facto), only gate on high-risk tools |
| Teams resist adopting governance tools | High | High | Ship in "observe-only" mode first. Show value before enforcing. |
| Competitor ships similar tool | Medium | Medium | Move fast on PyPI + VS Code. First-mover in multi-agent gov. |
| Enterprise customers need SOC2/ISO compliance | Medium | Low | Phase 10 rule packs address this. Architecture already supports audit trails. |

---

## Architecture Decision Records

### ADR-001: Fail-Closed by Default

**Decision:** Gate exits with code 2 (block) on any unhandled error.

**Rationale:** A governance tool that silently allows operations on error provides false confidence. Fail-closed is the security industry standard. Teams that prefer fail-open can set `TRIBUNAL_FAIL_MODE=open`.

**Trade-off:** May block developers when Tribunal has bugs. Mitigated by comprehensive testing and the env var override.

### ADR-002: Local-First Architecture

**Decision:** All core functionality works offline with no network calls.

**Rationale:** (1) Air-gapped enterprise environments need offline governance. (2) Zero-latency hook evaluation is critical for developer experience. (3) No data leaves the machine without explicit opt-in.

**Trade-off:** Team features require explicit sync step. No real-time cross-machine coordination.

### ADR-003: PyYAML as Only Dependency

**Decision:** Keep tribunal's dependency footprint at exactly one package.

**Rationale:** Every dependency is a supply chain risk, an install friction point, and a version conflict opportunity. PyYAML is stable, ubiquitous, and has no transitive deps.

**Trade-off:** No pydantic (manual validation), no rich (plain text output), no click (argparse instead). These are acceptable trade-offs for install reliability.

### ADR-004: MCP Over HTTP for Team Features

**Decision:** Team dashboard uses Cloudflare Workers + D1, not a custom protocol.

**Rationale:** Cloudflare's edge network provides global low-latency access. D1 (SQLite at edge) is sufficient for audit data. Workers have generous free tier. The tribunal.dev domain already uses Cloudflare Pages.

**Trade-off:** Vendor lock-in to Cloudflare. Mitigated by standard SQLite schema that can be migrated.

### ADR-005: Multi-Agent Governance via Hooks Only

**Decision:** Govern sub-agents through the same hook protocol as the main agent.

**Rationale:** Claude Code runs sub-agent hooks through the same system. No special integration needed — Tribunal naturally sees `SubagentStart`, `TaskCreated`, etc.

**Trade-off:** Cannot modify sub-agent behavior mid-execution. Can only block/allow at tool boundaries.

---

## Appendix: Claude Code Hook Event Reference

| Event | Trigger | Payload Fields |
|-------|---------|----------------|
| `PreToolUse` | Before tool execution | `tool_name`, `tool_input`, `session_id`, `cwd` |
| `PostToolUse` | After tool execution | `tool_name`, `tool_input`, `tool_result`, `duration_ms` |
| `PostToolUseFailure` | Tool execution failed | `tool_name`, `error`, `stack_trace` |
| `SessionStart` | Session begins | `session_id`, `cwd`, `permission_mode` |
| `SessionEnd` | Session ends | `session_id`, `total_cost`, `duration` |
| `SubagentStart` | Sub-agent spawned | `agent_id`, `task_description`, `parent_session` |
| `SubagentStop` | Sub-agent finished | `agent_id`, `cost`, `tools_used` |
| `TaskCreated` | Task assigned to agent | `task_id`, `description`, `agent_id` |
| `TaskCompleted` | Task finished | `task_id`, `result`, `cost` |
| `FileChanged` | File modified on disk | `file_path`, `change_type` |
| `CwdChanged` | Working dir changed | `old_cwd`, `new_cwd` |
| `PermissionRequest` | Permission asked | `tool`, `pattern`, `mode` |
| `PermissionDenied` | Permission denied | `tool`, `pattern`, `reason` |
| `ConfigChange` | Config modified | `key`, `old_value`, `new_value` |
| `PreCompact` | Context compaction starting | `context_size`, `target_size` |
| `PostCompact` | Context compaction done | `tokens_before`, `tokens_after` |
| `TeammateIdle` | Agent idle | `agent_id`, `idle_duration` |
| `Stop` | Session stopping | `reason`, `session_id` |
| `StopFailure` | Stop failed | `error`, `session_id` |

---

*This roadmap is a living document. Update as implementation reveals new constraints or opportunities.*
