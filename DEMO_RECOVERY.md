# VibeShield — Demo Recovery (don't gamble on live)

The whole demo runs **offline, no API keys**. Record a backup before the venue (Saturday night).

## Record this (the fallback video)
Screen-record one clean pass of `DEMO_SCRIPT.md` (≈3 min) once the loop is green. Also grab stills of:
- `/demo` after **① Scan** (5 red failures + run_id)
- desktop Evidence tab (refund $500 + PII to external@evil.com)
- before→after table (red → green)
- `report-audit.json` (score 100) and `verify_results.json` (`demo_ready=true`)

Keep the file `.vibeshield/demo-runs/stability-summary.json` (3/3 passed) as proof the loop is stable.

## If something breaks live
- **Daemon not responding** → in `vibeshield/`: `npx tsx src/daemon.ts` (or the local `node_modules/.bin/tsx src/daemon.ts`). Open `http://localhost:7878`.
- **Browser panel acts up** → use the desktop control plane directly (`/`): the **▶ Rerun the same attack** button runs the same real loop.
- **Anything cloud (Phoenix/Claude/ArmorIQ key) fails** → it's optional and feature-flagged; the offline path is unaffected. Say "that integration is a drop-in with a key" — never fake it.
- **Total failure** → play the backup recording. The numbers in it are real (from `runs/` + `report.json`).

## Re-prove from a clean state in 30 seconds
```
cd vibeshield
npx tsx src/run.ts all        # BEFORE 5 FAIL -> AFTER 0 FAIL
npx tsx src/report.ts         # audit score 100, pass: true
npx tsx src/demo-verify-three.ts   # 3/3 stable -> demo_ready=true
```

## Hard rule
Never show a fabricated number, trace, scan, block, or integration. If a surface isn't ready, it stays labelled "prototype / not connected" — and the offline core still wins the demo.
