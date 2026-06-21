# VibeShield — IMPLEMENTATION_PLAN (shortest path to the 3-min demo)

Goal (DEMO MODE OVERRIDE): one vertical slice where **every button in the 3-min demo works**, all numbers come from real runs, and the demo path succeeds 3× in a row. Stop adding features after that.

## The 3-minute demo path (the only required scenario)
1. Open the Studio (localhost:7878) on the controlled support-agent project.
2. Show retrieved findings (risk_map) for the support/refund feature.
3. Run BEFORE → reproduce unauthorized refund + PII leak (real `runs/before`).
4. Open the failing step's trace/evidence.
5. "Install guard" / show the policy.
6. Rerun the **same** attack + a **paraphrased mutation** + benign controls.
7. Show BLOCK / HOLD_FOR_APPROVAL, PII protected, normal support still PASS.
8. Show the audited report + one grounded Evidence-Explorer answer.
9. Show the generated CI artifact.

## Build order (what's done → what's next)
- [x] G-core: demo target + scanner + BEFORE(3 fail) + guard + identical AFTER + verify
- [x] G-mut: paraphrased **mutation** AFTER still blocked
- [x] G-ui: local daemon + web control plane + working "rerun" loop button
- [ ] **NEXT 1 — Local trace + evidence panel**: emit canonical trace JSON per run (spans: user_goal → untrusted_input → tool_call_attempt → guard_decision → eval) and link findings→trace in the UI. (satisfies `phoenix_or_local_experiment_present` locally; Phoenix cloud = P1 w/ key)
- [ ] **NEXT 2 — Reports + auditor**: generate `report-developer.md` + `report-founder.md` from real artifacts; `report-audit.json` (no fake metrics / no unsupported critical / limitations explicit).
- [ ] **NEXT 3 — Claude_in_Chrome live red-team**: minimal controlled demo web page (the support input surface) → real navigate/inject/observe → guard blocks. (needs John to pick the browser) + record the **fallback video** (top priority, Sat night).
- [ ] **NEXT 4 — CI artifact**: `.github/workflows/vibeshield.yml` that runs the harness on push.
- [ ] **NEXT 5 — Real scanner adapters (P1)**: Gitleaks/Semgrep/OSV on the demo repo, normalized into findings.
- [ ] **NEXT 6 — 3× rehearsal** + freeze.

## Keys John must drop in `.env.local` (only when we reach P1, never in chat)
- `ANTHROPIC_API_KEY` → real Claude agent (replaces the deterministic stand-in).
- `ARMORIQ_API_KEY` → real ArmorIQ SDK (else keep "local ArmorIQ-compatible guard").
- `PHOENIX_COLLECTOR_ENDPOINT` → real Arize Phoenix UI (else local trace JSON).
- `DEEPGRAM_API_KEY` → optional voice briefing (P2).

## Honesty rules (enforced)
No fabricated metric/source/integration/blocked-state. Sponsor shows "Integrated" only with a real artifact. Legal output = risk indicator, not legal advice. Deterministic checks before any LLM judgment.
