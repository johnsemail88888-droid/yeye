# Claude Code — Conflict Review: Codex Live Pitch Automation

**Reviewer:** Claude Code (local integration owner) · **Date:** 2026-06-21 · **Base:** `main` @ `abaf788`
**Decision: `APPROVE_SPEC_ONLY`** — grounded in actual repo state, not prompt quality.

## Repo facts that drive this verdict
- **Branches:** `main`, `overnight-base`, `origin/main`. **Zero `codex/*` branches; one worktree (main).** → there are **no active Codex workers** to conflict with.
- **Referenced coordination files that DO NOT EXIST:** `OVERNIGHT_STATE.md`, `VIBESHIELD_DUAL_AGENT_OVERNIGHT_MASTER.md`, `VIBESHIELD_STUDIO_MASTER_PROMPT_V4_RESEARCH_LOOPS.md`, `docs/CODEX_UI_HANDOFF.md`, `docs/CODEX_DOCS_HANDOFF.md`, `docs/CODEX_RELIABILITY_HANDOFF.md`, `docs/CODEX_SECURITY_REVIEW.md`. (Only `CURRENT_STATE.md` and `IMPLEMENTATION_PLAN.md` exist.)
- **The "PROMPT C / `codex/ui-judge-mode`" and "PROMPT E / `codex/docs-qanda`" workers the gate worries about never ran.**
- **A real, newer overlap exists:** the `codex/uiux-auto` automation (`CODEX_UIUX_LOOP.md` / `CODEX_UIUX_MISSION.md`, on `main`) already owns Judge-Mode / Mode-1 / Mode-2 UI building in `ui-next/**`.
- **Scanner (`src/scan.ts`) does NOT implement readiness checks #5–12** (rate-limit, token/cost cap, streaming, audit logging, privacy inventory, Apple/Google, UGC/DMCA).
- **No installable CLI:** `package.json` `bin` is `null` → `npx vibeshield install` is not real today.

## Answers to the review questions
1. **Overlap with `codex/ui-judge-mode`?** None — that worker/branch does not exist. But conceptual Judge-Mode overlap exists with the live `codex/uiux-auto` automation.
2. **Overlap with `codex/docs-qanda`?** None — does not exist. `docs/pitch-v2/**` is net-new; no live docs worker.
3. **Safe paths to own now:** `docs/pitch-v2/**`, `tests/pitch-spec/**`, `docs/coordination/CODEX_LIVE_PITCH_HANDOFF.md` (none collide with `codex/uiux-auto`).
4. **Mode:** **SPEC_ONLY.** IMPLEMENT_DELTA (a `packages/judge-mode-v2`) would duplicate the Judge Mode `codex/uiux-auto` is already building → withheld until that UI exists and Claude confirms no duplication.
5. **Pitch claims not supported:** `npx vibeshield install`; readiness checks #5–12; "the assessment also checks rate limits / budgets / audit logs / privacy / UGC" (overstated); a real draggable browser plugin (cut per `CURRENT_STATE.md`). All must stay explicit placeholders/spec, never shown as live.
6. **Does it ask Codex to edit daemon/guard/trace/scanner/schemas/root deps?** No — it explicitly forbids them (Gate P5). Good. It must ALSO be told to never edit `web/app.html|demo.html|judge.html`, `.github/workflows/**`, `package.json`, `CODEX_UIUX_*`, and `ui-next|extension|desktop|design/**`.
7. **Integration work that stays with Claude:** all `web/` wiring, any `src/**` (sponsor adapters, a real `vibeshield` bin), and the merge decision for `codex/live-pitch-experience-v2`. Codex files requests in `docs/pitch-v2/CLAUDE_INTEGRATION_REQUEST.md`.
8. **Supersede vs duplicate:** the UI-build portions (§2.4–2.6 as implementation) are superseded by `codex/uiux-auto`; this automation keeps only pitch/spec/docs and CONSUMES that UI.

## Conditions of approval (required before/while it runs)
- **Isolation:** run in its OWN clone (e.g. `C:/Users/Admin/Desktop/vibeshield-pitch`), branch `codex/live-pitch-experience-v2` **off `origin/main`** — never the live working copy, never a checkout shared with `codex/uiux-auto` or the daemon.
- **SPEC_ONLY only:** produce `docs/pitch-v2/**` + `tests/pitch-spec/**`. No `packages/**`, no runtime, no UI surfaces.
- **Truth:** every pitch claim maps to a real artifact or is a labeled placeholder; readiness checks #5–12 are spec, not live results.
- **Keep the legal-claim matrix (§1)** — it is well done and consistent with our honesty rule ("risk indicator for developer or legal review; not legal advice").

> Net: the automation is well-constructed and safety-aware, but its coordination world is largely imaginary in our actual repo, and its UI-build half now overlaps a live sibling automation. Approved to run **SPEC_ONLY, isolated, off `origin/main`**; the implementation half is deferred to `codex/uiux-auto` + Claude.
