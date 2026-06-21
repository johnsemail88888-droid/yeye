# VibeShield Studio — Research Decisions and Final Loop Architecture

## 1. Hard conclusion

VibeShield should not be implemented as one giant agent that repeatedly “searches the internet, scans everything, writes a report, and fixes everything.” That design is slow, expensive, hard to evaluate, and impossible to demo reliably.

The correct architecture is **three nested loops with durable evidence**:

1. **Risk Intelligence Loop** — periodically researches authoritative sources, extracts testable risk patterns, and publishes a versioned detector corpus.
2. **Target Assessment Loop** — for one authorized live app or source project, fingerprints only the selected scope, retrieves relevant patterns, runs deterministic scanners and bounded agent tests, and produces evidence-backed findings.
3. **Remediation & Regression Loop** — diagnoses the root cause, installs a patch or runtime guard, reruns the identical test plus paraphrase and benign regression cases, compares before/after in Phoenix, and keeps the test in CI.

The product is therefore not “AI-generated security advice.” It is:

> **Current risk knowledge → target-specific tests → reproducible evidence → source/runtime remediation → verified behavior → continuous regression protection.**

## 2. Why this structure is technically correct

- AI-agent risk cannot be reduced to prompt wording. OWASP explicitly treats indirect prompt injection and excessive agency as risks involving untrusted external content, tool permissions, autonomy, high-impact actions, and missing downstream authorization.
- API assessment needs object/function authorization, authentication, resource consumption, sensitive business flows, SSRF, misconfiguration, inventory, and unsafe third-party API consumption—not only prompt injection.
- A reliable debugging loop needs traces, evaluations, a stable dataset, and before/after experiments on the same inputs. Phoenix is suitable for this role.
- Runtime protection should mediate every high-impact tool call. ArmorIQ’s documented flow is plan capture → signed intent token → policy-checked invoke, with allow/hold/block decisions.
- Legal output cannot be a definitive “you violated the law” scanner. The product should emit evidence-backed **risk indicators**, applicability questions, confidence, official references, and an explicit request for professional review.
- Automated accessibility testing is useful but partial. axe-core/WCAG findings must distinguish verified automated issues from items requiring manual review.

## 3. Research domains and what VibeShield must produce

| Domain | Research output | Target detector/test | Risk-reduction output | Verification |
|---|---|---|---|---|
| Agent security | Prompt injection, excessive agency, PII exfiltration, unsafe tools, memory/tool poisoning | Promptfoo/custom harness, tool-call trace, policy alignment | Least privilege, untrusted-data boundary, approval, ArmorIQ guard | Same attack + paraphrase blocked; benign task passes |
| Web/API | BOLA/IDOR, auth, function authorization, resource abuse, business-flow abuse, SSRF, config | Playwright/API tests, ZAP passive, route/source checks | Ownership checks, auth middleware, validation, rate limit | Unauthorized case denied; valid user flow passes |
| Code/secrets/dependencies | Injection sinks, unsafe process use, hardcoded keys, vulnerable packages | Semgrep, Gitleaks, OSV-Scanner | Source patch, key rotation checklist, dependency update | Re-scan clean or accepted risk documented |
| Privacy/data | Data inventory, PII in logs/traces, third-party AI transfer, deletion/retention | DOM/network/source/trace inspection | Data minimization, redaction, disclosure, retention controls | PII test blocked/redacted; disclosure present where applicable |
| Legal/compliance indicators | Privacy notice, children, AI disclosure, high-impact decisions, sector escalation | Evidence + applicability questionnaire | Developer/legal review checklist, human escalation | Report auditor confirms no unsupported legal conclusion |
| AI claims | Unsupported “secure/compliant/unbiased/no hallucination/professional replacement” claims | Landing-page claim scanner | Substantiation request or safer copy | Claim mapped to evidence or marked for review |
| Accessibility | Labels, focus, keyboard, contrast, status messages, accessible auth | axe-core + Playwright keyboard flows | Source/UI patch | Automated issue gone; manual-review items remain labeled |
| Architecture/DevOps | Debug exposure, unsafe CORS/cookies, CI gaps, monitoring, deployment defaults | Source/config/network scan | GitHub Action, hardened config, Sentry/monitoring hook | CI artifact created and verification reruns |

## 4. Open-source implementation decisions

Use adapters and normalize output instead of recreating mature scanners:

- Playwright: browser execution, screenshots, network/console evidence, trace ZIP.
- axe-core: automated accessibility findings; preserve “incomplete/manual review” status.
- Semgrep Community Edition: source patterns and custom VibeShield rules.
- Gitleaks: exposed secrets.
- OSV-Scanner: dependency vulnerabilities and optional license information.
- OWASP ZAP Baseline: passive/bounded live-web checks; active scanning disabled by default.
- Promptfoo: Node-friendly LLM/agent eval and red-team configuration/CI.
- AgentDojo: source of realistic agent-task and indirect-injection patterns; import patterns, do not make its full runtime a P0 dependency.
- Arize Phoenix: traces, evaluators, datasets, experiments, before/after comparison.
- ArmorIQ: real runtime intent enforcement when credentials/integration are available; local interface-compatible guard otherwise.

## 5. Demo contract

The hackathon demo should show one complete vertical slice, not broad unsupported maturity:

1. Open an authorized deployed support-agent demo app.
2. Select the support/refund feature from the browser Shield Pill.
3. Show relevant patterns retrieved from the cached risk corpus.
4. Run a bounded BEFORE suite.
5. Reproduce at least one indirect-injection tool-abuse failure and one PII failure with real artifacts.
6. Open the Phoenix/local trace at the exact bad step.
7. Connect source and install a real policy/tool proxy or ArmorIQ integration.
8. Rerun the same cases plus one paraphrase and benign regression case.
9. Show high-impact action blocked/held, PII protected, and legitimate support flow preserved.
10. Generate and audit developer + founder reports, then generate CI artifacts.

Do not perform full live web research during the three-minute demo. Load a provenance-rich cached corpus and optionally demonstrate importing one new source. This keeps the demo real and reliable.

## 6. The key evaluation rule

A finding progresses through explicit states:

```text
HYPOTHESIS
→ OBSERVED
→ REPRODUCED
→ REMEDIATED
→ VERIFIED
```

A Critical finding is prohibited unless it is at least `REPRODUCED`, has concrete evidence, and passes the evidence/severity evaluators. A fix is prohibited from being labeled `VERIFIED` unless the identical test, a mutation/paraphrase test, and benign regression tests have run.

## 7. Report design

Produce two reports:

- **Developer report:** exact files/lines/routes/tools, commands, evidence artifacts, patch diff, before/after result, residual work.
- **Founder/CTO report:** plain language, business impact, risk indicators, fixed vs unresolved, prioritized next steps.

Add an **Evidence Explorer** that can search the report with natural-language questions, but every answer must cite internal IDs such as `finding_id`, `evidence_id`, `test_id`, and `source_id`. It may not answer from general model memory when evidence is absent.

## 8. Core product intent in one sentence

> **VibeShield Studio continuously turns authoritative risk intelligence into scoped tests for live and in-development AI products, then traces, fixes, verifies, and keeps those risks from regressing.**
