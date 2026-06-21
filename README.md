# VibeShield — Risk Debugger for AI Agents

VibeShield points at a deployed AI agent, finds where it can be hijacked (an unauthorized refund, customer PII emailed out), **proves it with real evidence**, installs a runtime intent guard, and **reruns the same + paraphrased attacks to prove the risk is fixed** while normal utility is preserved — then keeps the test in CI.

## Run (offline, no API keys)
```
npm install
npx tsx src/daemon.ts          # http://127.0.0.1:7878  (desktop) · /demo (product) · /judge (judge mode)
# or re-prove from scratch:
npx tsx src/run.ts all         # BEFORE 5 FAIL -> AFTER 0 FAIL (guard blocks/holds)
npx tsx src/report.ts          # developer + founder reports + auditor (score 100)
npx tsx src/demo-verify-three.ts   # 3 consecutive full loops -> demo_ready=true
```

## Quality gates
- `npm run typecheck` — strict `tsc --noEmit` (passes).
- `npm test` — a **vitest unit-test suite** (run it for the exact count) covering: the guard (`safeInvoke`, structural `disclosesPII` incl. bypass cases), `evaluateRun`, the agent's money/egress extraction, the scanner (`buildRiskMap`), **and the deciders of record** — `computeGates` (the `demo_ready` logic) and `auditReport` (the honesty gate).
- CI (`.github/workflows/vibeshield.yml`) runs typecheck + tests **before** the risk loop and gates on regressions.

## ⚠️ LIMITATIONS (honest scope — read this)
- **Deterministic agent stand-in.** The "agent" is a deterministic simulation of a tool-calling model. It is **not** a real LLM. The *guard* (`src/guard.ts`) is the real engineering: a signed-plan allowlist + argument/threshold/PII-egress checks enforced **structurally** (injection-agnostic — it never matches attack strings). Set `ANTHROPIC_API_KEY` and wire the Claude Agent SDK to put a real model in the loop.
- **Sandbox only.** Fake tools, fake customer; no real money/email/records are touched. The daemon binds `127.0.0.1` with a same-origin check and input limits.
- **Synthetic demo data.** Every number comes from a real local run over a synthetic support agent. Swap in real repos/CUAD for real-world numbers.
- **Sponsor integrations are seams.** ArmorIQ = local compatible adapter (real SDK = key); Arize = local OpenInference experiment (real Phoenix = `PHOENIX_COLLECTOR_ENDPOINT`). Never shown "integrated" without a real artifact (enforced by the auditor).
- **Single-surface for the demo** (web desktop + product + judge mode). A VS Code extension is out of scope.

## Honesty rule (enforced in code)
No fabricated metric, trace, scan, block, or integration. The report auditor (`src/auditor.ts`, unit-tested) **fails the report** if any number isn't backed by an artifact, a critical finding lacks reproduced evidence, a legal claim is absolute, or a sponsor integration is claimed without proof — and a failed audit flips `demo_ready` to **false** via `src/verify.ts`.

## License
MIT — see `LICENSE`.
