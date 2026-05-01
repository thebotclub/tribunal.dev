# Tribunal Launch Checklist

**Status:** Implementation verified locally on 2026-05-01.

## Go Criteria

- Public site returns HTTP 200.
- Public repository links resolve without private access.
- PyPI metadata points to the public repository and documentation.
- GitHub Action example uses the public monorepo subpath: `thebotclub/tribunal.dev/tribunal@v2.0.0`.
- pre-commit example uses the public repo and a root hook manifest.
- Website metadata describes the product as quality gates for AI-generated code, not a Claude-only enhancement.
- Python CI gates pass locally:
  - `ruff format --check src/ tests/`
  - `ruff check src/ tests/`
  - `pytest tests/`
- Website gates pass locally:
  - `npm run lint`
  - `npm run build`
  - `npm audit --audit-level=moderate`

## Product Value Claims That Are Ready

- Local CLI quality gates for secrets, TDD coverage, and language checks.
- SARIF, JSON, and text output for CI and automation.
- Public install path via PyPI.
- Public source inspection via `thebotclub/tribunal.dev`.
- Optional hook enforcement for Claude Code-compatible event streams.

## Launch Risks To Recheck Before Announcement

- Confirm the `v2.0.0` Git tag exists and points at a commit containing `tribunal/action.yml` and root `.pre-commit-hooks.yaml`, or cut a new tag after these fixes.
- Re-run GitHub Actions after pushing; local checks are green, but matrix CI must confirm Python 3.10-3.13 on Linux/macOS/Windows.
- Decide whether the private `thebotclub/tribunal` repository should remain private, be made public, or be retired from all public messaging.
- The VS Code extension is still a scaffold. Avoid launch copy that implies it is a mature shipped extension until it is published and verified.
- Docs under `docs/` still contain Claude-specific guides where the topic is specifically hook integration. That is acceptable, but broader docs should continue to avoid Claude-only product framing.

## No-Go Criteria

- Any public install/docs link returns 404 for a logged-out user.
- `npm audit --audit-level=moderate` reports a production dependency advisory.
- The Python test matrix fails on `main`.
- PyPI project page still points to a private repository after release metadata refresh.
