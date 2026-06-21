# Integration Owner Review Checklist

Status: SPEC_ONLY
Last updated: 2026-06-21 06:34 PT

Purpose: help the integration owner review this branch without mistaking SPEC_ONLY docs for runtime implementation.

## Review Outcome Options

| Outcome | Use when | What it means |
| --- | --- | --- |
| Merge docs/spec only | Files are inside allowed paths and claims remain evidence-bound | Safe to merge documentation/specs for coordination |
| Request integration data | LIVE or RECORDED REAL RUN needs missing artifact fields | Keep branch docs, but do not upgrade demo route |
| Request wording fix | A claim can be read as live or legal advice without evidence | Fix docs before pitch |
| Reject runtime expectation | Someone expects this branch to build UI/runtime | Redirect to integration/UI owner |

## Required Diff Review

Confirm the branch only changes:

- `docs/pitch-v2/**`
- `tests/pitch-spec/**`
- `docs/coordination/CODEX_LIVE_PITCH_HANDOFF.md`

Reject or split out anything touching:

- `src/**`
- `web/**`
- `ui-next/**`
- `packages/**`
- `.github/**`
- `package.json`
- daemon artifacts such as `runs/**`, `.vibeshield/**`, `verify_results.json`, `risk_map.json`

## Merge-Safe Items

These are documentation/spec artifacts and can be reviewed without running the app:

- pitch narrative and script
- judge Q&A
- legal claim matrix
- claim status ledger
- evidence binding matrix
- go/no-go runbook
- demo evidence packet template
- presenter command card
- sponsor/integration truth table
- reviewer acceptance JSON files

## Do Not Upgrade Automatically

Merging this branch does not make these true:

- `overall_pass=true`
- `three_minute_timing_pass=true`
- LIVE browser Shield Pill / extension
- working `npx vibeshield install`
- generated GitHub Action
- dynamic readiness checks 5-12
- live Arize, ArmorIQ, Token Company, or other external sponsor integration
- legal compliance determination

Each upgrade requires evidence packet fields, artifact paths, and integration-owner approval.

## Evidence Packet Review

Before approving a LIVE or RECORDED REAL RUN route, require:

- selected route
- demo surface
- source label shown to judge
- project_id
- run_id
- test_id or artifact path
- before artifact path
- after artifact path
- verify artifact path
- truth-badge downgrade labels
- three measured timing rows if timing pass is requested

If any field is missing, keep route downgraded.

## Suggested Merge Note

Use this wording if merging docs/specs:

> Merge as SPEC_ONLY pitch documentation. This does not implement UI/runtime, does not start or require daemon artifacts, and does not set live demo timing or overall pass true. Integration owner must fill the evidence packet before any LIVE or RECORDED REAL RUN claim.

## Reviewer Questions

Ask these before any morning merge:

- Does every LIVE or RECORDED REAL RUN claim point to current endpoint evidence or an artifact path?
- Are readiness checks 5-12 still labeled static/ROADMAP?
- Is the one-command install still ROADMAP?
- Is the CI workflow described as hand-committed unless a generator exists?
- Are legal/platform items framed as review indicators, not legal advice?
- Is no UI duplicated against the `ui-next/**` worker?
- Does `pitch_automation_results.json` keep timing and overall false until measured?
