# Tribunal Architecture Review & Feature Roadmap

> Based on deep analysis of Claude Code v2.1.88 internals and Tribunal's current feature set.
> Generated April 2, 2026.

> **Status: ✅ ALL PHASES COMPLETE** — v0.7.0 shipped with 18 modules, 20 CLI commands, 266 tests.

---

## Executive Summary

Claude Code v2.1.88 exposes **5 proven integration paths** that Tribunal can leverage without modifying Claude Code itself. The architecture is deliberately extensible — hooks, plugins, MCP servers, permissions, and skills are all designed for external tools. This roadmap prioritizes features by impact-to-effort ratio, organized into 4 phases over ~6 months.

---

## Part 1: Claude Code Architecture — What We Learned

### Integration Surface Map

```
┌─────────────────────────────────────────────────────────┐
│                    CLAUDE CODE v2.1.88                   │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   HOOKS     │  │  PERMISSIONS │  │   PLUGINS     │  │
│  │  20+ events │  │  deny/allow  │  │  marketplace  │  │
│  │  PreToolUse │  │  pattern     │  │  hooksConfig  │  │
│  │  PostToolUse│  │  matching    │  │  mcpServers   │  │
│  │  FileChanged│  │              │  │  skillsPaths  │  │
│  └──────┬──────┘  └──────┬───────┘  └──────┬────────┘  │
│         │                │                  │           │
│  ┌──────┴────────────────┴──────────────────┴────────┐  │
│  │              TOOL EXECUTION LIFECYCLE              │  │
│  │  validateInput → checkPermissions → PreToolUse    │  │
│  │  → call() → PostToolUse → renderResult            │  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │                               │
│  ┌──────────────────────┴────────────────────────────┐  │
│  │              SERVICES LAYER                        │  │
│  │  MCP · Skills · Memory · Cost · Voice · Analytics  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              CONFIG RESOLUTION                     │  │
│  │  managed → platform → enterprise → PROJECT →user  │  │
│  │                           .claude/claudeconfig.json│  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ▲
                         │
              ┌──────────┴──────────┐
              │     TRIBUNAL        │
              │  hooks · rules ·    │
              │  gates · reviews    │
              └─────────────────────┘
```

### Key Discovery: The Hooks Protocol

Claude Code's hooks system is the **primary integration point**. It works like this:

```
Claude wants to run a tool (e.g. FileEdit)
  → Checks PreToolUse hooks
  → Runs external command (e.g. `tribunal-check`)
  → Sends tool details via JSON on stdin
  → Reads verdict from stdout
  → Exit code 0 = allow, 2 = block
  → If blocked, Claude sees the rejection reason and adapts
```

Configuration lives in `.claude/claudeconfig.json`:

```json
{
  "hooks": {
    "PreToolUse": [{
      "if": { "matcher": "Bash|FileEdit|FileWrite" },
      "run": [{ "command": "tribunal-check --pre" }]
    }],
    "PostToolUse": [{
      "if": { "matcher": "Bash|FileEdit" },
      "run": [{ "command": "tribunal-check --post" }]
    }],
    "SessionStart": [{
      "run": [{ "command": "tribunal-init" }]
    }]
  }
}
```

### Key Discovery: The Skills System

Skills are markdown files with YAML frontmatter — reusable prompts that Claude knows how to invoke. Tribunal can ship custom skills:

```markdown
---
description: "Run TDD cycle for this module"
allowed-tools: [Bash, FileEdit, Read, Glob, Grep]
when-to-use: "When implementing new features or fixing bugs"
---

## TDD Cycle

1. Write a failing test first
2. Run the test to confirm it fails
3. Write the minimum code to make it pass
4. Refactor if needed
5. Run the full test suite
```

### Key Discovery: The Memory System

Claude Code's memory is file-based markdown with frontmatter (type: `pattern`, `warning`, `gotcha`, `reference`, `session-log`). It's capped at 200 files and 25KB per entry. Uses Sonnet to rank the 5 most relevant memories per query. **Tribunal can write to and read from this system.**

### Key Discovery: Cost Tracking

Per-session cost data is saved to project config with full token breakdowns by model. **Tribunal can read this to enforce cost budgets.**

---

## Part 2: Feature Roadmap

### Phase 1: Foundation (Weeks 1-3) ✅ COMPLETE
**Goal:** Native hooks integration — become a first-class Claude Code extension.

| Feature | Description | Integration Point | Priority |
|---------|-------------|-------------------|----------|
| **Hook installer** | `tribunal init` generates `.claude/claudeconfig.json` with proper hooks config | Config generation | P0 |
| **PreToolUse gate** | Block file writes that violate rules (TDD, secrets, naming) | Hooks → PreToolUse | P0 |
| **PostToolUse audit** | Log all tool executions for audit trail | Hooks → PostToolUse | P0 |
| **SessionStart bootstrap** | Load project rules, set up memory context on session start | Hooks → SessionStart | P1 |
| **JSON protocol handler** | Parse Claude Code's hook stdin/stdout JSON format correctly | Hooks protocol | P0 |

**Deliverable:** `tribunal init` sets up hooks, every Claude Code session runs through Tribunal's gates.

```bash
# User experience after Phase 1:
$ cd my-project
$ tribunal init          # generates .claude/claudeconfig.json
$ claude                 # Claude Code starts, Tribunal hooks are active
# → Claude tries to write prod code without tests → BLOCKED
# → Claude writes tests first, then code → ALLOWED
```

---

### Phase 2: Intelligence (Weeks 4-7) ✅ COMPLETE
**Goal:** Smart rules engine + cost governance + memory integration.

| Feature | Description | Integration Point | Priority |
|---------|-------------|-------------------|----------|
| **Rule engine v2** | Pattern-based rules with glob matching (like Claude Code's permission system) | Local rule evaluation | P0 |
| **Cost budgets** | Read session costs, enforce per-session/daily/weekly limits | Cost tracker data | P0 |
| **Memory injection** | Write Tribunal rules and learnings into Claude Code's memory system | memdir integration | P1 |
| **Secret scanner** | Pre-commit-style secret detection on every file write | PreToolUse hook | P0 |
| **Type check gate** | Run `tsc --noEmit` / `mypy` after file changes | PostToolUse hook | P1 |
| **Lint gate** | Run project linter after file changes | PostToolUse hook | P1 |
| **Permission policies** | Generate deny/allow rules for `.claude/claudeconfig.json` | Permission system | P1 |

**Deliverable:** Tribunal enforces cost limits, runs static analysis on every change, and persists learnings.

```yaml
# .tribunal/config.yaml — Rule engine v2
rules:
  tdd-enforcement:
    trigger: PreToolUse
    match: { tool: FileEdit, path: "src/**/*.py" }
    condition: no-matching-test-file
    action: block
    message: "Write a failing test in tests/ first."

  cost-budget:
    trigger: PostToolUse
    condition: session-cost > 2.00
    action: warn
    message: "Session cost exceeded $2. Consider wrapping up."

  no-secrets:
    trigger: PreToolUse
    match: { tool: FileEdit|FileWrite }
    condition: contains-secret-pattern
    action: block
    message: "Possible secret detected. Use environment variables."

  require-types:
    trigger: PostToolUse
    match: { tool: FileEdit, path: "**/*.ts" }
    run: "npx tsc --noEmit --pretty"
    action: block-on-failure
```

---

### Phase 3: Multi-Agent & Skills (Weeks 8-12) ✅ COMPLETE
**Goal:** Ship as a Claude Code plugin with custom skills and review agents.

| Feature | Description | Integration Point | Priority |
|---------|-------------|-------------------|----------|
| **Plugin manifest** | Package Tribunal as a Claude Code plugin (discoverable in settings) | Plugin system | P0 |
| **Custom skills** | Ship TDD, security review, spec workflow as markdown skills | Skills system | P0 |
| **Review agents** | 4 parallel review agents using Claude Code's coordinator mode | Coordinator mode | P1 |
| **MCP server** | Expose Tribunal rules/audit as MCP tools for other agents | MCP integration | P1 |
| **Spec workflow skill** | Plan → verify → implement → review cycle as a skill | Skills system | P0 |
| **Security review skill** | Adapt Claude Code's security-review command for Tribunal | Skills system | P1 |

**Deliverable:** `tribunal` appears in Claude Code's plugin list. Users get custom skills for TDD, spec review, and security.

**Plugin manifest:**
```typescript
// tribunal-plugin manifest
{
  name: "tribunal",
  manifest: {
    description: "Enterprise code discipline for Claude Code",
    version: "2.0.0",
  },
  hooksConfig: {
    PreToolUse: [
      { if: { matcher: "Bash|FileEdit|FileWrite" }, run: [{ command: "tribunal-gate" }] }
    ],
    PostToolUse: [
      { if: { matcher: "Bash|FileEdit" }, run: [{ command: "tribunal-audit" }] }
    ],
    SessionStart: [
      { run: [{ command: "tribunal-init" }] }
    ]
  },
  skillsPaths: [
    "~/.tribunal/skills/"  // TDD skill, spec skill, review skills
  ],
  mcpServers: {
    "tribunal": {
      command: "tribunal",
      args: ["mcp-serve"],
      env: {}
    }
  }
}
```

**Bundled skills shipped with Tribunal:**

| Skill | File | Purpose |
|-------|------|---------|
| `tdd-cycle` | `skills/tdd-cycle.md` | Enforce write-test-first workflow |
| `spec-review` | `skills/spec-review.md` | Plan → verify → implement → review |
| `security-audit` | `skills/security-audit.md` | Branch-level security analysis |
| `cost-report` | `skills/cost-report.md` | Session cost breakdown and trends |
| `quality-gate` | `skills/quality-gate.md` | Run all gates and report status |

---

### Phase 4: Enterprise & Ecosystem (Weeks 13-24) ✅ COMPLETE
**Goal:** Fleet management, team rules, and enterprise governance.

| Feature | Description | Integration Point | Priority |
|---------|-------------|-------------------|----------|
| **Team rules sync** | Sync rules across team via Claude Code's team memory | Team memory sync | P0 |
| **Managed settings** | Ship Tribunal config as managed settings for enterprise | Managed settings (`/etc/claude-code/`) | P0 |
| **Audit dashboard** | Web UI for viewing audit logs across projects | PostToolUse logs | P1 |
| **Cost analytics** | Aggregate cost data across team/org | Cost tracker data | P1 |
| **Custom model routing** | Route to different models based on task type/cost | Model configuration | P1 |
| **Air-gapped bundles** | Offline Tribunal with all rules/skills embedded | Package system | P2 |
| **CI/CD integration** | `tribunal report` for CI pipelines | CLI command | P1 |
| **Rule marketplace** | Share/discover community rules | Plugin ecosystem | P2 |

**Enterprise deployment:**
```bash
# Fleet deployment via managed settings
cat /etc/claude-code/managed-settings.json.d/tribunal.json
{
  "enabledPlugins": { "tribunal@marketplace": true },
  "hooks": { ... },
  "permissions": {
    "deny": [
      { "tool": "Bash", "pattern": "curl *|wget *" },
      { "tool": "FileEdit", "pattern": "/etc/**" }
    ]
  }
}
```

---

## Part 3: Competitive Advantages from Claude Code Internals

### Things Tribunal Can Do That Claude Code Doesn't (Out of the Box)

| Capability | Claude Code | Tribunal Opportunity |
|------------|-------------|---------------------|
| **TDD enforcement** | Not enforced | Block prod code without failing tests |
| **Cost budgets** | Tracks costs, no limits | Enforce per-session/daily spending caps |
| **Multi-model routing** | Manual model selection | Auto-route cheap tasks to Haiku, complex to Opus |
| **Rule versioning** | Settings sync (flat) | Git-tracked rule sets with team review |
| **Audit trail** | Analytics to Anthropic | Local audit log you own and control |
| **Quality gates** | No built-in linting | Run linters/formatters/type-checkers automatically |
| **Spec workflow** | No spec concept | Full plan → verify → implement → review cycle |
| **Secret prevention** | Security review command (manual) | Automatic on every file write |
| **Team standards** | Team memory (free text) | Structured, enforceable rule sets |
| **Compliance** | Policy limits (Anthropic-controlled) | Self-hosted policy engine |

### Things to Learn From Claude Code's Architecture

| Pattern | How Claude Code Does It | What Tribunal Should Adopt |
|---------|------------------------|---------------------------|
| **Feature gating** | GrowthBook flags + `feature()` calls | Add feature flags for gradual rollouts |
| **Config resolution** | 5-level cascade (managed → user) | Support project, user, and org-level configs |
| **Graceful degradation** | Try native → fallback → disabled | Don't crash if a gate tool isn't installed |
| **Memory relevance** | Sonnet ranks top 5 memories per turn | Use LLM to surface most relevant rules per context |
| **Token estimation** | File-type-aware byte/token ratios | Estimate gate cost before running expensive checks |
| **Permission UX** | deny/allow/ask with pattern matching | Same UX for Tribunal rules (not just block/allow) |
| **Session persistence** | Save costs, state per sessionId | Persist gate results per session for audit |

---

## Part 4: Technical Architecture for Tribunal v2

### Recommended Stack

```
tribunal (Python CLI)
├── tribunal init           # Generate .claude/claudeconfig.json
├── tribunal gate           # Hook handler (stdin JSON → stdout verdict)
├── tribunal audit          # PostToolUse logger
├── tribunal rules          # Manage rule sets
│   ├── tribunal rules list
│   ├── tribunal rules add <rule>
│   ├── tribunal rules test <file>
│   └── tribunal rules sync
├── tribunal cost           # Cost governance
│   ├── tribunal cost budget set 5.00
│   ├── tribunal cost report
│   └── tribunal cost alert
├── tribunal model          # Model management (existing)
│   ├── tribunal model list
│   ├── tribunal model set <model>
│   └── tribunal model route <config>
├── tribunal skills         # Skill management
│   ├── tribunal skills list
│   ├── tribunal skills install <skill>
│   └── tribunal skills create <name>
├── tribunal report         # Generate audit/compliance report
└── tribunal mcp-serve      # MCP server mode
```

### Hook Handler Protocol

```python
# tribunal-gate: the core hook handler
# Called by Claude Code via PreToolUse/PostToolUse hooks

import json, sys

def handle_hook():
    # Claude Code sends tool details on stdin
    event = json.load(sys.stdin)

    tool_name = event.get("tool_name")      # "FileEdit", "Bash", etc.
    tool_input = event.get("tool_input")     # tool-specific parameters
    hook_type = event.get("hook_type")       # "PreToolUse" or "PostToolUse"

    # Load project rules
    rules = load_rules(".tribunal/config.yaml")

    # Evaluate rules against this tool call
    verdict = evaluate_rules(rules, tool_name, tool_input, hook_type)

    if verdict.blocked:
        # Output rejection reason (Claude sees this and adapts)
        print(json.dumps({
            "decision": "block",
            "reason": verdict.message
        }))
        sys.exit(2)  # Exit 2 = block
    else:
        # Allow the operation
        print(json.dumps({"decision": "allow"}))
        sys.exit(0)  # Exit 0 = allow
```

---

## Part 5: Priority Matrix

### Impact vs. Effort

```
HIGH IMPACT
    │
    │  ★ Hook installer      ★ Cost budgets
    │  ★ PreToolUse gate     ★ Plugin manifest
    │  ★ TDD enforcement     ★ Custom skills
    │                        ★ Review agents
    │  ★ Secret scanner
    │  ★ Audit trail         ★ Team rules sync
    │                        ★ Managed settings
    │  ★ Lint/type gates     ★ MCP server
    │                        ★ Audit dashboard
    │                        ★ Rule marketplace
    │
LOW ├────────────────────────────────────────
    LOW EFFORT                    HIGH EFFORT
```

### Recommended Execution Order

1. **Hook installer + PreToolUse gate** — immediate value, minimal code
2. **TDD enforcement + secret scanner** — core differentiator
3. **Cost budgets** — enterprise demand
4. **Audit trail** — compliance requirement
5. **Custom skills** — multiplies value of everything above
6. **Plugin manifest** — distribution at scale
7. **Review agents** — flagship feature
8. **Enterprise features** — monetization path

---

## Appendix: Claude Code Files to Reference

| Feature You're Building | Read These Files |
|------------------------|------------------|
| Hook integration | `types/hooks.ts`, `utils/hooks/hooksConfigManager.ts`, `utils/hooks/hookExecutor.ts` |
| Permission rules | `utils/permissions/permissions.ts`, `utils/permissions/permissionRulesConfig.ts` |
| Plugin system | `types/plugin.ts`, `plugins/builtinPlugins.ts`, `plugins/pluginManager.ts` |
| Skills | `skills/bundledSkills.ts`, `skills/loadSkillsDir.ts` |
| Cost tracking | `cost-tracker.ts`, `costHook.ts`, `utils/modelCost.ts` |
| Memory | `memdir/memdir.ts`, `memdir/memoryScan.ts`, `memdir/findRelevantMemories.ts` |
| Config cascade | `utils/settings/settings.ts`, `utils/settings/types.ts` |
| Security review | `commands/security-review.ts` |
| Coordinator mode | `coordinator/coordinatorMode.ts` |
| MCP integration | `services/mcp/types.ts`, `services/mcp/client.ts` |
| Tool lifecycle | `Tool.ts`, `tools.ts`, `query.ts`, `QueryEngine.ts` |
