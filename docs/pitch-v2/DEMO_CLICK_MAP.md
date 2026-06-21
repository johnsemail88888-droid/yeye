# Demo Click Map

Status: SPEC_ONLY
Owner boundary: this file specifies the route only. UI implementation belongs to the integration/UI owner.

Detailed proof requirements are in `docs/pitch-v2/EVIDENCE_BINDING_MATRIX.md`.

## Route

| Step | User action | Expected screen | Backing evidence | Truth label |
| --- | --- | --- | --- | --- |
| 1 | Open demo target | Support/refund workflow visible | Deployed app, local app, or recorded real run | LIVE / LOCAL FALLBACK |
| 2 | Open VibeShield entry point | Feature picker | In-page demo entry point today; browser Shield Pill is roadmap | LOCAL FALLBACK / ROADMAP |
| 3 | Choose Support / Refund Flow | Selected workflow summary | scope/project metadata | LIVE if endpoint confirms |
| 4 | Run live assessment | Activity stages | `/api/live-scan`, `/api/run`, or recorded artifact | LIVE / RECORDED REAL RUN |
| 5 | Open critical finding | Finding card with evidence IDs | run_id, test_id, trace_id if available, artifact path | LIVE / RECORDED REAL RUN |
| 6 | Open trace | Trusted goal vs untrusted content boundary | trace artifact or daemon state | LIVE / RECORDED REAL RUN |
| 7 | Apply protection | Guard diff or policy explanation | source/policy artifact and verify output | LIVE only with evidence |
| 8 | Verify same attack | Before/after comparison | verify artifact | LIVE / RECORDED REAL RUN |
| 9 | Open readiness | Static checklist | docs/spec labels | ROADMAP for checks 5-12 |
| 10 | Show deploy | Existing CI workflow | `.github/workflows/vibeshield.yml` exists but is hand-committed | LIVE for file existence, not generated |

## Activity Stage Names

Use these names only when the matching event or artifact exists:

- Scope captured
- Mapper running
- Attack test running
- Trace saved
- Guard decision
- After verification

If progress cannot be measured, say what is happening instead of showing fake percentage progress.

## Required Evidence Fields

Every visible finding should resolve to:

- project_id
- run_id
- test_id
- trace_id where applicable
- artifact path

## Static Readiness Checklist

Checks 5-12 are not live scanner output today. They must be marked ROADMAP unless a future implementation provides evidence:

- rate limiting or request quota indicator
- per-user token/cost cap indicator
- specific actionable error handling
- response streaming indicator
- observability/audit logging
- privacy/data inventory completeness
- Apple/Google privacy declaration readiness
- UGC/DMCA workflow readiness

## UI Non-Ownership Notes

- Do not build a duplicate Judge Mode UI in this branch.
- Do not edit `web/**`, `src/**`, `ui-next/**`, `packages/**`, `.github/**`, or root package files.
- File integration requests under `docs/pitch-v2/CLAUDE_INTEGRATION_REQUEST.md`.
