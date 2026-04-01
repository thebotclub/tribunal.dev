# Tribunal

**Enterprise-grade discipline for Claude Code.**

Tribunal enforces TDD, quality gates, and team standards on Claude Code sessions via the hook protocol.

## Quick Start

```bash
pip install tribunal
cd your-project
tribunal init
```

This generates:
- `.tribunal/rules.yaml` — your project rules
- `.claude/claudeconfig.json` — hook wiring for Claude Code

## What It Does

| Feature | How |
|---------|-----|
| **TDD enforcement** | Blocks file edits unless tests exist first |
| **Secret scanning** | Prevents hardcoded credentials in code |
| **Audit trail** | Logs every tool call to `.tribunal/audit.jsonl` |
| **Custom rules** | Define your own in `.tribunal/rules.yaml` |

## Commands

```bash
tribunal init      # Set up hooks in current project
tribunal status    # Show active rules and audit summary
tribunal rules     # List all rules and their config
tribunal audit     # View recent audit log entries
tribunal audit -n 50  # Show last 50 entries
```

## Rule Format

Rules live in `.tribunal/rules.yaml`:

```yaml
rules:
  tdd-python:
    trigger: PreToolUse
    match:
      tool: "FileEdit|FileWrite"
      path: "*.py"
    action: block
    condition: no-matching-test
    message: "Write a failing test first."

  no-secrets:
    trigger: PreToolUse
    match:
      tool: "FileEdit|FileWrite"
    action: block
    condition: contains-secret
    message: "Possible secret detected. Use environment variables."
```

### Built-in Conditions

| Condition | Description |
|-----------|-------------|
| `no-matching-test` | No `test_<module>.py` exists for the edited `.py` file |
| `no-matching-test-ts` | No `<module>.test.ts` exists for the edited `.ts` file |
| `contains-secret` | Content matches common secret patterns (API keys, tokens, etc.) |
| `cost-exceeded` | Session cost exceeds `budget_usd` threshold |

### Actions

- `block` — Prevent the tool call (exit code 2)
- `warn` — Log a warning but allow it (exit code 0)
- `audit` — Silent logging only (exit code 0)

## How It Works

Tribunal plugs into Claude Code's [hook system](https://docs.anthropic.com/en/docs/claude-code/hooks):

1. **`tribunal init`** writes hook config to `.claude/claudeconfig.json`
2. Claude Code calls `tribunal-gate` on every tool use
3. The gate reads the hook event (JSON on stdin), evaluates rules, and responds
4. Results are logged to `.tribunal/audit.jsonl`

## License

MIT
