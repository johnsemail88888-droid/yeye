# VibeShield — Production Readiness Review (Round 6)

**Reviewer stance:** ruthless staff-level, independent, no credit for effort or prior rounds.
**Prior scores:** r1=4, r2=7, r3=6, r4=7, r5=9.
**This round:** verified the three round-5 "make it a 10" items by reading AND running the real code on
Windows, ran the entire tooling chain, then made an exhaustive independent hunt for any concrete defect.

## SCORE: 10/10

I withheld a point in five prior rounds and went looking hard for a sixth reason. I could not find a
single concrete, reproducible defect: no attacker-reachable XSS sink, no PII/allowlist bypass, no
endpoint returning 200 on a real failure, no unhandled rejection or resource leak, no lockfile/CI
defect, no tracked secret or generated artifact, no `any` masking a bug, and no README/claims-vs-code
mismatch. The three round-5 blockers are genuinely fixed and I proved each by running the code. The
only residual observations are defense-in-depth nitpicks on data paths that are **not** attacker-reachable
in this product — none rises to a defect. Justification and evidence below.

---

## Environment
- Host: Windows 11, Node v24.14.1, npm 11.x. Repo pins `.nvmrc=20`, `engines.node>=20` (coherent).
- All commands run from `C:\Users\Admin\Desktop\vibeshield` in a real shell.

## Commands actually run (results)

| Command | Result |
|---|---|
| `npx tsc --noEmit` | **exit 0** (clean, strict) |
| `npx vitest run` | **44 passed / 44** across **7** files (incl. `tests/daemon.test.ts` 5 tests) |
| `npx tsx src/run.ts all` | **5 FAIL before → 0 FAIL after** (real refunds/PII in `before`, guard holds/blocks in `after`) |
| `npm ci --dry-run` | **"up to date"** — lockfile v3, integrity hashes on all 121 node_modules pkgs |
| `node_modules\.bin\tsx.cmd src/daemon.ts` | boots clean, no stderr, `GET /api/state` → 200 |
| `POST /api/agent` foreign `Origin` | **403** `{"error":"forbidden origin"}` |
| `POST /api/agent` foreign `Host` (DNS-rebind) | **403** |
| `POST /api/agent` malformed body | **400** `{"error":"invalid JSON"}` |
| **forced subprocess failure → `POST /api/scan`** | **HTTP 500** `{"error":"internal"}` (NOT 200+stale) — see VERIFIED #2 |
| `POST /api/scan` (valid) after the failure | **200**, `risk_map.json` regenerated; daemon survived, mutex not poisoned |
| `npx tsx src/report.ts` | findings 5 · **audit score 100 · pass: true** |
| `npx tsx src/experiment.ts` | 7 examples · **229 OpenInference spans** |
| `npx tsx src/verify.ts` | core_loop_pass=true · trace=true · **demo_ready=true** |
| `npx tsx src/demo-verify-three.ts` | **3/3 PASS**, demo_ready=true |

---

## VERIFIED FIXED (the three round-5 blockers — confirmed by running the code)

### ✅ #1 — README no longer states a wrong test count
- `README.md:17` now reads: *"a **vitest unit-test suite** (run it for the exact count) covering…"*.
  The hardcoded "38 unit tests" is gone — there is **no number left to be wrong**. `grep -i test README.md`
  finds no numeric test-count claim anywhere. This is a robust fix (de-brittled, not just bumped to 44),
  so it cannot re-break when a test is added. The project's own honesty rule is satisfied.

### ✅ #2 — `runCmd` failure now returns HTTP 500 (not 200 + stale state) — TRACED AND REPRODUCED
- `src/daemon.ts:65-73`: `runCmd` is now `Promise<void>` and on subprocess failure it logs and
  **`throw`s** `new Error("command failed: …")`. Every call site `await`s it inside
  `serialize(async () => { await runCmd(...); return state(); })`; a throw rejects the serialize
  promise, the `await` in the route handler re-throws, and the handler's outer `try/catch`
  (`daemon.ts:191-194`) returns `json(res, 500, { error: "internal" })`. The `json(res, 200, …)`
  on the success branch never executes because the `await` threw first. Trace is sound.
- **Live repro (the exact round-4/round-5 failure class):** with the daemon running I renamed
  `src/scan.ts` aside so the spawned `node <tsx-cli> src/scan.ts …` exits non-zero, then
  `POST /api/scan` → **HTTP 500** `{"error":"internal"}`. Daemon stderr showed the full path:
  `[daemon] cmd failed: src/scan.ts …` (runCmd catch) → `[daemon] handler error: command failed: …`
  (outer catch). I restored `scan.ts`; a subsequent valid `POST /api/scan` returned **200** and
  regenerated `risk_map.json`, and `GET /api/state` stayed 200 — i.e. the rejected promise did **not**
  poison the `chain` mutex (`chain = next.catch(() => undefined)` at `daemon.ts:36` is correct). A
  subprocess failure is now loud, not a cheerful 200 with stale data.

### ✅ #3 — `tests/daemon.test.ts` exists and exercises the daemon — RAN IT
- `src/daemon.ts:128` exports `createDaemon()`; `main()` is guarded by
  `if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();`
  (`daemon.ts:210`), so importing the module in tests does **not** open a listener.
- `tests/daemon.test.ts` boots `createDaemon()` on an **ephemeral port** (`server.listen(0, …)`,
  line 28) and asserts: `GET /api/state` → 200 + `project_id==="support-agent"`; foreign-Host POST →
  **403** (DNS-rebind guard); malformed JSON → **400** (no crash); in-process `/api/agent` run → 200 with
  a real record; unknown route → 404. **`npx vitest run` shows `tests/daemon.test.ts (5 tests)` green**,
  total 44/44. The daemon — the exact component that broke in round 4 — now has automated coverage, so
  CI can catch a regression of the origin-guard / JSON-validation / routing surface.

---

## Independent exhaustive defect hunt (what I checked and the result)

### XSS — every `innerHTML`/sink re-traced for an unescaped *attacker* value → no live defect
- **demo.html** (the only page rendering an attacker-controlled ticket via live `/api/agent`):
  every sink is escaped. `reply.args.text` (`:122`) is hardcoded and `esc()`'d; bad-tool args incl. the
  attacker `to`/`body` (`:123`) → `esc()`; guard reasons incl. `args?.to` (`:126`) → `esc()`. The
  `log()` helper writes raw `innerHTML` but its call sites only interpolate server numbers and the
  fixed string `"live_ticket"` (`runTicket` sets `name:"live_ticket"`) — no attacker text reaches it.
- **judge.html `markInjection` (`:398`)** — the round-3 stored-XSS site: it `esc(raw)` **first**, then
  regex-wraps already-escaped text in a literal `<span>`. Any `<`/`>`/`&` is an entity before the
  regexes run, so no attacker markup can survive. All other judge sinks (`renderEvent`, `renderFindings`,
  `renderScan`, `renderCompare`, …) `esc()` every interpolated value. The `/api/state` fetch path shows
  "last known state" on error — never fabricated data.
- **app.html** renders only `/api/state` (disk runs from the fixed `TESTS` array — not attacker input).
  `:99`/`:122` interpolate `r.test`/`JSON.stringify(args)` without `esc()`, but those values originate
  from the hardcoded test suite, **not** from any user/browser input (the browser-panel `scope` text goes
  only into `live_scan.json`, never into `runs/*`). So it is not attacker-reachable. (Defense-in-depth
  nit, not a defect — flagged for completeness, identical to round 5's read.)

### Guard correctness / PII / allowlist bypass → none found (9 adversarial probes, all pass)
Ran live against `src/guard.ts`:
- array-typed `to:["evil@x.com"]` + PII → **block** (`String()` coercion → external);
- `EVIL@EVIL.COM` (uppercase external) + PII → **block**;
- customer self `JANE@EXAMPLE.COM` + PII → **allow** (case-insensitive self-match);
- refund `100` → allow, `100.01` → hold (boundary correct);
- reordered name "Doe; Jane" → detected; intl-reformatted phone `0014155550199` → detected;
- empty recipient + PII → allow (cannot exfiltrate to nobody — defensible);
- `update_user_plan` → **block** (not in the signed plan's `allowedTools`).
The guard is structural/injection-agnostic (never matches attack strings); same-domain non-customer
mailbox is treated as external (`guard.ts:61-65`). No bypass.

### Endpoints returning 200 on a real failure → none
`runCmd`-driven endpoints (`/api/scan`, `/api/run`, `/api/live-scan`, `/api/install-guard`) now 500 on
subprocess failure (proven above). `/api/agent` and `/api/live-scan` 400 on bad JSON. The cosmetic
`[1,2,3]` array body on `/api/agent` yields an empty-ticket 200 rather than 400 (arrays are `typeof
"object"`), but that is harmless (no crash, no security impact, empty ticket → benign PASS run).

### Mutex / resource / rejection → sound
`serialize()` chains on a `catch`-guarded promise so one failure can't deadlock the chain (verified live).
`unhandledRejection`/`uncaughtException` handlers present (`daemon.ts:28-29`); SIGTERM/SIGINT graceful
shutdown with 5s unref'd fallback (`:202-207`). `readBody` caps at 64 KB and `req.destroy()`s on
overflow. `/api/live-scan` writes via tmp+`renameSync` (atomic).

### Honesty auditor not tautological
`src/auditor.ts` + `tests/auditor.test.ts` prove the gate bites: a mismatched `before_failures`
fails `numbers_from_artifacts`; a missing evidence file fails `criticals_have_reproduced_evidence`;
`ArmorIQ integrated` fails `integration_authenticity`; an absolute legal claim / missing disclaimer
fails `legal_claims_safe`. A failed audit flips `demo_ready=false` via `src/verify.ts`. Live: score 100,
pass true, on real artifacts.

### Lockfile / CI / git hygiene / dead code / `any`
- Lockfile v3, integrity on all 121 packages; `npm ci --dry-run` clean → reproducible install.
- CI (`.github/workflows/vibeshield.yml`) runs `tsc --noEmit` + `vitest run` **before** the risk loop,
  then gates on `core_loop_pass && report_audit_pass` and uploads evidence. Correct ordering; a daemon
  regression is now also catchable via the new daemon test.
- `git status` clean; **46** tracked files; **zero** generated artifacts/logs/secrets tracked
  (`runs/`, `.vibeshield/`, `verify_results.json`, `risk_map.json`, `*.log`, `.env.local` all gitignored
  and untracked, confirmed against `git ls-files`).
- No dead code reachable in the security path. The 19 `: any` usages in `src/` are all at I/O
  boundaries (JSON parse, disk reads, span builders); the security-critical modules (guard, evals,
  auditor, verify) are strongly typed. None masks a bug.

---

## Residual non-defects (named for completeness; none costs a point)
1. **`app.html:99`/`:122`** interpolate `r.test`/`JSON.stringify(args)` without `esc()`. Not
   attacker-reachable (data comes from the fixed `TESTS`, never user input). Defense-in-depth only.
2. **`/api/agent` array body** → empty-ticket 200 instead of 400. Harmless; no crash, no security impact.
3. **`src/demo-verify-three.ts`** still uses `execSync("npx tsx …")` with `catch {}`. It is a local
   stability harness whose `pass` is computed from the resulting on-disk artifacts (a swallowed failure
   surfaces as a failed gate), and it ran 3/3 here. Not the daemon spawn path; not a live defect.
4. **`decideActions` first-number extraction** (`agent.ts:27`): cosmetic for this crafted sandbox;
   the guard re-checks the amount structurally, so it cannot weaken enforcement.

None of these is a bug, exploit, wrong artifact, or claims-vs-code mismatch. They are the kind of
"would-be-nice" items the rubric explicitly says must NOT cost the 10th point.

---

## Verdict
Every round-5 blocker is genuinely fixed and proven by running the code; the full tooling chain is green
on Windows; the daemon now fails loud (500) and has automated coverage; the guard has no bypass across
nine adversarial probes; the honesty auditor bites; lockfile, CI, and git hygiene are clean. After an
independent, adversarial pass I found **no concrete, reproducible production defect**. This is a
defensible **10/10**.
