# Tribunal Launch Readiness Plan

**Created:** 2026-05-01T13:47:03Z
**Mode:** GSD quick
**Goal:** Make `tribunal.dev` and the public repository credible, installable, and launch-ready for developers evaluating Tribunal as an agent-agnostic quality gate.

## Product Value Target

Tribunal should be immediately understandable as a local, open-source quality gate for AI-generated code. A developer should be able to land on the site, install the CLI, inspect the public source, add CI/pre-commit integration, and trust that the package metadata and workflows match the public project.

## Implementation Plan

1. Fix public trust breaks.
   - Route public-facing GitHub, documentation, GitHub Action, and pre-commit links to `thebotclub/tribunal.dev`.
   - Keep private `thebotclub/tribunal` out of public package metadata unless the private repo is intentionally made public later.

2. Align positioning.
   - Use agent-agnostic language across website metadata, README, package docs, and CLI copy.
   - Keep Claude Code hook support factual without making the product sound Claude-only.

3. Repair CI health.
   - Run Ruff formatting on the Python package and tests.
   - Run Ruff check and pytest locally.
   - Run website lint/build locally.

4. Harden hook gate behavior.
   - Make lifecycle handler short-circuiting explicit and documented.
   - Avoid accidental double writes or unreachable rule evaluation ambiguity.
   - Preserve fail-closed behavior for malformed input and rule errors.

5. Add a launch checklist.
   - Document go/no-go criteria, verification commands, distribution checks, and residual risks.
   - Keep this artifact in repo so future release work has a clear source of truth.

## Challenge Pass

### Challenge: Should public URLs point to `thebotclub/tribunal` instead?
No. That repository is private today, and public users see a 404. Launch readiness requires public trust paths to work without special access. If the product later splits website/package into separate repos, the public package repo can be changed intentionally.

### Challenge: Is formatting enough to call CI fixed?
No. Formatting addresses the known red `lint` job, but local `ruff check`, `pytest`, and website `npm run build` must also pass before treating the repo as launch-ready.

### Challenge: Is the gate bug definitely behavioral?
Partially. `write_verdict()` exits, so lifecycle handlers currently short-circuit. That may be intended, but the current code reads like lifecycle handlers are followed by rule evaluation. The fix should clarify behavior without broad semantic changes.

### Challenge: Does the website need a redesign before launch?
Not for this pass. The live page is coherent and functional enough. The launch blocker is credibility and installability: dead/private links, inconsistent metadata, and red CI.

### Challenge: Is the product genuinely valuable after these fixes?
It is valuable if the install path works, the checks are reliable, and the claims are precise. The launch checklist should explicitly call out any remaining unproven claims, such as VS Code extension maturity or broader agent integrations.

## Acceptance Criteria

- Public links from site, README, PyPI metadata, action examples, and pre-commit examples resolve to public resources.
- Site metadata and hero copy use agent-agnostic positioning.
- `tribunal-gate` lifecycle behavior is explicit and tested or covered by existing tests.
- `ruff format --check`, `ruff check`, and `pytest` pass for `tribunal/`.
- `npm run lint` and `npm run build` pass for the website.
- A launch checklist exists with go/no-go criteria and residual risks.
