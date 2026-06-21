# Dual-Agent Ownership — no collisions on core

Base: `overnight-base`. Claude Code = local integration owner + final merge. Each parallel task works ONLY in its owned paths, commits to its own `codex/*` branch, and produces a handoff report. **Nobody bulk-merges.** Claude reviews each branch's diff + report and cherry-picks only passing commits.

## 🔒 CORE — Claude-owned ONLY (parallel tasks MUST NOT edit)
The shared schema + real loop. Changing these from two places breaks everything.
- `src/guard.ts` (the ArmorIQ-compatible intent guard)
- `src/daemon.ts` (localhost daemon + shared run_id + endpoints)
- `src/harness.ts`, `src/evals.ts`, `src/run.ts`, `src/scan.ts`
- `src/verify.ts` (the gate schema)
- `src/report.ts`, `src/experiment.ts`
- `examples/vulnerable-support-agent/*`
- `web/app.html`, `web/demo.html` (the live surfaces wired to the daemon)

A parallel task that thinks the guard/schema must change writes a **proposal diff + rationale in its handoff report** — it does NOT commit to core. Claude applies it.

## Lanes (owned paths per task → branch)

**B — Security tests & guard audit → `codex/security-tests`**
Owns: `tests/**`, `fixtures/**`, `evals/prompts/**` (all NEW).
Do: add more attack fixtures (mutation C/D, boundary $100 exactly, legitimate authorized email, PII variants) as data + a runner that calls the EXISTING core; audit `src/guard.ts` for any test-name / keyword / exact-string special-casing and report findings. Never edit core.

**C — UI / Judge Mode → `codex/ui-judge-mode`**
Owns: `web/judge.html`, `web/styles.css`, `web/components/**` (all NEW). Polish Shield Pill / Finding / Trace / Before-After / a "Demo Health" view. MUST read real `/api/state` — no hardcoded data. Do NOT edit `app.html`/`demo.html`; build alongside.

**D — Reliability / stability → `codex/reliability`**
Owns: `scripts/**` (NEW): `reset.ts`, `health-check.ts`, `playwright-smoke.ts`, screenshot capture, a recovery runbook. Wrap the EXISTING `pnpm` commands; never edit core.

**E — Docs / Q&A / Devpost → `codex/docs-qanda`**
Owns: `docs/**`, `DEVPOST.md`, `QANDA.md` (NEW). Write from REAL artifacts only (`verify_results.json`, `runs/**`, `report.json`); leave a `TODO:` placeholder where data doesn't exist. Never invent a metric or sponsor integration.

## Handoff report (each branch writes `docs/handoff-<task>.md`)
- what changed, owned paths touched (must be subset of the lane)
- how it was verified (commands + output)
- any proposed core change (diff + why) for Claude to apply
- anything still red

## Live Chrome / localhost / local creds = Claude only
Cloud sandboxes can't reach this machine's Chrome, daemon, or local keys — those stay with local Claude Code.
