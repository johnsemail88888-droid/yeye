# ⛔ MANDATORY OVERRIDE — Codex Live Pitch automation (read FIRST; wins over everything below)

This task runs **SPEC_ONLY**. Both coordination reviews in `docs/coordination/` (CLAUDE + CODEX_PEER) decided **APPROVE_SPEC_ONLY**. Obey these rules; where the spec below conflicts, THIS section wins.

1. **Isolated clone.** Never work in the live working copy `C:\Users\Admin\Desktop\vibeshield` (it runs the daemon + integration loop). If `C:\Users\Admin\Desktop\vibeshield-pitch` does not exist: `git clone https://github.com/johnsemail88888-droid/vibeshield.git C:\Users\Admin\Desktop\vibeshield-pitch`; else `cd` in and `git fetch origin`. Branch `codex/live-pitch-experience-v2` **off `origin/main`**. Never commit to / push `main` or `overnight-base`.
2. **SPEC_ONLY scope.** Write ONLY under `docs/pitch-v2/**`, `tests/pitch-spec/**`, and `docs/coordination/CODEX_LIVE_PITCH_HANDOFF.md`. Build NO UI. Create nothing under `packages/`, `src/`, `web/`, `ui-next/`, `extension/`, `desktop/`, `design/`, `.github/`; do not touch `package.json`.
3. **Mode B is REJECTED.** Do not build a Judge Mode / Shield Pill / Mode-1 / Mode-2 UI — that belongs to the `codex/uiux-auto` automation (in `ui-next/`). Reference/consume it in docs only.
4. **Never start the daemon; never run `npm` / `tsx` / `node src/*` / `demo:*`** (they overwrite live demo artifacts). For real data read `GET http://127.0.0.1:7878/api/state` read-only ONLY if it is already up, else label everything `PLACEHOLDER` / `MOCK`.
5. **Label unsupported capabilities PLACEHOLDER / ROADMAP** (never "implemented"/"live"): `npx vibeshield install` (no such CLI), readiness checks #5-12 (rate-limit/token-cap/streaming/audit/privacy/Apple-Google/UGC-DMCA — scanner implements none), a real browser Shield Pill/plugin (only the in-page demo.html widget exists), a "generated" GitHub Action (CI is hand-committed). Rewrite the 2:30-2:48 pitch line as "VibeShield also surfaces a static readiness checklist (roadmap)", never "the same assessment also checks ...".
6. **Git hygiene.** Stage owned paths by name (`git add docs/pitch-v2 tests/pitch-spec docs/coordination/CODEX_LIVE_PITCH_HANDOFF.md`); never `git add -A` / `git add .`. Commit on `codex/live-pitch-experience-v2`, `git push origin codex/live-pitch-experience-v2`, never merge your own branch.
7. **Truth.** Every claim maps to a real artifact or a labeled placeholder. Keep the legal matrix "risk indicator, not legal advice" discipline.

Run frequency: every 30 minutes, tonight through tomorrow morning.

---
# VibeShield â€” Codex Live Pitch + Product Experience Automation

## Purpose

This task turns the current VibeShield vertical slice into a polished **live hackathon demo and use-case pitch**. It does **not** create a marketing video and it does **not** replace the core engineering loop owned by Claude Code.

The live story is:

`deployed AI app â†’ select one feature â†’ run real risk tests â†’ show one real failure â†’ inspect evidence/trace â†’ apply a real guard/fix â†’ rerun the identical test plus mutations â†’ preserve benign utility â†’ show deployment and report`

The task has two linked workstreams:

1. **BUILD / PRODUCT EXPERIENCE** â€” make the demo path easy, polished, responsive, and truthful.
2. **PITCH / JUDGE EXPERIENCE** â€” turn the live demo into a three-minute AIDA narrative with grounded claims and a prepared Q&A.

Do not summarize this task. Follow the coordination gate first, then execute the permitted mode.

---

# 0. Non-conflict coordination gate

This task overlaps conceptually with the existing Codex workers:

- `PROMPT C â€” Codex UI / Judge Mode Worker`
- `PROMPT E â€” Codex Documentation, Devpost, Pitch, and Q&A Worker`

Therefore this automation must **not** start broad implementation blindly.

## Required files to read

Read all that exist:

- `CURRENT_STATE.md`
- `IMPLEMENTATION_PLAN.md`
- `OVERNIGHT_STATE.md`
- `VIBESHIELD_STUDIO_MASTER_PROMPT_V4_RESEARCH_LOOPS.md`
- `VIBESHIELD_DUAL_AGENT_OVERNIGHT_MASTER.md`
- `docs/CODEX_UI_HANDOFF.md`
- `docs/CODEX_DOCS_HANDOFF.md`
- `docs/CODEX_RELIABILITY_HANDOFF.md`
- `docs/CODEX_SECURITY_REVIEW.md`
- active git branches and worktrees

## Approval files

Before editing shared UI or pitch files, require both:

- `docs/coordination/CLAUDE_PITCH_AUTOMATION_REVIEW.json`
- `docs/coordination/CODEX_PEER_PITCH_AUTOMATION_REVIEW.json`

Accepted decisions:

- `APPROVE_SPEC_ONLY`
- `APPROVE_IMPLEMENTATION`
- `REJECT`

## Safe modes

### Mode A â€” SPEC_ONLY

Use this mode when either existing UI/docs worker is still active or either approval says spec-only.

Allowed paths:

- `docs/pitch-v2/**`
- `tests/pitch-spec/**`
- `docs/coordination/CODEX_LIVE_PITCH_HANDOFF.md`

Do not edit runtime, existing UI surfaces, daemon, guard, scanner, schemas, root package files, or existing pitch documents.

### Mode B â€” IMPLEMENT_DELTA

Use only when both review files say `APPROVE_IMPLEMENTATION`.

Preferred owned paths:

- `packages/judge-mode-v2/**`
- `tests/pitch/**`
- `docs/pitch-v2/**`
- `docs/coordination/CODEX_LIVE_PITCH_HANDOFF.md`

Do not edit core runtime, daemon, guard, trace generation, browser synchronization, security policy, root lockfiles, or result schemas. If wiring into an existing surface is required, create a small integration patch request in:

- `docs/pitch-v2/CLAUDE_INTEGRATION_REQUEST.md`

Claude Code remains the integration owner.

## Branch

Use:

- `codex/live-pitch-experience-v2`

Do not merge your own branch.

---

# 1. Product truth and legal fact-check rules

The user-provided examples contain useful **copywriting structure**, but several legal statements are too absolute. Learn the style, not the unsupported claims.

## Safe claim matrix

### FTC and AI disclosure

Do not say:

- â€œEvery AI app must disclose AI use or the FTC automatically fines it $51,000 per violation per day.â€

Use:

- â€œAI-related marketing, capabilities, privacy practices, and consumer-facing representations must not be deceptive or unsubstantiated.â€
- â€œVibeShield flags unclear AI disclosures and unsupported claims for developer or legal review.â€

There is no universal one-sentence disclosure that automatically cures every FTC risk.

### Arbitration

Do not say:

- â€œOne arbitration sentence prevents class actions and saves millions.â€

Use:

- â€œThe appâ€™s Terms do not visibly address dispute resolution; this may warrant counsel review.â€

Never auto-insert an arbitration clause. Enforceability and suitability depend on jurisdiction, drafting, notice, assent, and business context.

### Apple and Google privacy declarations

Safe claim:

- Apple App Privacy Details and Google Play Data Safety require developers to accurately describe relevant data collection/sharing, including third-party SDK practices.
- VibeShield can create a draft data inventory and flag mismatches or missing disclosures.

Do not say Apple itself creates automatic CCPA liability.

### User-generated content and DMCA

Safe claim:

- A qualifying online service may seek DMCA section 512 safe-harbor protection, but agent registration is only one condition.
- The current U.S. Copyright Office registration fee is $6.
- A complete process may also require public agent information, notice-and-takedown handling, counter-notice handling, repeat-infringer policy, and other statutory conditions.
- Statutory damages for willful infringement can reach $150,000 per work, but that is not automatic liability for every UGC upload.

### Legal output rule

Every legal card and report must say:

> Risk indicator for developer or legal review; not legal advice.

Every legal card must include:

- observed evidence
- applicability questions
- jurisdiction or platform context
- confidence
- official source
- safe next action
- limitations

---

# 2. BUILD workstream â€” product and UI/UX

## 2.1 The demoâ€™s primary use case

Use one controlled deployed product:

- AI customer-support application
- support/refund flow
- fake customer data
- fake email/refund tools
- no real money or external messages

The browser plugin/floating pill selects this feature and starts a bounded assessment.

## 2.2 What the assessment checks

The live demo should run a small, credible set of checks:

### Core security checks

1. indirect prompt injection affecting a high-impact tool
2. PII disclosure in output or fake outbound tool arguments
3. approval gate for refund above threshold
4. legitimate support workflow preserved after protection

### Operational readiness checks inspired by the user examples

5. rate limiting or request quota indicator
6. per-user token/cost cap indicator for AI-heavy flows
7. specific and actionable error handling instead of only generic errors
8. response streaming for user-facing AI output where appropriate
9. observability/audit logging for high-impact agent actions

These checks are product-readiness indicators. They must not be presented as automatic legal violations.

### Platform/privacy checks

10. privacy/data inventory completeness indicator
11. Apple/Google privacy declaration readiness indicator if the product is framed as a mobile app
12. UGC/DMCA workflow indicator only when the app actually accepts user uploads

Do not show all twelve live. The live pitch uses one critical exploit and a compact readiness summary of secondary findings.

## 2.3 UX polish requirements

Apply the useful principles from the userâ€™s examples with technical judgment.

### Loading

- Use skeleton layouts for predictable finding lists, trace cards, and reports.
- Show named progress stages for long scans.
- Do not use a fake spinner that hides an unknown state.
- If progress cannot be measured, say what is currently happening.

### Caching

Cache:

- sourced risk corpus
- recent project metadata
- last successful scan summary
- static screenshots and report artifacts

Do not cache stale security decisions as if they are current. Display freshness timestamps.

### Optimistic UI

Optimistically update only reversible UI state, such as:

- expanding a panel
- pinning a finding
- marking a card reviewed
- starting an animation

Do not optimistically display:

- â€œattack blockedâ€
- â€œguard installedâ€
- â€œreport passedâ€
- â€œintegration liveâ€

Those states require actual backend evidence.

### Tooltips

Every icon-only action must have:

- visible tooltip on hover and keyboard focus
- accessible name
- concise description

### Error messages

Errors must state:

- what failed
- likely cause
- whether data is safe
- exact recovery action
- link/button to retry or open diagnostics

Do not show only â€œSomething went wrong.â€

### Streaming activity

Display real event-stream progress from the daemon:

- scope captured
- mapper running
- attack test running
- trace saved
- guard decision
- after verification

Do not fabricate token-by-token model output if the backend is not streaming.

### Auditability

Every visible finding must resolve to:

- `project_id`
- `run_id`
- `test_id`
- `trace_id` where applicable
- artifact path

## 2.4 Judge Mode state machine

Create a single guided path with one primary action per state:

1. `Choose feature`
2. `Run live assessment`
3. `Review failure`
4. `Apply protection`
5. `Verify same attack`
6. `View readiness report`
7. `Deploy continuously`

The UI should not overwhelm the judge with all product capabilities at once.

## 2.5 Required Judge Mode components

Implement or specify:

- draggable browser Shield Pill with edge snap
- feature picker overlay
- live agent activity list
- one critical finding card
- evidence-chain breadcrumb
- trace view
- real source/guard diff view
- same-test Before/After comparison
- compact readiness checklist
- deploy/CI card
- Demo Health panel
- Reset Demo button
- integration truth badges:
  - `LIVE`
  - `LOCAL FALLBACK`
  - `RECORDED REAL RUN`
  - `NOT CONFIGURED`

## 2.6 No fake polish

Animations may emphasize state transitions, but must not conceal latency or invent success.

Required animation principles:

- 80â€“420 ms for ordinary UI transitions
- reduced-motion support
- no blocking decorative animation
- risk-path animation must be driven by actual trace events
- number animations must use actual artifact values

---

# 3. PITCH workstream â€” live demo, not edited video

## 3.1 Pitch framework

Use AIDA as a narrative structure:

- **Attention** â€” make the problem immediately concrete.
- **Interest** â€” show the product inspecting a real deployed feature.
- **Desire** â€” prove it finds, explains, and fixes something a normal wrapper cannot.
- **Action** â€” show how a developer adopts it in one step.

Do not mention AIDA during the pitch. Use it invisibly.

## 3.2 Safe opening hook

Preferred hook:

> Vibe coding makes shipping an app the easy part. What it does not give a first-time builder is a security, reliability, privacy, and compliance review before real users arrive.

Then:

> VibeShield is a live risk debugger for AI products. It tests a deployed feature, traces the exact failure, connects it to source, applies protection, and reruns the same attack to prove the fix.

Do not use â€œ16,000 usersâ€ unless the project has a real, cited metric.

## 3.3 Three-minute live pitch script

### 0:00â€“0:15 â€” Attention

Show the deployed support app working normally.

Say:

> This app works. That is exactly why a first-time builder might ship it. But working normally tells us nothing about what happens when an untrusted user talks to an AI agent that can refund customers, access PII, or call external tools.

### 0:15â€“0:35 â€” Interest

Open the VibeShield Shield Pill.

Select:

- `Support / Refund Flow`

Say:

> Instead of scanning an entire company, I select one risky feature. VibeShield maps the surface and launches bounded test agents against only this authorized workflow.

Press:

- `Run live assessment`

### 0:35â€“1:10 â€” Real failure

Show actual progress, then open the critical finding.

Say:

> The normal user test passed. But an indirect prompt injection hidden in a support ticket caused the agent to attempt a five-hundred-dollar refund and expose customer data.

Show:

- trusted user goal
- untrusted ticket content
- exact tool call attempt
- `run_id`, `test_id`, and evidence

### 1:10â€“1:35 â€” Explain why this is not a wrapper

Open the trace.

Say:

> We are not asking an LLM whether the app looks secure. We run the workflow, capture the tool boundary, and evaluate the actual behavior. The trace shows the precise step where untrusted content changed a high-impact action.

### 1:35â€“2:05 â€” Desire: apply a real protection

Press:

- `Apply protection`

Show real diff/policy.

Say:

> VibeShield installs a plan-aware runtime guard. The trusted goal allows a support reply, but a large refund requires human approval, and customer PII cannot be sent to an unauthorized destination.

### 2:05â€“2:30 â€” Same-test proof

Press:

- `Verify same attack`

Show:

- original attack: `NEEDS_APPROVAL` or `BLOCKED`
- mutation attack: `BLOCKED`
- benign support task: `PASS`

Say:

> This is the same test, plus an independently rephrased attack. Both are stopped by generic policy checks, while the normal workflow still works.

### 2:30â€“2:48 â€” Secondary use-case breadth

Open the readiness summary.

Say:

> The same assessment also checks the things first-time builders commonly forget: rate limits, per-user AI budgets, specific error handling, streaming UX, audit logs, privacy declarations, and relevant UGC or platform obligations. Legal items are evidence-backed review indicators, not legal advice.

### 2:48â€“3:00 â€” Action

Show:

- `npx vibeshield install`
- generated GitHub Action / policy artifact

Say:

> One live scan finds the failure. One source connection fixes it. The same test becomes a continuous check on every deployment. VibeShield turns risk from a checklist into a debugging loop.

Stop.

## 3.4 What not to do

- Do not begin with architecture or sponsor logos.
- Do not show a slide deck before the product.
- Do not list every risk domain aloud.
- Do not use fabricated statistics or penalties.
- Do not say the app is â€œcompliant,â€ â€œlawsuit-proof,â€ or â€œguaranteed secure.â€
- Do not explain every Agent.
- Do not click through more than one primary vulnerability.
- Do not spend time on video editing.
- Do not speed up or cut product behavior in a way that misrepresents latency.
- Do not end with â€œwe plan to.â€ End with what works and the adoption step.

## 3.5 Required pitch outputs

Create:

- `docs/pitch-v2/AIDA_BEAT_SHEET.md`
- `docs/pitch-v2/LIVE_DEMO_SCRIPT.md`
- `docs/pitch-v2/DEMO_CLICK_MAP.md`
- `docs/pitch-v2/JUDGE_QA.md`
- `docs/pitch-v2/LEGAL_CLAIM_MATRIX.md`
- `docs/pitch-v2/USE_CASES.md`
- `docs/pitch-v2/DEVPOST_COPY.md`
- `docs/pitch-v2/MORNING_REHEARSAL.md`

No video-editing deliverable is required. A raw continuous fallback screen recording may be documented after the live path is stable, but do not spend this task on editing it.

---

# 4. Judge Q&A requirements

For every question provide:

- 10-second answer
- 30-second technical answer
- screen/file to open
- honest limitation

Cover:

1. Why is this not another static scanner?
2. Why canâ€™t a developer just ask Claude whether the app is secure?
3. What is actually dynamic?
4. Which attacks are real and which services are sandboxed?
5. How does the guard avoid keyword blocking?
6. How do you measure false positives?
7. How do you prove normal utility was preserved?
8. What can a browser scan know, and what requires source access?
9. Why are legal findings not legal advice?
10. Which legal claims from social media are misleading?
11. What is the real role of Arize?
12. What is the real role of ArmorIQ?
13. What is the real role of Token Company?
14. What does the product support today?
15. What would productionization require?

---

# 5. Acceptance gates

Write results to:

- `docs/pitch-v2/pitch_automation_results.json`

Schema:

```json
{
  "coordination_pass": false,
  "source_truth_pass": false,
  "live_demo_script_pass": false,
  "aida_structure_pass": false,
  "legal_fact_check_pass": false,
  "ui_truthfulness_pass": false,
  "operational_readiness_checks_pass": false,
  "three_minute_timing_pass": false,
  "judge_qa_pass": false,
  "no_runtime_conflict_pass": false,
  "overall_pass": false,
  "evidence": []
}
```

## Gate P0 â€” Coordination

- both review JSON files exist
- mode is permitted
- owned paths are documented
- no active overlapping worker is ignored

## Gate P1 â€” Truthful legal and product claims

- legal claim matrix exists
- no blanket FTC disclosure/fine claim
- no arbitration immunity claim
- Apple/Google claims are accurately scoped
- DMCA statement includes safe-harbor conditions and limitations
- no unsupported number appears

## Gate P2 â€” Product quality features

The UX/spec covers:

- skeleton loading
- caching with freshness
- limited optimistic UI
- actionable errors
- accessible tooltips
- streaming activity
- observability/audit evidence

The scanner/readiness model covers:

- rate limiting
- per-user AI usage caps
- specific error handling
- streaming response indicator
- audit logging

## Gate P3 â€” Live demo alignment

The script uses only actions that exist or have an approved integration request.

Every claimed result maps to a real artifact or an explicit placeholder.

## Gate P4 â€” AIDA and timing

- opening hook under 15 seconds
- product visible in first 20 seconds
- real failure visible by 70 seconds
- fix begins by 95 seconds
- after proof completes by 150 seconds
- action/close completes by 180 seconds

## Gate P5 â€” No runtime conflict

- no edit to daemon, guard, trace generation, scanner, or result schemas
- no duplicate Judge Mode backend
- no conflicting root dependency change
- no merge performed by Codex

## Gate P6 â€” Rehearsal

Create a timing table from at least three rehearsals.

Do not invent rehearsal results. If not run, mark false.

## Completion

`overall_pass=true` only when all gates pass.

---

# 6. Handoff

Write:

- `docs/coordination/CODEX_LIVE_PITCH_HANDOFF.md`

Include:

- mode used
- review decisions
- files changed
- commands run
- tests run
- exact unsupported items left as placeholders
- conflicts avoided
- integration requests for Claude
- final pitch timing
- known risks

Commit on `codex/live-pitch-experience-v2` and do not merge.

