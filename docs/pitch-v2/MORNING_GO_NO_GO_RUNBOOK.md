# Morning Go/No-Go Runbook

Status: SPEC_ONLY
Last updated: 2026-06-21 04:04 PT

Purpose: help the presenter choose the safest truthful demo path in the room. This is a runbook only; it does not implement UI, start the daemon, or run tests.

Fill `docs/pitch-v2/DEMO_EVIDENCE_PACKET_TEMPLATE.md` before upgrading any route to LIVE or RECORDED REAL RUN.
Use `docs/pitch-v2/PRESENTER_COMMAND_CARD.md` as the final speaking cue after the route is chosen.

## Decision Summary

Choose exactly one route before rehearsal:

| Route | Use when | Required label | Allowed close |
| --- | --- | --- | --- |
| Live route | Current endpoint and artifacts prove the run during rehearsal | LIVE | "This live run found, explained, guarded, and verified the support/refund risk." |
| Recorded route | A saved real run has visible run_id and artifact paths | RECORDED REAL RUN | "This is a recorded real run from the demo harness." |
| Local fallback route | Only local page/files are available, without current run evidence | LOCAL FALLBACK | "This shows the intended flow; live evidence is not currently configured." |
| Spec-only route | No demo evidence is available | ROADMAP / NOT CONFIGURED | "We have the pitch/spec package, but should not present live claims." |

If the route cannot show current or recorded evidence for attack, protection, and after-proof, do not call the demo LIVE.

## Five-Minute Preflight

| Check | Pass condition | If it fails |
| --- | --- | --- |
| Source route selected | LIVE, RECORDED REAL RUN, LOCAL FALLBACK, or ROADMAP chosen | Choose the most conservative route |
| Evidence identifiers | run_id visible; test_id or artifact path visible | Downgrade to RECORDED REAL RUN or LOCAL FALLBACK |
| Critical failure | Failure evidence visible by 70 seconds in rehearsal | Cut secondary breadth, or use recorded run |
| Protection proof | Guard decision or after-run artifact visible | Do not say the fix ran live |
| Benign utility | Benign task pass visible | Do not claim utility preservation |
| Static readiness | Checks 5-12 labeled ROADMAP/static | Remove the readiness screen |
| Adoption | CI described as hand-committed; CLI install described as ROADMAP | Replace adoption wording |
| Legal copy | "Risk indicator for developer or legal review; not legal advice" visible or spoken | Do not show legal cards |
| Timing | Three measured rehearsals at or under 3:00 | Keep `three_minute_timing_pass=false` |

## Live Route Script Constraints

LIVE is allowed only when the integration owner can show:

- current `run_id`
- current or opened artifact path
- attack evidence before protection
- guard/protection evidence
- same-test or mutation after evidence
- benign task pass evidence

Do not use live wording for:

- browser extension / real Shield Pill packaging
- `npx vibeshield install`
- generated GitHub Action
- readiness checks 5-12
- legal compliance determinations

## Recorded Route Script Constraints

Say early:

> This is a recorded real run from the demo harness; I am opening the saved evidence so the judges can see the same attack, guard decision, and after-test proof.

Required visible fields:

- run_id
- artifact path
- source label: RECORDED REAL RUN

Do not say:

- "I am running this now"
- "the live scan just found"
- "the CLI generated this workflow"

## Local Fallback Script Constraints

Say early:

> This is a local fallback view of the intended demo path. I will keep live claims out unless the evidence is visible.

Allowed:

- explain the workflow
- show static specs
- show claim ledger and readiness checklist

Not allowed:

- claim a current attack was blocked
- claim a current guard was installed
- claim three-minute timing pass

## Hard No-Go Conditions

Do not present the pitch as live if any of these are true:

- no current endpoint or recorded artifact is available
- no run_id or artifact path can be shown
- the presenter cannot show a benign task after protection
- the route requires saying the browser extension exists today
- the route requires showing `npx vibeshield install` as working
- the route requires saying readiness checks 5-12 are dynamic scanner results
- the route requires legal compliance guarantees

## Last-Slide Safe Close

Use this close when fully live:

> VibeShield turns one risky AI workflow into a debugging loop: run the attack, inspect the evidence, apply protection, and keep the same test as a deployment check.

Use this close when recorded:

> This recorded run shows the loop we are productizing: evidence first, protection second, regression proof third.

Use this close when local fallback:

> The spec is ready for integration review; the live claims stay off until the evidence is visible.
