# VibeShield — Production Readiness Review, Round 4

**Reviewer stance:** ruthless / staff-level. Harsh by design.
**Date:** 2026-06-21
**Prior scores:** r1 = 4/10, r2 = 7/10, r3 = 6/10 (stored XSS in `judge.html` dropped it).
**Commit reviewed:** `419f938` (Round 4 hardening).

**Round-4 verdict: 7/10.** The critical r3 stored-XSS is genuinely dead and the CLI pipeline is clean and honest. But a **real, reproduced functional bug** disqualifies "production": the daemon's POST endpoints — the entire browser/judge interactive loop — are **broken on Windows** (`spawn npx ENOENT`), and the failure is silently swallowed (200 OK + stale state). CI is green only because it runs on Linux. That is the textbook "green CI, broken in the field" gap, and the field machine here is Windows.

---

## VERIFIED FIXED (round-3 issues — each re-checked against real code + tooling)

### ✅ 1. CRITICAL stored XSS in `judge.html` — GENUINELY DEAD
- **`esc()` entity map is real** (`web/judge.html:392`). Byte-verified by executing the exact function: `<img src=x onerror=...>` → `&lt;img src=x onerror=...&gt;`; `&`→`&amp;`, `<`→`&lt;`, `>`→`&gt;`, `"`→`&quot;`, `'`→`&#39;`. The r3 no-op map is gone.
- **Server-side `sanitizeScope` (`src/daemon.ts:110-114`) is a whitelist.** Live exploit: I started the daemon and `POST /api/live-scan` with `{"scope":{"url":"<img onerror>","feature":"</span><script>...","evil_extra":"<svg onload>","captured_at":"HACKED","run_id":"INJECTED"}}`. Result on disk + via `GET /api/state`: only `url`/`feature` survived (bounded 300/80 chars); `evil_extra` stripped; `captured_at`/`run_id` overwritten server-side. Attacker cannot inject arbitrary fields.
- **Client renders it escaped.** `scope.url`/`scope.feature` reach exactly one sink — `renderScan` (`judge.html:473-477`) — through `esc(r[1])` before `innerHTML`. Grep confirms no other sink touches `scope.*`.
- **`markInjection` (`judge.html:398-410`) is safe**: it `esc()`s first, *then* wraps regex matches in `<span class="inj">`. Verified that a ticket containing `<script>` + an injection pattern produces only escaped content inside the deliberate spans — no raw `<` survives except the wrappers.
- **Every other `innerHTML` in `judge.html` traced**: all attacker-reachable values (`r.test`, tool chips, `g.reason/tool/decision`, `f.detail/tool/category`, `r.ticket`) are escaped; all numeric stats are `Number(...)`. **Clean.**

### ✅ 2. Scanner tested
`src/scan.ts` `buildRiskMap` is pure/exported; `tests/scan.test.ts` (3 tests) covers high-impact detection, missing-control flagging, guard/approval present, and the no-tools case. Passes.

### ✅ 3. Dead `dashboard.ts` + `studio.html` deleted
Both gone; `grep` finds zero dangling references in any `.ts/.html/.yml/.json`.

### ✅ 4. CI uses `npm ci`
`.github/workflows/vibeshield.yml:13` — `npm ci` (not `npm install`). Lockfile present.

### ✅ 5. Daemon graceful shutdown + atomic write
- Shutdown handlers (`daemon.ts:185-190`): `server.close()` + 5 s `unref()`'d failsafe on SIGTERM/SIGINT. Verified the process terminates cleanly and frees the port.
- Atomic write (`daemon.ts:158-160`): write `.tmp` then `renameSync` — no half-written `live_scan.json`. Correct.

### ✅ Tooling run (clean machine state)
- `npx tsc --noEmit` → **exit 0** (strict).
- `npx vitest run` → **38 passed** (6 files).
- `npx tsx src/run.ts all` → BEFORE 5 FAIL → AFTER 0 FAIL (guard blocks/holds), utility preserved.
- Full pipeline (`run all` → `report` → `experiment` → `demo-verify-three` → `verify`) → audit score **100**, stability **3/3**, **`demo_ready=true`**.

---

## REMAINING GAPS (severity-ranked)

### 🔴 HIGH — Daemon POST endpoints are broken on Windows (`spawn npx ENOENT`), failure silently swallowed
**File:** `src/daemon.ts:53-61` (`runCmd`).
`runCmd` calls `execFileP("npx", ["tsx", ...])`. On Windows, `npx` is the `npx.cmd` shim, which `execFile` **does not resolve** (only `spawn`/`exec` with `shell:true`, or an explicit `.cmd`, do). **Reproduced live:** restarted the daemon, `POST /api/scan` returned **200**, but `risk_map.json` mtime did **not** change and `daemon.err.log` logged `spawn npx ENOENT`. So `/api/scan`, `/api/run`, `/api/live-scan` (its subprocess half), and `/api/install-guard` all **no-op on Windows** while returning success + stale `state()`.
**Why it matters here:** the target machine is John's Windows 5090 box; the judge/demo flow is browser-driven. In the live demo, clicking Scan / Install Guard does nothing new — the UI just re-echoes whatever was last on disk. CI never catches it (`ubuntu-latest`, where `npx` resolves). And because `/api/live-scan` first `rmSync`s `runs/after` + `traces/after` *before* the (failing) subprocess, a single browser click can leave the repo in a half-state where the next `report.ts`/`verify.ts` sees empty `after` and flips `demo_ready` to **false** (I hit exactly this during testing).
**One-line fix:** `execFileP(process.execPath, [require.resolve('tsx/cli'), ...args], …)` — or run the loop functions in-process (preferred; the daemon already imports `runTicket`, so it can import `runAll`/scan/report directly and drop the subprocess entirely).

### 🟠 MEDIUM — `disclosesPII` has real false-negatives; encoded/obfuscated exfil evades the PII *block*
**File:** `src/guard.ts:34-56`.
`disclosesPII` matches: exact email substring, last-10 phone digits, and *all* name tokens. It is defeated by trivially-encoded or obfuscated PII:
- **Encoding**: base64/hex of the email or phone (`amFuZUBleGFtcGxlLmNvbQ==`) — not detected.
- **Spacing/obfuscation**: `j a n e @ e x a m p l e . c o m` or `jane (at) example dot com` — the substring check fails; the phone regex `[\d().+\-\s]{7,}` won't span letters.
- **Partial**: leak only the surname (when name has 2+ tokens) — `every(token)` requires all tokens, so a single-token leak passes.
**Mitigating fact (why MEDIUM not HIGH):** `safeInvoke` already `hold_for_approval`s *any* external email (`guard.ts:87-88`) regardless of PII. So encoded-PII to an **external** address is still **held**, not auto-allowed — the PII check only upgrades hold→block. The genuine escape is encoded PII to a **same-domain** address (treated as internal, `allow`). Real but bounded.
**One-line fix:** document the threat model honestly (guard is destination-first, PII detection is best-effort heuristic) and/or hold-for-approval on *any* `send_email` whose body length exceeds a small threshold when the address isn't the customer's own.

### 🟠 MEDIUM — README is inaccurate vs the code (stale test count)
**File:** `README.md:17` (and the `35` implied at `:11`).
README claims **"35 unit tests"**; the suite is now **38** (round 4 added `scan.test.ts`’s 3 tests — I ran `vitest`: 38 passed). The "deciders of record" sentence also predates the scanner test. Small, but the README is a load-bearing honesty artifact for this project; a wrong number undercuts the "no fabricated metric" claim.
**One-line fix:** s/35 unit tests/38 unit tests/ and mention `buildRiskMap` in the tested-list.

### 🟡 LOW — Node version is unpinned; CI/dev drift
**Files:** `package.json` (no `engines`), repo root (no `.nvmrc`), `.github/workflows/vibeshield.yml:11` (Node 20).
CI runs Node 20; local dev is Node 24.14.1; nothing pins it. `experiment.ts` uses top-level `await` (fine on both, but the ESM/TLA assumption is implicit). For a tool whose whole pitch is reproducible evidence, an unpinned runtime is a defensible ding.
**One-line fix:** add `.nvmrc` (`20`) and `"engines": { "node": ">=20" }` to `package.json`.

### 🟡 LOW — Output-shaping logic still untested (`buildSpans`, `toOtel`, report `buildFindings`)
**Files:** `src/harness.ts:40` (`buildSpans`), `src/experiment.ts:40` (`toOtel`, + the whole experiment build is a top-level script, not an exported pure fn), `src/report.ts:27-58` (findings shaping, inline).
These three shape artifacts that downstream gates and the judge UI read, yet none is unit-tested. `experiment.ts` is a side-effectful top-level module with TLA, so it can't even be imported for a test without running it. The r3/r4 pattern (extract pure fn → test it) was applied to `buildRiskMap`, `computeGates`, `auditReport`, `evaluateRun` — but stopped short of the OTel/span/report shapers. Not a correctness bug today (verified outputs are well-formed), but it's untested surface that shapes what judges see.
**One-line fix:** export `buildSpans`/`toOtel`/a `buildFindings(before,after)` and add a few shape assertions (span count = 9 + 2·attempted; OTel `span_kind` mapping; finding ids monotonic).

### 🟡 LOW — Pervasive `any` in the non-core scripts
**Files:** `experiment.ts` (`J`, `runs`, `out:any[]`, `s:any`), `report.ts` (`J`, `c:any`), `daemon.ts:142,150` (`let p:any`), `harness.ts` (`spans:any[]`, `guardDecisions:any[]`, `buildSpans(...:any[])`), `verify.ts:69` (`readJson():any`). 19 `any` sites across `src`.
The security core (`guard.ts`, `scan.ts`, `evals.ts`, `auditor.ts`, `computeGates`) is well-typed; the periphery is not. `strict:true` is on but `any` opts out locally. Low risk, but it's the seam where a malformed run-file would slip through untyped.
**One-line fix:** type the disk-read helpers with a narrow `RunRecord`/`Finding` shape or `unknown` + validation.

### 🟡 LOW — `_v4pack/` (232 KB of prompt/research markdown) committed to the product repo
**Files:** `_v4pack/*.md` (5 files, incl. a 114 KB master prompt), all git-tracked.
These are authoring/research prompts, not product. Dead clutter in a repo being pitched as production-grade; also leaks internal process. Plus stray `daemon.err.log` / `daemon.out.log` at root (the `*.log` gitignore should catch new ones, but the committed `.err.log` documents the ENOENT bug above).
**One-line fix:** `git rm -r _v4pack` and remove the committed `daemon.*.log`.

### 🟡 LOW — `/api/live-scan` destroys `after` evidence before a fallible step (state-corruption window)
**File:** `src/daemon.ts:155-156`.
The handler `rmSync`s `runs/after` and `.vibeshield/traces/after` *first*, then runs scan + `run before`. If that subprocess fails (it does, on Windows — see HIGH) or the process is killed mid-flight, the repo is left with no `after` runs → `report_audit` fails → `demo_ready=false`. Destroy-then-rebuild without a transaction is fragile for the one flow a judge will actually click.
**One-line fix:** rebuild into a temp dir and swap, or only clear `after` after the new `before` succeeds.

---

## Things I checked that were FINE (no action)
- Same-origin / DNS-rebinding guard on POST (`daemon.ts:101-107`) — host allowlist + origin regex. Good.
- Body size cap (64 KB) + JSON parse guards on `/api/agent`, `/api/live-scan`. Good.
- `runTicket` is non-persisting (`harness.ts:104-107`) — attacker ticket text never reaches shared `runs/` evidence. Confirmed; this is *why* the canonical `runs_before` consumed by `app.html`/`demo.html` can't carry attacker HTML.
- `app.html` / `demo.html` XSS: every attacker-reachable interpolation is `esc()`'d or structurally inert (emails match `[A-Za-z0-9._%+-]@…` — no HTML metachars; amounts are `Number`). `app.html` does not render `live_scan`/`scope` at all.
- Guard correctness: blocks off-plan tools, holds refunds > $100, blocks external+PII email, holds external email — all matches the run output and 11 guard tests.
- Honesty gate: `auditReport` fails the report (and flips `demo_ready`) on unbacked numbers / unproven sponsor integration / absolute legal claims. Real and enforced.

---

## Bottom line
The security regression from r3 is **genuinely fixed** and the offline CLI pipeline is honest and green (38 tests, audit 100, demo_ready=true). But "production-ready" can't coexist with a **reproduced, silently-swallowed daemon failure on the actual target OS** that breaks every interactive button while CI stays green. Fix the `npx`/`execFile` spawn (ideally go in-process) and the demo loop is trustworthy on Windows; that single fix is worth ~2 points.

**Score: 7/10.**
