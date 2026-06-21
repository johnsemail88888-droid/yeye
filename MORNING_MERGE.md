# Morning Integration Protocol (Claude = integration owner)

Base of truth: `main` (== `overnight-base` checkpoint, `demo_ready=true`). Never bulk-merge codex/* branches.

## For EACH `codex/*` branch
1. Read its `docs/handoff-<task>.md`.
2. `git diff --stat main...codex/<x>` — confirm it touched **only its lane** (see CODEX_OWNERSHIP.md). 
   - If it edited any CORE file (`src/guard.ts`, `src/daemon.ts`, `src/harness.ts`, `src/evals.ts`, `src/run.ts`, `src/scan.ts`, `src/verify.ts`, `src/report.ts`, `src/experiment.ts`, `examples/**`, `web/app.html`, `web/demo.html`) → **reject the merge of that file**; re-apply the intent myself by hand.
3. Check out the branch in an isolated worktree; run its stated verification commands + `npx tsx src/run.ts all && npx tsx src/report.ts && npx tsx src/experiment.ts && npx tsx src/verify.ts`.
4. Reject anything that: fabricates a metric/source/integration, hardcodes a result, or makes `demo_ready` go false.

## Integrate
- Create `integration` off `main`. Cherry-pick **only passing commits** (lane-clean, real-data, green). 
- After each cherry-pick: re-run the full loop + verify. `demo_ready` must stay **true** and `report_audit_pass` must stay **true**.
- Apply any reviewed core-change proposals (from handoff reports) myself, in core, with my own commit.
- When integration is green 3× in a row → tag `demo-final`.

## Hard rules
- Two sources never edit core. The guard/daemon/schema have exactly one owner: me.
- A red branch stays unmerged; note why.
- Every displayed number must trace to a real artifact. No exceptions for demo polish.
