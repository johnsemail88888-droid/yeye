# Codex Live Pitch Handoff

Status: SPEC_ONLY round complete
Branch: codex/live-pitch-experience-v2

## Mode Used

SPEC_ONLY, per both coordination reviews:

- `docs/coordination/CLAUDE_PITCH_AUTOMATION_REVIEW.json`: APPROVE_SPEC_ONLY
- `docs/coordination/CODEX_PEER_PITCH_AUTOMATION_REVIEW.json`: APPROVE_SPEC_ONLY

## Files Changed

- `docs/pitch-v2/AIDA_BEAT_SHEET.md`
- `docs/pitch-v2/LIVE_DEMO_SCRIPT.md`
- `docs/pitch-v2/DEMO_CLICK_MAP.md`
- `docs/pitch-v2/JUDGE_QA.md`
- `docs/pitch-v2/LEGAL_CLAIM_MATRIX.md`
- `docs/pitch-v2/USE_CASES.md`
- `docs/pitch-v2/DEVPOST_COPY.md`
- `docs/pitch-v2/MORNING_REHEARSAL.md`
- `docs/pitch-v2/MORNING_GO_NO_GO_RUNBOOK.md`
- `docs/pitch-v2/DEMO_EVIDENCE_PACKET_TEMPLATE.md`
- `docs/pitch-v2/CLAUDE_INTEGRATION_REQUEST.md`
- `docs/pitch-v2/EVIDENCE_BINDING_MATRIX.md`
- `docs/pitch-v2/CLAIM_STATUS_LEDGER.md`
- `docs/pitch-v2/pitch_automation_results.json`
- `tests/pitch-spec/README.md`
- `tests/pitch-spec/pitch_truth_acceptance.json`
- `tests/pitch-spec/evidence_binding_acceptance.json`
- `tests/pitch-spec/claim_status_acceptance.json`
- `tests/pitch-spec/morning_go_no_go_acceptance.json`
- `tests/pitch-spec/demo_evidence_packet_acceptance.json`
- `docs/coordination/CODEX_LIVE_PITCH_HANDOFF.md`

## Commands Run

- `git clone https://github.com/johnsemail88888-droid/vibeshield.git C:\Users\Admin\Desktop\vibeshield-pitch`
- `git fetch origin`
- `git switch -c codex/live-pitch-experience-v2 origin/main`
- Read coordination and review files with PowerShell `Get-Content`
- Read-only fact checks with `Get-Content` and `rg`
- Created only SPEC_ONLY directories/files
- Added evidence binding and truth-badge gates for scripted actions

Not run:

- no daemon
- no `npm`
- no `tsx`
- no `node src/*`
- no demo scripts

## Tests Run

No executable tests were run because SPEC_ONLY forbids npm/tsx/node runtime commands for this automation round.

Created reviewer acceptance specs in:

- `tests/pitch-spec/README.md`
- `tests/pitch-spec/pitch_truth_acceptance.json`
- `tests/pitch-spec/evidence_binding_acceptance.json`
- `tests/pitch-spec/claim_status_acceptance.json`
- `tests/pitch-spec/morning_go_no_go_acceptance.json`
- `tests/pitch-spec/demo_evidence_packet_acceptance.json`

## Unsupported Items Left As Placeholders

- `npx vibeshield install`: package has no `bin` field today, so this is ROADMAP.
- Real draggable browser Shield Pill / browser extension: ROADMAP unless implemented by the UI owner.
- Readiness checks 5-12: ROADMAP/static checklist because `src/scan.ts` does not implement them today.
- Generated GitHub Action: ROADMAP. Existing `.github/workflows/vibeshield.yml` is hand-committed.
- Three-minute timing: not measured in this SPEC_ONLY round.

## Conflicts Avoided

- Did not edit `src/**`, `web/**`, `ui-next/**`, `packages/**`, `.github/**`, `package.json`, lockfiles, or daemon artifacts.
- Did not build UI or duplicate Judge Mode.
- Did not merge this branch.
- Did not touch `main` or `overnight-base`.

## Integration Requests For Claude

See `docs/pitch-v2/CLAUDE_INTEGRATION_REQUEST.md`.

Main requests:

- Choose the canonical live surface for the pitch.
- Bind LIVE badges only to current endpoint/artifact evidence.
- Keep unsupported capabilities labeled PLACEHOLDER / ROADMAP.
- Use the safe 2:30-2:48 static readiness wording.

## Final Pitch Timing

Planned only, not measured:

- 0:00-0:15 Attention
- 0:15-0:35 Interest
- 0:35-1:10 Real failure
- 1:10-1:35 Why this is not a wrapper
- 1:35-2:05 Apply protection
- 2:05-2:30 Same-test proof
- 2:30-2:48 Static readiness checklist
- 2:48-3:00 Action

## Known Risks

- Live demo timing cannot pass until three real rehearsals are measured.
- LIVE labels require current daemon or artifact evidence.
- Legal/platform copy must remain "risk indicator for developer or legal review; not legal advice."
- UI integration remains owned outside this SPEC_ONLY branch.

## 2026-06-21 03:04 PT SPEC_ONLY Increment

Added:

- `docs/pitch-v2/EVIDENCE_BINDING_MATRIX.md`
- `tests/pitch-spec/evidence_binding_acceptance.json`

Purpose:

- Bind each scripted demo action to an existing endpoint, artifact path, or ROADMAP label.
- Make truth badges fail-safe by default.
- Keep timing gates false until measured rehearsals exist.
- Reassert that state-changing endpoints and UI implementation are owned by the integration/UI worker, not this branch.

## 2026-06-21 03:34 PT SPEC_ONLY Increment

Added:

- `docs/pitch-v2/CLAIM_STATUS_LEDGER.md`
- `tests/pitch-spec/claim_status_acceptance.json`

Purpose:

- Status-label broad product, legal, platform, and adoption claims before the morning pitch.
- Keep `npx vibeshield install`, generated CI, real browser Shield Pill, and readiness checks 5-12 out of LIVE narration unless future evidence exists.
- Give Devpost, Q&A, and spoken script one shared source for supported wording.

## 2026-06-21 04:04 PT SPEC_ONLY Increment

Added:

- `docs/pitch-v2/MORNING_GO_NO_GO_RUNBOOK.md`
- `tests/pitch-spec/morning_go_no_go_acceptance.json`

Purpose:

- Force a pre-rehearsal choice among LIVE, RECORDED REAL RUN, LOCAL FALLBACK, and ROADMAP routes.
- Define hard no-go conditions that prevent live narration.
- Provide safe close lines for live, recorded, and local fallback demos.

## 2026-06-21 04:34 PT SPEC_ONLY Increment

Added:

- `docs/pitch-v2/DEMO_EVIDENCE_PACKET_TEMPLATE.md`
- `tests/pitch-spec/demo_evidence_packet_acceptance.json`

Purpose:

- Require a fillable evidence packet before any route is upgraded to LIVE or RECORDED REAL RUN.
- Make run identifiers, artifact paths, truth-badge evidence, downgrade labels, and timing rows explicit.
- Keep `three_minute_timing_pass` and `overall_pass` false until real packet data exists.
