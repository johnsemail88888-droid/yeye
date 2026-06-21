# Yeye — Setup & Run

Risk debugger for vibe-coded AI agents. Runs **fully offline, no API keys**.
(UI brand is **Yeye**; the package/repo is still `vibeshield`.)

## Prerequisites
- **Node 20+** (`.nvmrc` pins 20; newer works). Check: `node -v`
- **npm** (ships with Node)

## Quickstart (first time)
```bash
npm install                                          # REQUIRED — see Troubleshooting
npx tsx src/scan.ts examples/vulnerable-support-agent   # → risk_map.json
npx tsx src/run.ts all                               # BEFORE (5 FAIL) → AFTER (0 FAIL)
npx tsx src/verify.ts                                # → verify_results.json
npx tsx src/daemon.ts                                # serves http://127.0.0.1:7878
```
Leave the last command running. The first three just (re)generate the on-disk
evidence — the daemon's buttons can regenerate it too.

## Open it
- **http://127.0.0.1:7878/demo** — the product (Acme Support + Yeye panel) ← start demos here
- **http://127.0.0.1:7878/** — Studio control plane
- **http://127.0.0.1:7878/judge** — one-screen judge story

## Demo flow (~3 min)
1. `/demo` → click **① Scan selected feature** (real BEFORE suite runs; failures appear)
2. Click **Open desktop ↗** → Studio opens on the same `run_id` → **Risk Inspector → Evidence**
3. Back on `/demo` → click **② Install guard & rerun** → before→after flips **red → green**
4. Point out `paraphrased_injection_mutation_a/_b` — differently-worded attacks, both blocked
5. Open `/judge` for the full PWNED → guard → PROTECTED summary

## Health check (optional)
```bash
curl -s -o /dev/null -w "/ %{http_code}\n"      http://127.0.0.1:7878/
curl -s -o /dev/null -w "/demo %{http_code}\n"  http://127.0.0.1:7878/demo
curl -s -o /dev/null -w "/judge %{http_code}\n" http://127.0.0.1:7878/judge
# 200s = pages serve. To confirm the ACTION buttons work (these spawn subprocesses):
curl -s -o /dev/null -w "rerun %{http_code}\n" -X POST http://127.0.0.1:7878/api/run
```
`rerun` should be **200**. A **500** means deps aren't installed → run `npm install`.

## Troubleshooting
- **Action buttons (① Scan / ② Install / ▶ Rerun) appear to do nothing / page goes blank.**
  The daemon spawns `tsx` subprocesses for these; if `node_modules` is missing they
  return HTTP 500 while pages still load. `npx tsx` masks this (it downloads tsx over
  the network), so CLI commands work even with an empty `node_modules`.
  **Fix:** `npm install`. (No daemon restart needed once installed.)
- **`EADDRINUSE` / port 7878 busy:** `lsof -ti tcp:7878 | xargs kill`, then relaunch.
- **Stop the server:** `lsof -ti tcp:7878 | xargs kill`
- **`demo_ready` shows red in `/judge`:** expected — it's gated on optional items
  (browser-live loop, 3-run stability). The core gates are green.

## Key facts
- Port **7878**, bound to **127.0.0.1** (localhost only).
- No real money/email/records — `examples/vulnerable-support-agent/` is a sandbox.
- Attacker-typed tickets via `/demo` are **non-persisting**; the canonical suite lives
  in `src/harness.ts` (`TESTS`). Add a case there, then re-run `src/run.ts all`.
