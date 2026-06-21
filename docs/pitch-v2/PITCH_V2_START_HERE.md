# Pitch V2 Start Here

Status: SPEC_ONLY
Last updated: 2026-06-21 06:04 PT

This is the morning navigation index. It does not add product claims; it tells the presenter, integration owner, and reviewer which pitch-v2 files to open first.

## Current Pass Status

| Gate | Status | Why |
| --- | --- | --- |
| Coordination | pass | Both review JSON files say APPROVE_SPEC_ONLY |
| Source truth | pass | Unsupported capabilities are labeled ROADMAP or DO NOT CLAIM |
| Pitch docs | pass | Script, Q&A, Devpost copy, claim matrix, and use cases exist |
| Runtime conflict | pass | This branch did not edit runtime/UI paths or run daemon/npm/tsx/node src/* |
| Three-minute timing | false | No measured rehearsals are recorded |
| Overall | false | Timing and live/recorded evidence packet are not complete |

## Fast Path For Presenter

Open in this order:

1. `docs/pitch-v2/MORNING_GO_NO_GO_RUNBOOK.md`
2. `docs/pitch-v2/DEMO_EVIDENCE_PACKET_TEMPLATE.md`
3. `docs/pitch-v2/PRESENTER_COMMAND_CARD.md`
4. `docs/pitch-v2/LIVE_DEMO_SCRIPT.md`
5. `docs/pitch-v2/JUDGE_QA.md`

Goal:
Choose the route, fill evidence fields, rehearse with the command card, then use the full script and Q&A only as backup.

## Fast Path For Integration Owner

Open in this order:

1. `docs/pitch-v2/CLAUDE_INTEGRATION_REQUEST.md`
2. `docs/pitch-v2/EVIDENCE_BINDING_MATRIX.md`
3. `docs/pitch-v2/CLAIM_STATUS_LEDGER.md`
4. `docs/pitch-v2/SPONSOR_INTEGRATION_TRUTH_TABLE.md`
5. `docs/pitch-v2/DEMO_CLICK_MAP.md`

Goal:
Decide which existing surface and artifacts can back LIVE or RECORDED REAL RUN badges, then keep unsupported capabilities downgraded.

## Fast Path For Reviewer

Open in this order:

1. `docs/pitch-v2/pitch_automation_results.json`
2. `tests/pitch-spec/README.md`
3. `tests/pitch-spec/pitch_truth_acceptance.json`
4. `tests/pitch-spec/evidence_binding_acceptance.json`
5. `tests/pitch-spec/claim_status_acceptance.json`
6. `tests/pitch-spec/morning_go_no_go_acceptance.json`
7. `tests/pitch-spec/demo_evidence_packet_acceptance.json`
8. `tests/pitch-spec/presenter_command_card_acceptance.json`
9. `tests/pitch-spec/sponsor_integration_truth_acceptance.json`

Goal:
Check that every claim is evidence-bound and that timing/overall remain false until measured.

## Content Files

| File | Use |
| --- | --- |
| `AIDA_BEAT_SHEET.md` | Narrative structure and timing intent |
| `LIVE_DEMO_SCRIPT.md` | Full three-minute script |
| `DEMO_CLICK_MAP.md` | Click/action route without implementation |
| `JUDGE_QA.md` | Judge Q&A |
| `LEGAL_CLAIM_MATRIX.md` | Legal-safe claim rules and sources |
| `USE_CASES.md` | Primary and secondary use cases |
| `DEVPOST_COPY.md` | Devpost-safe copy |
| `MORNING_REHEARSAL.md` | Rehearsal table and timing gate |

## Hard Rules That Still Win

- Do not build UI in this branch.
- Do not edit `src/**`, `web/**`, `ui-next/**`, `packages/**`, `.github/**`, or `package.json`.
- Do not run daemon, npm, tsx, or node src/*.
- Do not present `npx vibeshield install` as working.
- Do not present readiness checks 5-12 as dynamic scanner output.
- Do not present a real browser Shield Pill or extension as shipped unless integration evidence exists.
- Do not present generated CI unless a generator exists.
- Do not present legal or platform cards as legal advice.

## Morning Decision

If evidence packet is complete and three rehearsals are measured:
Use LIVE or RECORDED REAL RUN as justified.

If evidence packet is incomplete:
Use LOCAL FALLBACK or ROADMAP / NOT CONFIGURED language.

If asked whether the pitch branch itself implements the demo:
Say this branch is SPEC_ONLY and leaves integration to the owner.
