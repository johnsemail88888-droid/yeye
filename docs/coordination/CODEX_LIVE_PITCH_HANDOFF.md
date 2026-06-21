# Codex Live Pitch Handoff

Status: SPEC_ONLY round complete
Branch: codex/live-pitch-experience-v2

## Mode Used

SPEC_ONLY, per both coordination reviews:

- `docs/coordination/CLAUDE_PITCH_AUTOMATION_REVIEW.json`: APPROVE_SPEC_ONLY
- `docs/coordination/CODEX_PEER_PITCH_AUTOMATION_REVIEW.json`: APPROVE_SPEC_ONLY

## Files Changed

- `docs/pitch-v2/PITCH_V2_START_HERE.md`
- `docs/pitch-v2/INTEGRATION_OWNER_REVIEW_CHECKLIST.md`
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
- `docs/pitch-v2/DEMO_EVIDENCE_PACKET_SCHEMA.md`
- `docs/pitch-v2/PRESENTER_COMMAND_CARD.md`
- `docs/pitch-v2/SPONSOR_INTEGRATION_TRUTH_TABLE.md`
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
- `tests/pitch-spec/presenter_command_card_acceptance.json`
- `tests/pitch-spec/sponsor_integration_truth_acceptance.json`
- `tests/pitch-spec/pitch_v2_start_here_acceptance.json`
- `tests/pitch-spec/integration_owner_review_acceptance.json`
- `tests/pitch-spec/demo_evidence_packet.schema.json`
- `tests/pitch-spec/demo_evidence_packet_schema_acceptance.json`
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
- `tests/pitch-spec/presenter_command_card_acceptance.json`
- `tests/pitch-spec/sponsor_integration_truth_acceptance.json`
- `tests/pitch-spec/pitch_v2_start_here_acceptance.json`
- `tests/pitch-spec/integration_owner_review_acceptance.json`
- `tests/pitch-spec/demo_evidence_packet.schema.json`
- `tests/pitch-spec/demo_evidence_packet_schema_acceptance.json`

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

## 2026-06-21 05:04 PT SPEC_ONLY Increment

Added:

- `docs/pitch-v2/PRESENTER_COMMAND_CARD.md`
- `tests/pitch-spec/presenter_command_card_acceptance.json`

Purpose:

- Give the presenter a one-page cue card for route-specific opening lines, the three-minute spine, fallback language, and final close.
- Keep unsupported claims out of spoken narration under pressure.
- Practice downgrade language during timed rehearsal instead of improvising if live evidence is missing.

## 2026-06-21 05:34 PT SPEC_ONLY Increment

Added:

- `docs/pitch-v2/SPONSOR_INTEGRATION_TRUTH_TABLE.md`
- `tests/pitch-spec/sponsor_integration_truth_acceptance.json`

Purpose:

- Keep Arize, ArmorIQ, Token Company, browser extension, CI, and legal/platform integration answers evidence-bound.
- Provide safe Q&A patch lines for sponsor/integration questions.
- Require evidence packet and integration-owner approval before any sponsor/integration claim moves to LIVE.

## 2026-06-21 06:04 PT SPEC_ONLY Increment

Added:

- `docs/pitch-v2/PITCH_V2_START_HERE.md`
- `tests/pitch-spec/pitch_v2_start_here_acceptance.json`

Purpose:

- Give presenter, integration owner, and reviewer ordered read paths through the pitch-v2 package.
- Keep timing and overall pass status visibly false until measured evidence exists.
- Restate the hard SPEC_ONLY boundaries in the first file a morning reviewer should open.

## 2026-06-21 06:34 PT SPEC_ONLY Increment

Added:

- `docs/pitch-v2/INTEGRATION_OWNER_REVIEW_CHECKLIST.md`
- `tests/pitch-spec/integration_owner_review_acceptance.json`

Purpose:

- Separate docs/spec merge review from runtime implementation expectations.
- Make clear that merging this branch does not upgrade timing, overall, CLI, extension, generated CI, readiness, external integration, or legal claims.
- Give the integration owner merge-note wording that preserves SPEC_ONLY status.

## 2026-06-21 07:04 PT SPEC_ONLY Increment

Added:

- `tests/pitch-spec/demo_evidence_packet.schema.json`
- `docs/pitch-v2/DEMO_EVIDENCE_PACKET_SCHEMA.md`
- `tests/pitch-spec/demo_evidence_packet_schema_acceptance.json`

Purpose:

- Define the structural fields required for a future filled evidence packet.
- Keep schema validation distinct from live evidence review.
- Preserve conservative timing and claim defaults until the integration owner supplies real artifacts.
