# VibeShield — Production-Readiness Review Loop

Independent harsh subagent critiques → I fix → commit → re-critique. Goal: 10/10. No score-gaming; every fix is real and verified.

---

## Round 1 — SCORE 4/10
> "A security product whose security core has zero unit tests, an HTTP daemon trivially DoS-able and LAN-exposed while spawning shell subprocesses, a dead/unreachable PII control, and a circular 'injection-agnostic' claim."

**Issues raised → fix planned:**
1. `daemon.ts` `JSON.parse` of untrusted body, no try/catch → process crash (DoS). → wrap handlers; `unhandledRejection`/`uncaughtException`.
2. `daemon.ts` `execSync` per request blocks event loop, swallows failures, no timeout/mutex. → async `execFile` + timeout + in-flight serialize + surface failures.
3. **No unit tests** on `guard.safeInvoke` / `evaluateRun`. → vitest table-driven tests + CI gate.
4. `guard.ts` `send_email` PII check is **unreachable** (allowlist blocks first). → make `send_email` plan-allowed with a *reachable* external/PII egress check.
5. `guard.ts` PII detection = substring of 3 hardcoded fields, bypassable. → structural detectors (email match, digit-normalized phone, name tokens).
6. No `tsconfig.json`, no `tsc --noEmit` in CI; `any` everywhere. → strict tsconfig + `typecheck` script + CI.
7. `daemon.ts` binds all interfaces, no auth/limits on shell-spawning endpoints. → bind `127.0.0.1`, body-size limit, input validation.
8. `agent.ts` money regex needs ≥2 digits, drops cents (`$5`→none, `$199.99`→`199`). → fix regex + cents + boundary tests.

**Fixes applied (round 2 commit) — all verified:**
1. ✅ `daemon.ts`: every handler in try/catch (returns 500, never crashes) + `process.on('unhandledRejection'|'uncaughtException')`. Verified: malformed JSON body → **400, daemon stays alive**.
2. ✅ `daemon.ts`: `execSync` → async `execFileP("npx",["tsx",...])` with 90s timeout; file-mutating endpoints run through a `serialize()` in-flight mutex (no clobbering `runs/`).
3. ✅ `tests/` (vitest): **22 tests** — `guard.test.ts` (11: refund thresholds/cents/invalid, off-plan block, reachable PII-egress block/hold/allow, structural PII bypass cases), `evals.test.ts` (4), `agent.test.ts` (7: money boundaries + egress intent). Gated in CI before the loop.
4. ✅ `guard.ts`: `send_email` is now **plan-allowed**, so the external/PII egress check is **reachable** — exfil to an external address with PII → `block`; external w/o PII → `hold`; to the customer → `allow`. (pii_exfiltration test now BLOCKED *by the PII control*, not the allowlist.)
5. ✅ `guard.ts` `disclosesPII`: structural detectors — exact email (case-insensitive), **digit-normalized phone** (national number, survives reformatting), reordered name tokens. Bypass cases covered by tests.
6. ✅ `tsconfig.json` strict (+ `resolveJsonModule`); `typecheck` script (`tsc --noEmit`) passes (exit 0) and is **gated first in CI**.
7. ✅ `daemon.ts`: binds `127.0.0.1` (not LAN), 64 KB body cap, JSON validation, 8 KB ticket cap, fixed safe-page whitelist (no path traversal).
8. ✅ `agent.ts`: money regex `/\$?\s?([0-9][0-9,]*(?:\.[0-9]{1,2})?)/` — single digits + cents; `Number.isFinite` guard. Boundary tests added.

Verified after fixes: typecheck exit 0 · 22/22 tests pass · loop 5 FAIL → 0 FAIL · `demo:verify-three` 3/3 · **demo_ready=true** (browser_live via the real endpoint).

---

## Round 2 — SCORE 7/10
> "All 8 round-1 fixes verified genuine (ran tsc/vitest/loop/XSS-probe). No remaining P0. But the verifier/reporter/scanner + the daemon have zero test coverage, `dashboard.ts` ships broken, one live shell-injection remains in `experiment.ts`, and the pages have latent XSS."

**Issues → fixes applied (round 3 commit) — verified:**
1. ✅ `/api/agent` wrote attacker-supplied ticket into the shared evidence dir → `runTicket` is now **non-persisting** (`runScenario(..., persist=false)`); daemon adds a **same-origin/host check** (`originOk`, 403 on mismatch).
2. ✅ Deciders untested → extracted `computeGates` (`src/verify.ts`) + `auditReport` (`src/auditor.ts`) as **pure, side-effect-free** functions (script `main` guarded by `import.meta.url`); added **+13 tests** (`verify.test.ts` 6, `auditor.test.ts` 7). Total now **35 tests**.
3. ✅ `dashboard.ts` read non-existent `verify.overall_pass` → `demo_ready`.
4. ✅ `experiment.ts` `execSync(\`curl ... ${endpoint}\`)` shell-injection → `fetch()` + `^https?://` validation; removed `child_process`.
5. ✅ Honesty copy: `README.md` LIMITATIONS section makes the deterministic-stand-in / sandbox / seam-integration scope explicit; the auditor enforces "no fabricated integration."
6. ✅ Latent XSS: added `esc()` and escaped every attacker-reachable interpolation in `app.html` + `demo.html`.
Also added `README.md` and `LICENSE` (MIT).

Verified: typecheck exit 0 · **35/35 tests** · loop 5 FAIL → 0 FAIL · report audit 100 · **demo_ready=true**.

---

## Round 3 — SCORE 6/10 (regressed — a real exploit was found)
> "5 of 6 fixes genuine, but `judge.html` `esc()` is a complete no-op (byte-verified). I POSTed `<img onerror=…>` to `/api/live-scan`, confirmed it's stored raw and served raw, flowing through the dead `esc()` into `innerHTML` → **reachable stored XSS in Judge Mode** (the view a judge opens)."

**Issues → fixes applied (round 4 commit) — verified:**
1. ✅ **P0** — `web/judge.html:392` `esc()` no-op (its entity map was corrupted by my entity-decoding during extraction: `&`→`&` instead of `&`→`&amp;`) → restored a real entity map; **plus** daemon `sanitizeScope` (only bounded `url`/`feature` strings are persisted from the untrusted panel — attacker fields dropped) = defense in depth.
2. ✅ Untested producers → extracted `buildRiskMap` (`src/scan.ts`) as a pure, guarded function; **+3 tests** (`scan.test.ts`). Total **38 tests**.
3. ✅ `src/dashboard.ts` + `studio.html` were dead code carrying the raw-`innerHTML` XSS pattern → **deleted** + removed from `.gitignore`.
4. ✅ CI `npm install` → `npm ci` (integrity-pinned lockfile).
5. ✅ daemon: graceful shutdown (`SIGTERM`/`SIGINT` → `server.close` + timed force-exit) and **atomic write-then-rename** for `live_scan.json` (no half-written evidence on interrupt).

Verified: typecheck exit 0 · **38/38 tests** · 3-run 3/3 · **demo_ready=true**.

---

## Round 4 — SCORE 7/10 (XSS confirmed dead; new disqualifier found)
> "Stored XSS is dead (re-ran the live exploit; `esc()` neutralizes, `sanitizeScope` strips). But the daemon's POST endpoints ENOENT on Windows — `execFile('npx',…)` won't resolve the `.cmd` shim — so every demo button no-ops (200 + stale state) on John's actual machine while CI (Linux) stays green."

**Issues → fixes applied (round 5 commit) — verified:**
1. ✅ **HIGH** — daemon `execFile("npx",…)` ENOENT on Windows → run `node <tsx-cli>` via `process.execPath` + resolved `tsx/cli` (cross-platform, no shell, no `.cmd`). **Verified on Windows**: deleted `risk_map.json` → POST `/api/scan` regenerated it; POST `/api/run` → real 5 FAIL → 0 FAIL.
2. ✅ MEDIUM — `disclosesPII`/egress same-domain gap → `isExternalAddress` now treats ANY non-customer address as external (same-domain-but-different-mailbox PII → `block`). +1 test.
3. ✅ LOW — README "35 tests" → **39** (+ scanner mention).
4. ✅ LOW — added `.nvmrc` (20) + `"engines": ">=20"`.
5. ✅ LOW — removed `_v4pack/` (232 KB of prompt docs) from the repo.

Verified: typecheck exit 0 · **39/39 tests** · daemon POST executes on Windows · 3-run 3/3 · **demo_ready=true**.

---

## Round 5 — SCORE 9/10
> "Functionally sound; the security engineering is real and bypass-resistant. The 10th point is withheld for one concrete, reproducible defect: the README says 38 tests but there are 39 — an honesty-gated tool failing its own rule. Plus `runCmd` discards its success boolean (200 + stale on failure), and there is no daemon integration test."

**Issues → fixes applied (round 6 commit) — verified:**
1. ✅ README hardcoded test count drifted (38 vs 39) → removed the brittle literal ("a vitest unit-test suite — run it for the exact count") so it can't be wrong again.
2. ✅ `runCmd` discarded its result (a subprocess failure returned 200 + stale state) → `runCmd` now **throws**, so the endpoint returns **500** on any loop-step failure.
3. ✅ No daemon integration test → exported `createDaemon()` (script `main` guarded by `import.meta.url`); added `tests/daemon.test.ts` (5 tests on an ephemeral port: GET state→200, foreign-Host POST→403, malformed→400, in-process agent→200, unknown route→404). Total **44 tests**.

Verified: typecheck exit 0 · **44/44 tests** · daemon script POST regenerates `risk_map.json` · 3-run 3/3 · **demo_ready=true**.

