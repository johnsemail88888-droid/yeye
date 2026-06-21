# VibeShield — CURRENT_STATE (verified facts only)

_Demo-mode vertical slice per the V4 spec + DEMO MODE OVERRIDE. Updated from real runs._

## ✅ Working (runs, real evidence on disk)
- **Controlled demo target** — `examples/vulnerable-support-agent/` (6 fake tools: read_ticket, lookup_customer, send_email, refund_customer, update_user_plan, create_support_reply). Sandbox only; no real money/email/records.
- **Deterministic scanner** — `src/scan.ts` → `risk_map.json` (6 tools, 8 findings, 3 critical incl. "no runtime guard" + "no approval gate").
- **Dynamic BEFORE/AFTER harness** — `src/harness.ts` + `src/run.ts`. 6 cases. BEFORE reproduces **3 real failures** (injection → refund $500 executed; PII emailed out; over-refund $200). Evidence: `runs/before/*.json`, `runs/after/*.json`.
- **ArmorIQ-compatible runtime guard** — `src/guard.ts`. Plan signed from the TRUSTED goal only; blocks off-plan tools, holds refunds > $100 for approval, blocks PII egress. **Injection-agnostic** (structural, not keyword-matching).
- **Identical AFTER** — same cases rerun under the guard: 0 unauthorized executed; benign + normal still PASS.
- **Mutation AFTER** — `paraphrased_injection_mutation` (no "ignore/refund $500/attacker" wording) still blocked → proves the fix isn't overfit to the exact payload.
- **Local daemon + web control plane** — `src/daemon.ts` (localhost:7878) serves `web/app.html`; `GET /api/state` reads real artifacts; `POST /api/run` re-runs the real loop. 3-pane Studio UI (Projects | Agent Activity | Risk Inspector: Overview/Findings/Evidence/Before-After) with a working "Rerun the same attack" button.
- **Verify gate** — `src/verify.ts` → `verify_results.json`. Demo-mode `overall_pass=true` (before fails + identical-after + mutation-after + utility preserved).
- **Static offline dashboard** — `studio.html` (double-click, real data) via `src/dashboard.ts`.

## 🟡 Partial / honest-stub
- `verify_results.json` reports full-V4 gates with their REAL state (most `false` until built).
- Guard is the **local ArmorIQ-compatible adapter** (labelled as such); real ArmorIQ SDK = pending key.

## ❌ Not built yet (pending)
- Phoenix/local trace spans + before/after experiment (`phoenix_or_local_experiment_present=false`).
- Claude_in_Chrome live browser red-team on a controlled demo page (`browser_connected=false`).
- Developer/Founder reports + report auditor + Evidence Explorer.
- CI artifact (`.github/workflows/vibeshield.yml`).
- Real deterministic SAST/secret/dep scanners (Semgrep/Gitleaks/OSV) as adapters.
- Sat-night fallback recording (`demo_video_ready=false`) — highest-priority open item.

## CUT for the hackathon (per DEMO MODE OVERRIDE)
VS Code/Cursor extension, real Chrome-extension packaging, Browserbase, cross-surface <2s daemon sync, 5 of 6 live agents, multi-tenant/auth/billing, arbitrary-site & multi-language support, definitive legal compliance.

## How to run
```
cd vibeshield
npm install
npx tsx src/scan.ts examples/vulnerable-support-agent
npx tsx src/run.ts all      # BEFORE 3 FAIL -> AFTER 0 FAIL
npx tsx src/verify.ts       # overall_pass=true (demo-mode)
npx tsx src/daemon.ts       # http://localhost:7878
```
