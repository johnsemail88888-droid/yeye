# VibeShield — Team Progress Brief

**One-liner:** VibeShield is a *risk debugger for vibe-coded AI agents*. It opens a deployed AI product, finds where the agent can be hijacked, **proves it with real evidence**, installs a runtime guard, and **reruns the same attack to prove it's fixed** — from the deployed product, to the source, and back to verified behavior.

**Why it's not "just ask an AI":** prompt injection / excessive agency happens at the *moment a tool executes*. A text-level safety prompt can't stop it. We enforce the agent's **signed plan** at the tool boundary — so it's injection-agnostic, not keyword matching.

---

## Status: ✅ DEMO-READY (verified from real runs, runs offline, no API keys)

`verify_results.json` gates — every value computed from real artifacts:

| gate | state |
|---|---|
| core_loop_pass | ✅ |
| trace_evidence_pass | ✅ |
| mutation_generic_pass | ✅ |
| browser_live_loop_pass | ✅ |
| report_audit_pass | ✅ (auditor score 100/100) |
| three_run_stability_pass | ✅ (3/3) |
| phoenix_or_local_experiment_present | ✅ (229 OpenInference spans) |
| ci_artifact_generated | ✅ |
| **demo_ready** | **✅ true** |
| full_verification_pass | ⛔ false (honest — VS Code surface cut; demo video pending) |

## What actually works right now
The full vertical slice, on a controlled sandbox support agent (fake tools — no real money/email/records):

1. **Deployed product** (`/demo`): an Acme Support AI agent with a floating 🛡 VibeShield panel.
2. **Live scan** — the panel captures the real page scope; the daemon runs the real test suite. **Browser and desktop share the same `run_id`.**
3. **BEFORE = 5 real failures:** an unauthorized **$500 refund**, **customer PII emailed to an external address**, an over-threshold refund, and **2 paraphrased-attack variants** (proves it's not a one-off).
4. **Install guard** → **AFTER = 0 failures:** unauthorized refund → `HOLD_FOR_APPROVAL`, PII email → `BLOCKED`, normal support reply still `PASS`. The two paraphrased attacks are blocked too, with the *same structural reasons* (not keyword matching).
5. **Evidence + trace** for every finding (9-span local trace; OpenInference/Phoenix-ready).
6. **Reports + auditor:** developer + founder reports from real data; auditor fails on any fabricated metric, unsupported critical, or absolute legal claim. Legal output = *"risk indicator, not legal advice."*
7. **CI:** `.github/workflows/vibeshield.yml` reruns the loop on every push and gates on regressions.

## The 3-minute demo
`http://localhost:7878/demo` → panel **① Scan feature** (5 real failures, run_id) → **Open desktop** (same run_id) → **② Install guard & rerun** (red → green) → show the founder report + `demo_ready=true`. Closing line: *"From the deployed product to the source and back to verified behavior, with evidence at every step."*

## Sponsors — one project, stacked, only where real
- **ArmorIQ** (core): the runtime intent guard — labelled *ArmorIQ-compatible* (local adapter; real SDK is a code-swap + key).
- **Arize** ($1k): trace → eval → fix → reverify loop + before/after experiment (local OpenInference now; Phoenix UI via endpoint).
- **Anthropic** ($5k credits): Claude Agent SDK replaces the deterministic test agent (key in `.env.local`).
- **Token Company / Deepgram:** compression of risk context / voice briefing — wired as seams, only shown when real.

## Division of labor (tonight)
- **Claude Code = local integration owner:** real browser → daemon → desktop → trace → guard → after-verification, and the morning merge. Core (guard/daemon/schema) has exactly one owner.
- **Codex (parallel branches, don't touch core):** security tests (`codex/security-tests`), UI/Judge Mode (`codex/ui-judge-mode`), stability scripts (`codex/reliability`), docs/Devpost/Q&A (`codex/docs-qanda`). See `CODEX_OWNERSHIP.md`.
- **In progress:** a designed **Judge Mode** UI (read-only, real data).

## What's left
1. Drop API keys in `.env.local` → real Claude / ArmorIQ SDK / Phoenix cloud light up.
2. Record the 3-minute fallback video (shot list in `DEMO_RECOVERY.md`).
3. Morning: merge passing Codex branches per `MORNING_MERGE.md` (never bulk-merge).

## Run it (offline, no keys)
```
cd vibeshield && npm install
npx tsx src/daemon.ts        # http://localhost:7878  (desktop) + /demo (product)
# or re-prove from scratch:
npx tsx src/run.ts all       # BEFORE 5 FAIL -> AFTER 0 FAIL
npx tsx src/report.ts        # auditor 100/100
npx tsx src/demo-verify-three.ts   # 3/3 stable -> demo_ready=true
```

## Hard rule
No fabricated metric, trace, scan, block, or integration. A sponsor shows "integrated" only with a real artifact. Unfinished surfaces stay labelled "prototype / not connected." The offline core wins the demo on its own.
