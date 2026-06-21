# Claude Integration Request

Status: SPEC_ONLY request
Requested by branch: codex/live-pitch-experience-v2

## Request

Please review the pitch V2 docs and decide which existing live surfaces should back the demo:

- `web/judge.html`
- `web/demo.html`
- daemon endpoints such as `/api/state`, `/api/run`, `/api/live-scan`, `/api/install-guard`
- current verify/runs artifacts

This branch does not edit those files.

## Required UI/Integration Truth Labels

Please ensure the UI defaults to fail-safe labels:

- LIVE only when a current endpoint or artifact proves the state.
- RECORDED REAL RUN only when the artifact path is visible.
- LOCAL FALLBACK when using local files without a live daemon.
- NOT CONFIGURED when the integration is absent.
- PLACEHOLDER / ROADMAP for `npx vibeshield install`, real browser Shield Pill/plugin, generated GitHub Action, and readiness checks 5-12.

## Script-Sensitive Items

The 2:30-2:48 line must be:

> VibeShield also surfaces a static readiness checklist, marked as roadmap where it is not yet implemented: rate limits, per-user AI budgets, specific error handling, streaming UX, audit logs, privacy declarations, and relevant UGC or platform obligations. Legal items are evidence-backed review indicators, not legal advice.

Do not use the old wording that implies the same live assessment dynamically checks roadmap readiness items.

## Open Questions For Integration Owner

- Which current artifact should provide the canonical run_id and test_id?
- Is trace_id available today, or should the UI show artifact path instead?
- Which button should own "Apply protection" in the live demo?
- Should the demo use `web/judge.html` as primary and `web/demo.html` as fallback?
- Can the hand-committed GitHub Action be shown as current CI without implying it was generated?
