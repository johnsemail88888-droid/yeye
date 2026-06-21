# VibeShield Pitch V2 AIDA Beat Sheet

Status: SPEC_ONLY
Branch: codex/live-pitch-experience-v2
Truth rule: every live claim needs a repo artifact, daemon state artifact, or an explicit PLACEHOLDER / ROADMAP label.

## Narrative Contract

VibeShield is presented as a live risk debugger for AI products. It is not presented as a completed browser extension, legal compliance engine, installable CLI, or full operational readiness scanner.

The pitch uses AIDA internally:

| Time | AIDA role | Judge sees | Claim status |
| --- | --- | --- | --- |
| 0:00-0:15 | Attention | Deployed support/refund app working normally | LIVE only when backed by current demo state |
| 0:15-0:35 | Interest | VibeShield targets one risky workflow | LIVE for existing daemon-backed flow, LOCAL FALLBACK if endpoint is unavailable |
| 0:35-1:10 | Interest | One critical failure with run_id, test_id, trace/evidence | LIVE or RECORDED REAL RUN only with artifact path |
| 1:10-1:35 | Desire | Trace explains tool-boundary failure | LIVE or RECORDED REAL RUN only with artifact path |
| 1:35-2:05 | Desire | Guard or policy diff is applied by integration owner | LIVE only if backed by source and verify output |
| 2:05-2:30 | Desire | Same attack plus mutation blocked, benign task preserved | LIVE or RECORDED REAL RUN only with verify evidence |
| 2:30-2:48 | Desire | Static readiness checklist | ROADMAP for readiness checks 5-12 |
| 2:48-3:00 | Action | Current adoption path plus roadmap CLI | ROADMAP for one-command CLI and generated GitHub Action |

## Mandatory Spoken Rewrites

Use this line at 2:30-2:48:

> VibeShield also surfaces a static readiness checklist, marked as roadmap where it is not yet implemented: rate limits, per-user AI budgets, specific error handling, streaming UX, audit logs, privacy declarations, and relevant UGC or platform obligations. Legal items are evidence-backed review indicators, not legal advice.

Do not say:

- The old secondary-breadth wording that implies dynamic readiness checks.
- "npx vibeshield install" as if it works today.
- "Generated GitHub Action" as if it is produced by a CLI.
- "Browser plugin" without labeling it as PLACEHOLDER / ROADMAP.
- Overbroad guarantee terms about legal status or security.

## Proof Ladder

1. Normal workflow works.
2. Attack workflow produces a tool-boundary failure.
3. Evidence opens to identifiers: project_id, run_id, test_id, trace_id where available, and artifact path.
4. Guard policy/diff explains why the trusted goal can continue but high-impact action needs approval or blocking.
5. Same test and mutation stop while benign support remains useful.
6. Readiness and legal items are separated from live scanner results unless a real artifact backs them.

## Current vs Roadmap Close

Current:

- Live or recorded risk loop can show attack -> trace -> guard -> verification when daemon artifacts exist.
- Static scanner classifies known support-agent tools and checks guard/approval-gate presence.
- Existing GitHub workflow is hand-committed in the repo.

Roadmap:

- Installable `npx vibeshield install` CLI.
- Real draggable browser Shield Pill / browser extension packaging.
- Dynamic readiness checks for rate limits, token caps, streaming, audit logging, privacy declarations, Apple/Google readiness, and UGC/DMCA workflow.
- CLI-generated GitHub Action.
