# Judge Q&A

Status: SPEC_ONLY
Answer style: lead with what is proved, then name the limit.

For sponsor or integration questions, also check `docs/pitch-v2/SPONSOR_INTEGRATION_TRUTH_TABLE.md`.

## 1. Why is this not another static scanner?

10-second answer:
VibeShield runs the workflow and captures behavior at the tool boundary, then uses static context to explain and prevent the failure.

30-second technical answer:
The static scanner identifies high-impact tools and missing controls, but the demo proof comes from running an authorized support/refund workflow and comparing before/after behavior. The strongest evidence is the attempted tool call, guard decision, and verification result.

Screen/file:
Trace or verify artifact; `docs/pitch-v2/DEMO_CLICK_MAP.md`.

Honest limitation:
Readiness checks 5-12 are roadmap/static checklist items today.

## 2. Why can't a developer just ask Claude whether the app is secure?

10-second answer:
A chat answer can reason about code, but it cannot prove what a deployed workflow actually did unless it runs and records the behavior.

30-second technical answer:
The risk is the gap between intended behavior and runtime tool calls. VibeShield tests the workflow, records evidence, and turns the same attack into a regression check. LLM review can help explain, but the demo depends on artifacts.

Screen/file:
Before/after trace evidence.

Honest limitation:
VibeShield still needs source or runtime access to produce high-confidence findings.

## 3. What is actually dynamic?

10-second answer:
The attack, tool-call capture, guard decision, and after-test verification are dynamic when backed by daemon artifacts.

30-second technical answer:
The live loop should show an authorized support/refund scenario before and after protection. Dynamic means the same workflow is exercised and evidence is saved. Static readiness and legal summaries must be labeled separately.

Screen/file:
run_id, test_id, trace artifact, verify artifact.

Honest limitation:
If the daemon is unavailable, the demo must use RECORDED REAL RUN or LOCAL FALLBACK labels.

## 4. Which attacks are real and which services are sandboxed?

10-second answer:
The prompt-injection and tool-boundary behavior are real inside the demo harness; money, email, and customer data are fake.

30-second technical answer:
The support/refund app uses controlled fake customer data and fake external tools. That makes the exploit safe to run while preserving the key product question: did untrusted content influence a high-impact tool call?

Screen/file:
Support/refund flow evidence.

Honest limitation:
The demo does not send real money or external messages.

## 5. How does the guard avoid keyword blocking?

10-second answer:
It checks the trusted plan, tool risk, destination, and approval requirement rather than just matching attack words.

30-second technical answer:
The pitch should show the trusted user goal, untrusted ticket text, attempted tool call, and guard reason. The guard allows normal support replies but blocks or holds high-impact actions outside the authorized plan.

Screen/file:
Guard decision and policy/diff artifact.

Honest limitation:
The exact production guard policy must be reviewed by the integration owner.

## 6. How do you measure false positives?

10-second answer:
By proving benign support still passes after protection.

30-second technical answer:
The same test suite should include an attack, a paraphrased attack, and a benign support task. A good demo shows attack outcomes blocked or held while normal support still works.

Screen/file:
Before/after comparison.

Honest limitation:
The hackathon demo is a narrow support/refund scenario, not a broad benchmark.

## 7. How do you prove normal utility was preserved?

10-second answer:
The after-test must include a benign support workflow that still passes.

30-second technical answer:
The pitch should never stop at "blocked attack." It must show a legitimate support task that still completes under the guard. That is the difference between useful protection and breaking the app.

Screen/file:
Verify artifact with benign task status.

Honest limitation:
Utility preservation is scoped to the demo workflow.

## 8. What can a browser scan know, and what requires source access?

10-second answer:
Browser context can see visible flows and network behavior; source access is needed for precise guard wiring and CI regression.

30-second technical answer:
A browser view can help choose the workflow and collect runtime behavior. Source access lets VibeShield map tools, install policy, and persist tests in CI. The real browser extension is roadmap unless implemented by the UI owner.

Screen/file:
Demo click map and integration request.

Honest limitation:
No real browser plugin ships from this branch.

## 9. Why are legal findings not legal advice?

10-second answer:
They are risk indicators for developer or legal review, not determinations of compliance.

30-second technical answer:
A legal card can point to evidence, applicability questions, platform context, confidence, official source, safe next action, and limitations. It cannot decide jurisdiction-specific obligations or draft final legal terms.

Screen/file:
`docs/pitch-v2/LEGAL_CLAIM_MATRIX.md`.

Honest limitation:
Counsel review is required for legal conclusions.

## 10. Which legal claims from social media are misleading?

10-second answer:
Universal AI disclosure fines, one-sentence arbitration immunity, and automatic DMCA protection are misleading.

30-second technical answer:
AI-related claims must not be deceptive or unsubstantiated, but there is no universal single AI disclosure that cures every risk. Arbitration depends on drafting, notice, assent, and law. DMCA safe harbor has multiple conditions, not just agent registration.

Screen/file:
Legal claim matrix.

Honest limitation:
The matrix is a demo safety guide, not legal advice.

## 11. What is the real role of Arize?

10-second answer:
Treat it as observability context only if the integration actually exists.

30-second technical answer:
The pitch should not imply a live Arize connection unless a real artifact proves it. If mentioned, say observability integrations are a production path and keep the demo focused on VibeShield's own evidence.

Screen/file:
Integration truth badge.

Honest limitation:
No Arize integration is claimed by this SPEC_ONLY branch.

## 12. What is the real role of ArmorIQ?

10-second answer:
ArmorIQ can be referenced as compatible guard framing only when the repo artifact supports that language.

30-second technical answer:
The demo should show a plan-aware runtime guard and policy behavior, not overclaim a third-party product integration. Use "ArmorIQ-style" only if it is already in the repo copy and do not imply a live external service.

Screen/file:
Guard/policy artifact.

Honest limitation:
External ArmorIQ integration is not implemented here.

## 13. What is the real role of Token Company?

10-second answer:
Token budgets are roadmap readiness indicators unless a real check is implemented.

30-second technical answer:
Per-user AI cost caps are useful product-readiness checks, but `src/scan.ts` does not implement token-cap detection today. Keep this item in the static readiness checklist.

Screen/file:
Readiness checklist.

Honest limitation:
No token budget integration is claimed by this branch.

## 14. What does the product support today?

10-second answer:
Today it supports a controlled support/refund risk loop with static tool-risk mapping, runtime evidence, guard behavior, and verification when the demo artifacts are available.

30-second technical answer:
The repo has a scanner for known tools and guard/approval-gate presence, daemon endpoints for state and run actions, and a hand-committed CI workflow. The exact live state must be shown from current artifacts.

Screen/file:
Demo state, scanner evidence, workflow file.

Honest limitation:
Installable CLI, browser extension, generated CI, and readiness checks 5-12 are roadmap.

## 15. What would productionization require?

10-second answer:
Broader integrations, stronger policy configuration, repeatable evidence storage, auth, tenant isolation, and measured false-positive evaluation.

30-second technical answer:
The demo proves the loop in one workflow. Production would need secured connectors, durable audit storage, role-based access, policy versioning, source-control integration, team approval flows, and a broader test corpus.

Screen/file:
Handoff and integration request.

Honest limitation:
This branch intentionally creates specs and docs only.
