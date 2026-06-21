# VibeShield Live Demo Script

Status: SPEC_ONLY
Target length: 3:00

This script assumes the integration owner has a daemon-backed demo state or a labeled recorded real run. If the daemon is unavailable, do not improvise live success. Use LOCAL FALLBACK or NOT CONFIGURED labels.

## Preflight Truth Badges

| Badge | Use only when |
| --- | --- |
| LIVE | Current endpoint or artifact proves the state during the demo |
| RECORDED REAL RUN | A saved artifact from a real run is opened and named |
| LOCAL FALLBACK | The demo uses local files because the daemon is not reachable |
| NOT CONFIGURED | The capability is absent or not wired |
| PLACEHOLDER / ROADMAP | The capability is planned but not implemented |

## 0:00-0:15 - Attention

Screen:
Open the deployed support/refund app or the labeled local demo.

Say:

> This app works. That is exactly why a first-time builder might ship it. But working normally tells us nothing about what happens when an untrusted user talks to an AI agent that can refund customers, access PII, or call external tools.

Evidence required:

- App or demo visible.
- If not live, label LOCAL FALLBACK.

## 0:15-0:35 - Interest

Screen:
Open the VibeShield entry point owned by the UI/integration worker.

Select:

- Support / Refund Flow

Say:

> Instead of scanning an entire company, I select one risky feature. VibeShield maps the surface and launches bounded test agents against only this authorized workflow.

Evidence required:

- Feature picker or equivalent documented action.
- If real Shield Pill / browser extension is not implemented, label PLACEHOLDER / ROADMAP and use the in-page demo entry point.

## 0:35-1:10 - Real Failure

Screen:
Run assessment if live. Otherwise open a recorded real run with artifact path.

Open:

- Critical finding
- Tool call attempt
- Evidence identifiers

Say:

> The normal user test passed. But an indirect prompt injection hidden in a support ticket caused the agent to attempt a high-impact refund and expose customer data.

Show:

- trusted user goal
- untrusted ticket content
- attempted high-impact tool call
- run_id, test_id, and artifact path

Evidence required:

- run_id
- test_id
- trace_id where available
- artifact path

## 1:10-1:35 - Why This Is Not A Wrapper

Screen:
Open trace/evidence chain.

Say:

> We are not asking an LLM whether the app looks secure. We run the workflow, capture the tool boundary, and evaluate the actual behavior. The trace shows the precise step where untrusted content changed a high-impact action.

Evidence required:

- Tool boundary event or recorded run artifact.
- Clear distinction between trusted goal and untrusted content.

## 1:35-2:05 - Apply Protection

Screen:
Use the integration-owned guard action only if it is wired. Otherwise open the policy/diff as RECORDED REAL RUN or integration request.

Say:

> VibeShield installs a plan-aware runtime guard. The trusted goal allows a support reply, but a large refund requires human approval, and customer PII cannot be sent to an unauthorized destination.

Evidence required:

- Guard/policy source or verified artifact.
- Approval threshold or block reason.

## 2:05-2:30 - Same-Test Proof

Screen:
Show before/after verification.

Say:

> This is the same test, plus an independently rephrased attack. Both are stopped by generic policy checks, while the normal workflow still works.

Show:

- original attack: NEEDS_APPROVAL or BLOCKED
- mutation attack: BLOCKED
- benign support task: PASS

Evidence required:

- verify artifact or recorded real run.
- Do not claim PASS without evidence.

## 2:30-2:48 - Secondary Breadth

Screen:
Open static readiness checklist.

Say exactly:

> VibeShield also surfaces a static readiness checklist, marked as roadmap where it is not yet implemented: rate limits, per-user AI budgets, specific error handling, streaming UX, audit logs, privacy declarations, and relevant UGC or platform obligations. Legal items are evidence-backed review indicators, not legal advice.

Evidence required:

- Readiness items 5-12 are labeled ROADMAP unless the repo later implements them.
- Legal cards include "Risk indicator for developer or legal review; not legal advice."

## 2:48-3:00 - Action

Screen:
Show current CI/policy artifact, labeled honestly.

Say:

> One live scan finds the failure. One source connection fixes it. The same test becomes a continuous check on every deployment. The one-command install is roadmap; today this demo uses the repo's hand-committed workflow and verified artifacts.

Evidence required:

- Existing workflow is described as hand-committed, not generated.
- `npx vibeshield install` is not shown as a working command.

## Stop Rule

Stop at 3:00. Do not explain architecture unless a judge asks.
