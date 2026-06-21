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

