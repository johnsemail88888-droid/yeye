# VibeShield — Production Readiness Review (Round 1)

**Reviewer:** Staff-level engineering review. Harsh by design. Assume this ships to real users tomorrow.
**Verdict:** **NOT production-ready.** This is a well-art-directed hackathon vertical slice. The "security product" has **zero unit tests on its core security logic**, an HTTP daemon that **`JSON.parse`s untrusted request bodies with no try/catch and shells out via `execSync` on every request**, a guard whose "robustness" claims do not survive contact with the very mutation tests in the repo, and a TypeScript project with **no `tsconfig.json` and no typecheck in CI**. The marketing copy ("injection-AGNOSTIC", "real engineering the demo rests on") materially overstates what the code does.

Severity legend: **P0** = ship-blocker / exploitable / wrong. **P1** = serious. **P2** = quality/ops debt.

---

## P0 — Ship blockers

### P0-1. Daemon `JSON.parse` on untrusted request bodies with no try/catch → trivial DoS
**File:** `src/daemon.ts:50`, `:55`, `:67` (and via `body()` `:34-36`)
```ts
const { ticket = "", guard = false } = JSON.parse((await body(req)) || "{}");
const { scope = {} } = JSON.parse((await body(req)) || "{}");
```
Any POST to `/api/agent`, `/api/live-scan`, or `/api/install-guard` with a non-JSON or truncated body throws `SyntaxError` inside the request handler. The `createServer` callback is `async`, so the throw becomes an **unhandled promise rejection** — under Node's default `--unhandled-rejections=throw` (Node ≥15) this can **crash the entire process**, killing the server for every user. A single `curl -X POST localhost:7878/api/agent -d 'x'` is a denial-of-service.
**Fix:** Wrap every handler in try/catch; parse with a helper that returns `{}` on failure and responds `400`. Add a top-level `process.on('unhandledRejection', ...)` and `process.on('uncaughtException', ...)` so one bad request never takes down the server.

### P0-2. Daemon runs `execSync(...)` on every mutating request — blocking, unbounded, spawns `npx`
**File:** `src/daemon.ts:32`, `:47-48`, `:63-64`, `:68-72`
```ts
function run(cmd: string) { try { execSync(cmd, { cwd: ROOT, stdio: "ignore" }); } catch { /* surfaced via state */ } }
...
if (url === "/api/run" ...) { bumpRun(); run("npx tsx src/run.ts all"); run("npx tsx src/verify.ts"); ... }
```
`execSync` **blocks the single-threaded event loop** for the entire duration of an `npx tsx` subprocess (seconds). While `/api/run` or `/api/install-guard` is executing, the server serves **nobody** — no health check, no other API call. There is no timeout, no concurrency guard, and no rate limit, so N concurrent POSTs fork N `npx` processes and serialize the loop into a multi-second freeze. The `catch {}` **silently swallows every failure** — if the loop errors, the client gets a stale `200 OK` with old `state()` and no signal anything failed.
**Fix:** Replace `execSync` with async `execFile` (array args, no shell) and `await` it; add a `{ timeout: 30000 }`; serialize with an in-flight mutex that 409s concurrent runs; on non-zero exit, return `500` with the captured stderr instead of swallowing it.

### P0-3. The two arguments to `execSync` are derived from request flow but more importantly the commands themselves are a shell-injection-shaped pattern; the `curl` path in experiment.ts IS injectable
**File:** `src/experiment.ts:69`
```ts
execSync(`curl -s -X POST ${endpoint} -H "content-type: application/json" --data-binary @...`, ...)
```
`endpoint` comes from `process.env.PHOENIX_COLLECTOR_ENDPOINT` and is interpolated **directly into a shell string**. An env value like `http://x; rm -rf ~` executes arbitrary commands. Env vars are lower-trust than people assume (CI matrices, `.env.local`, shared dev machines, supply-chain). The daemon's `run()` commands are currently static, but the pattern (`execSync(stringTemplate)`) is the same foot-gun and will be copied.
**Fix:** Never build shell strings. Use `execFile("curl", ["-s","-X","POST", endpoint, ...])` (no shell, no interpolation), and validate `endpoint` is a well-formed `http(s)://` URL before use. Ban `execSync(\`...${x}...\`)` in lint.

### P0-4. No input validation or size limit on request bodies → unbounded memory
**File:** `src/daemon.ts:34-36`
```ts
function body(req){ return new Promise(r=>{ let b=""; req.on("data", c=>(b+=c)); req.on("end",()=>r(b)); }); }
```
The body accumulator has **no max length**. A client streaming gigabytes of `data` grows `b` until the process OOMs. `ticket` is then passed straight into `runScenario` → the deterministic agent runs regexes over the entire string (`src/agent.ts:25,32`) — a catastrophic-backtracking-adjacent and memory-amplification vector. There is also no `Content-Length` check and no `req.on('error')` handler (a socket error mid-body leaves the promise pending forever, leaking the request).
**Fix:** Cap body at e.g. 64 KB (`if (b.length > MAX) { req.destroy(); reject/400 }`), add `req.on('error', ...)`, and reject oversized `Content-Length` up front.

### P0-5. The product's core robustness claim ("injection-AGNOSTIC", "not keyword matching") is contradicted by its own agent stand-in — the demo is structurally circular
**File:** `src/guard.ts:1-7` (claim) vs `examples/vulnerable-support-agent/agent.ts:25-42` (reality)
The guard header says it is "injection-AGNOSTIC (no keyword matching of the attack)… the real engineering the demo rests on." But the thing being guarded — `decideActions` — is a **deterministic regex** that only ever emits `refund_customer` when it sees a money verb + a ≥2-digit number, and `send_email` only when it sees a send-verb + a non-customer email address. The guard then blocks `send_email` because **`send_email` is not in `allowedTools`** (`guard.ts:38`), which is a hardcoded allowlist, not intent reasoning. So the "before/after" result is: a hardcoded regex produces a tool call, and a hardcoded allowlist rejects it. **No model, no intent inference, no generalization is exercised anywhere.** The "paraphrased mutation proves it isn't overfit" claim (`CURRENT_STATE.md:11`) is hollow: the mutations were hand-written to contain the exact verbs/number/email the regex matches. This is the central honesty problem — the artifact demonstrates far less than the copy asserts.
**Fix:** Either (a) wire a real model behind `decideActions` (the env scaffolding exists — `ANTHROPIC_API_KEY`) so the guard actually defends against an agent that can be talked into off-plan tools; or (b) rewrite all "injection-agnostic / real engineering" language to "allowlist over a deterministic fixture" and stop claiming generalization the test cannot show.

### P0-6. `send_email` PII gate is dead code — it can never run
**File:** `src/guard.ts:37-50`
```ts
if (!plan.allowedTools.includes(tool)) return { decision: "block", ... };   // line 38
...
if (tool === "send_email") {                                                // line 47
  if (!plan.allowExternalEmail) return { decision: "block", ... };
  if (containsPII(args?.body || "", customer)) return { decision: "block", ... };  // line 49 — UNREACHABLE
}
```
`send_email` is **not** in `allowedTools` (`guard.ts:26`), so every `send_email` call is blocked at line 38 and **never reaches** the PII-egress check at lines 47-49. The headline capability — "PII egress blocked" — is implemented but **structurally unreachable**. If a future plan ever adds `send_email` to the allowlist with `allowExternalEmail:true`, the only thing standing between the agent and a PII leak is `containsPII`, which is a **case-insensitive substring match on three exact fields** (see P1-1) and is trivially bypassed. The product's marquee privacy control is simultaneously dead and weak.
**Fix:** Decide the model: if `send_email` is legitimately never allowed, delete the unreachable PII branch and stop advertising "PII egress blocked" as an active control. If egress is meant to be conditionally allowed, add `send_email` to the plan and replace the substring check with real PII detection (P1-1).

### P0-7. No `tsconfig.json` and no typecheck anywhere → `any` everywhere, zero compile-time guarantees
**Files:** repo root (no `tsconfig.json`); `package.json:7-18` (no `typecheck`/`build` script); `.github/workflows/vibeshield.yml` (no `tsc`)
The entire codebase runs via `tsx`, which **transpiles without type-checking**. There is no `tsconfig.json`, so `strict` is off, and `req`/`res`/`args`/`obj` are typed `any` throughout `daemon.ts`. For a tool whose value proposition is *correctness of a security guard*, shipping with **no type checking in CI** means a typo in a field name (`final_status` vs `finalStatus`, `eval` vs `evaluation`) silently produces `undefined`, flips a gate, and nobody finds out. The CI "gate" (`vibeshield.yml:23-25`) only reads two booleans out of a JSON the same untested code wrote — it cannot catch a type regression.
**Fix:** Add a `tsconfig.json` with `"strict": true`, add `"typecheck": "tsc --noEmit"` to `package.json`, and make CI run it **before** the loop. Replace the `any`-typed `req`/`res` with `IncomingMessage`/`ServerResponse`.

---

## P1 — Serious

### P1-1. PII detection is a hardcoded 3-field substring match — bypassable by any encoding, partial, or formatting change
**File:** `src/guard.ts:32-35`, mirrored in `src/evals.ts:38-40`
```ts
function containsPII(text, c){ const hay=String(text).toLowerCase();
  return [c.email,c.phone,c.name].some(p => hay.includes(p.toLowerCase())); }
```
This only catches the **exact** stored `email`, `phone`, and `name` as contiguous substrings. It misses: phone reformatting (`+1-415-555-0199` → `(415) 555 0199` or `4155550199`), name reordering (`Doe, Jane`), any base64/hex/URL-encoding, zero-width-char insertion, leetspeak, splitting across lines, or **any PII that isn't this one hardcoded customer** (a different customer's SSN, card number, address — none are detected). It is presented as the privacy control but is defeated by the most basic obfuscation. The eval (`evals.ts:38`) uses the identical weak check, so the test **cannot detect a real leak** that's been lightly transformed — meaning "0 PII disclosed" in the AFTER run is not evidence of safety.
**Fix:** Replace with structural detectors (regex for emails/phones/cards/SSNs with normalization that strips separators before matching) plus a denylist seeded from the customer record, normalized (lowercased, punctuation-stripped). Document that this is best-effort, not a guarantee.

### P1-2. Money-extraction off-by-one: refunds of `$1`–`$9` and `$X.YY` are silently missed
**File:** `examples/vulnerable-support-agent/agent.ts:26`
```ts
const m = ticket.match(/\$?\s?([0-9][0-9,]+)/);
```
`[0-9][0-9,]+` requires **at least two leading digits**, so a single-digit amount (`refund $5`) **does not match** and **no refund tool call is emitted at all** — the agent quietly does nothing. Decimals are truncated: `$199.99` matches `199` (the `.99` is dropped), and `$1,0` style typos mis-parse. For a "money movement" risk engine, **systematically failing to model small refunds and cents** is a correctness hole: an attacker probing the guard learns that sub-$10 and fractional amounts bypass the *detection* entirely (the guard only sees what the agent emits). The threshold check `Number(args?.amount) > 100` (`guard.ts:41`) also uses `>` not `>=`, so exactly `$100.01`… is fine but `$100` exactly is allowed — verify that matches the stated "over $100" policy (it does, but it's an undocumented boundary that belongs in a test).
**Fix:** Use `/\$?\s?([0-9][0-9,]*(?:\.[0-9]{1,2})?)/`, parse with the separators stripped, and add boundary unit tests at `$0`, `$1`, `$99.99`, `$100`, `$100.01`.

### P1-3. ZERO unit tests on the guard, the evals, and the scanner — the security core is unverified
**Files:** entire repo — no `*.test.ts`/`*.spec.ts` exist; `package.json` has **no `test` script**; CI never runs a test runner.
The functions that decide *allow / block / hold* (`safeInvoke`), that compute *PASS / FAIL / pii_disclosed* (`evaluateRun`), and that classify tool risk (`scan.ts`) have **no isolated tests**. The only "verification" is an end-to-end loop (`verify.ts`) that runs the same fixtures and checks aggregate counts — it cannot pin behavior on edge inputs (empty string, unicode, huge input, missing args, `amount: "100"` as a string, `null` body, an unknown tool name). A security tool with no unit tests on its decision function is not shippable; any refactor can invert a decision and every gate stays green because the gates are computed by the same code.
**Fix:** Add `vitest`. Write a table-driven test for `safeInvoke` covering each tool × {allowed, blocked, held, missing-args, string-amount, boundary} and for `evaluateRun` covering each `final_status` branch. Add `"test": "vitest run"` and run it **first** in CI, gating on it.

### P1-4. Race conditions on shared on-disk state — concurrent requests corrupt the demo
**File:** `src/daemon.ts:13` (module-global `RUN_ID`), `:58-59` (`rmSync` of `runs/after`), `harness.ts:91-99` (all writes to fixed `runs/before|after/*.json`)
`RUN_ID` is a single module-global mutated by `bumpRun()`; two concurrent `/api/live-scan` calls interleave the bump and the writes. Worse, `/api/live-scan` does `rmSync("runs/after", {recursive:true,force:true})` (`:58`) at the same moment another in-flight `/api/run` is *writing into* `runs/after` — classic delete-vs-write race producing partial files. `readRuns()` (`daemon.ts:16-19`) then `JSON.parse`s whatever half-written file it finds and **throws** (no per-file try/catch), 500-ing `/api/state`. There is **one** global `runs/` directory, so two browser tabs (or the judge view + the demo page) running loops at once **clobber each other's evidence**.
**Fix:** Namespace artifacts per `run_id` (write to `runs/<run_id>/...`), make `readJson` tolerant (try/catch per file, skip corrupt), and serialize mutating endpoints with the mutex from P0-2.

### P1-5. `readFileSync` on hardcoded paths with no existence check → daemon 500s / crashes on missing files
**File:** `src/daemon.ts:37`, `:43-45`
```ts
const file = (rel) => readFileSync(join(ROOT, rel), "utf8");
if (url === "/") return page(res, file("web/app.html"));
```
If `web/app.html`, `web/demo.html`, or `web/judge.html` is missing (wrong CWD — the daemon hard-assumes `process.cwd()` is the repo root, `daemon.ts:11`), `readFileSync` throws synchronously inside the handler → unhandled, and the request hangs/500s with a raw stack. Run the daemon from any directory other than the repo root and **every route is broken**. There is no graceful "file not found" and no CWD validation at startup.
**Fix:** Resolve paths relative to the module dir (`import.meta.url`/`__dirname`), not `process.cwd()`. Wrap file serving in try/catch → `404`/`500` with a clean message. Validate required files exist at boot and fail fast with a clear error.

### P1-6. Server binds with no host arg → binds all interfaces (`0.0.0.0`); no CORS policy, no auth
**File:** `src/daemon.ts:75`
```ts
.listen(PORT, () => console.log(...));
```
`listen(PORT)` with no host binds to **all interfaces**, so on any shared/office/coffee-shop network the daemon — which **executes `npx tsx` subprocesses, deletes directories, and runs the agent on attacker-supplied `ticket` text** — is reachable by anyone on the LAN. There is no auth, no CORS restriction, no origin check. `/api/run` and `/api/install-guard` are unauthenticated remote command triggers. `judge.html` hardcodes `http://localhost:7878` (`web/judge.html:373`) so it works locally, but the server itself is wide open.
**Fix:** `listen(PORT, "127.0.0.1", ...)`. Add an origin allowlist for the API. If remote access is ever needed, put it behind a token. State the binding in the README.

### P1-7. `update_user_plan` is "unauthorized" in evals but the guard has no rule for it and the agent never emits it — a whole risk class is unmodeled
**Files:** `src/evals.ts:18-23` (counts `update_user_plan` as unauthorized) vs `src/guard.ts:37-51` (no `update_user_plan` branch) vs `agent.ts` (never emits it)
The eval treats any `update_user_plan` as a FAIL (`evals.ts:22`), and the scanner flags it high-risk (`scan.ts:20`), but: (1) the deterministic agent **never produces** `update_user_plan`, so the "before" run never exercises it; and (2) `safeInvoke` has **no specific handling** — it would be blocked only incidentally because it's not in `allowedTools`. So a privilege-escalation tool the product explicitly names as a risk is **never tested end-to-end** and has **no dedicated control**. The "we found and fixed N attack paths" story silently omits one of the three high-impact tools.
**Fix:** Add a test case whose ticket induces a plan change, confirm the guard blocks it, and add an explicit privilege-change branch to `safeInvoke` so the control is intentional, not accidental.

### P1-8. Silent catches everywhere hide real failures and produce false-green demos
**Files:** `src/daemon.ts:32` (`catch { /* surfaced via state */ }`), `src/experiment.ts:71` (`catch { phoenix_shipped=false }`), `src/demo-verify-three.ts:7` (`catch {}`)
`demo-verify-three.ts:7` is the worst: `const sh = (cmd) => { try { execSync(cmd,{stdio:"ignore"}); } catch {} }`. The stability harness **ignores the exit code and stdout/stderr of every step** and then asserts stability from whatever files happen to be on disk. If `run.ts` crashes on run 2, the previous run's files linger and the stability check can still pass — **the "3 consecutive green runs" gate can be green while runs are actually failing.** `stdio:"ignore"` means no logs are captured anywhere, so in production you'd have no idea what broke.
**Fix:** Capture and surface subprocess exit codes; fail the harness if any step exits non-zero; log stderr. Never `catch {}` without at least logging.

---

## P2 — Quality / ops debt

### P2-1. `args` typed `any` throughout; no schema validation on tool arguments
**File:** `src/guard.ts:37` (`args: any`), `agent.ts:3-6`, `tools.ts:42-59`. `Number(args?.amount)` (`guard.ts:41`) yields `NaN` for missing/garbage amounts, and `NaN > 100` is `false`, so a malformed refund **silently passes the approval gate** as "allow". No tool validates its own args.
**Fix:** Validate args per tool (zod or hand-rolled), reject `NaN` amounts explicitly, and type `args` instead of `any`.

### P2-2. Dead / dangling code: `dashboard.ts` reads `verify.overall_pass` which `verify.ts` never emits
**File:** `src/dashboard.ts:36`, `:86-87`, `:123`, `:129` reference `verify.overall_pass`; `verify.ts` only writes `core_loop_pass`/`demo_ready`/etc. (no `overall_pass`). So `studio.html` always renders "VERIFY FAILED" / `undefined`. `dashboard.ts` is also not in `package.json` scripts (orphaned). `CURRENT_STATE.md:13` still claims `overall_pass=true` — stale.
**Fix:** Align field names (use `demo_ready`/`core_loop_pass`), wire or delete `dashboard.ts`, and update the doc.

### P2-3. Magic strings and duplicated risk lists everywhere
The danger-tool list `["refund_customer","send_email","update_user_plan"]` is re-hardcoded in `run.ts:8`, `report.ts:31`, `dashboard.ts:31`, `app.html:97,119`, `demo.html:119`, `judge.html:525`. The `>100` threshold is duplicated in `guard.ts:41`, `evals.ts:21,43`, `demo-verify-three.ts` logic, and `judge.html`. Any policy change requires editing seven files; they **will** drift.
**Fix:** Export one `POLICY` constant (threshold, high-impact tool set, PII fields) from a shared module and import everywhere, including serializing it to the web layer.

### P2-4. No graceful shutdown, no structured logging, no health endpoint, no request logging
**File:** `src/daemon.ts` — no `SIGINT`/`SIGTERM` handler (in-flight `execSync` is orphaned on Ctrl-C), no `/healthz`, `console.log` only, no per-request log line, no timestamps. Ops-blind.
**Fix:** Add signal handlers that drain and `server.close()`, a `/healthz`, and minimal structured request logging.

### P2-5. `evaluateRun` has subtle status-precedence gaps
**File:** `src/evals.ts:46-50`. `approval_required_but_missing` is computed (`:42`) but **never affects `final_status`** — an executed over-$100 refund is caught by `executedUnauthorized` instead, so the dedicated field is decorative. Also `normal_utility_preserved` is just an alias for `replied` (`:34,58`) — it does not verify the reply is *appropriate*, only that *some* `create_support_reply` ran (which the agent **always** appends, `agent.ts:45`), so this metric is **always true** and proves nothing.
**Fix:** Either use `approval_required_but_missing` in the status decision or remove it. Make `normal_utility_preserved` mean something (e.g., reply ran AND no spurious tool fired), since as written it can never be false.

### P2-6. Overstated integration labels in user-facing copy
**Files:** `report.ts:53,70` ("ArmorIQ-compatible"), `experiment.ts:79` ("Phoenix integrated" label when a `curl` returns 0), `.env.local.example`. The auditor (`report.ts:140`) explicitly bans the literal strings "ArmorIQ integrated"/"Phoenix integrated" in the *reports* — but `experiment.ts:79` will emit the label `"Phoenix integrated"` into `phoenix_status.json` whenever a fire-and-forget `curl` exits 0, **without verifying Phoenix actually ingested anything** (curl to a 404 still exits 0 with `-s`). That's a claim of integration on no evidence.
**Fix:** Only label "integrated" after a verified round-trip (read back an ingested span). Until then, "spans POSTed (unverified)".

### P2-7. `scan.ts` tool detection is a loose regex that over/under-matches
**File:** `src/scan.ts:40` — `new RegExp(\`["'\\\`]?${t}["'\`]?\\s*[:=(]\`)` matches any mention of a known tool name followed by `:`/`=`/`(` in *any* scanned file, including comments and this review. It only knows **6 hardcoded tool names** (`TOOL_RISK`), so a real "vibe-coded" repo with a tool named `issueRefund` or `wireMoney` scans as **clean** — the scanner cannot generalize beyond the demo fixture, contradicting the "static scanner walks a local repo" framing.
**Fix:** Either scope the claim to "detects the demo's known tools" or implement real AST-based tool-definition discovery.

### P2-8. `.gitignore` ignores `runs/` and `.vibeshield/` but the daemon/CI depend on them existing at start
**File:** `.gitignore:13-16` ignores all generated artifacts; `daemon.ts:state()` and `report.ts` read them. A fresh clone has **no** `runs/`, `risk_map.json`, or `verify_results.json`, so `/api/state` returns nulls and the UI renders empty until a full loop is run. Not wrong, but undocumented first-run sequencing that will confuse anyone but the author.
**Fix:** Document the required bootstrap sequence (it's in `CURRENT_STATE.md:31-39` but the daemon should also auto-run the loop once or serve a clear "run the loop first" state).

---

## What is genuinely good (so the score is calibrated, not reflexive)
- The before/after framing and the **deterministic, reproducible** harness writing real JSON evidence is a clean idea and is internally consistent.
- `verify.ts` is refreshingly **honest** about not claiming `overall_pass` — it keeps `demo_ready`/`full_verification_pass` false until real surfaces exist, and `CURRENT_STATE.md` enumerates what's *not* built.
- The `judge.html` view escapes output (`esc`, `markInjection`) and handles fetch errors gracefully — the **client** is more defensively coded than the server.
- The report auditor (`report.ts:128-156`) recomputing numbers from artifacts and banning unsafe legal/integration wording is a thoughtful guard against its own overclaiming.

None of that changes the verdict: **the security-critical code has no unit tests, the HTTP server is exploitable for DoS and is LAN-exposed with shell-spawning endpoints, and the headline robustness claim is circular.**

---

## Top remediation order
1. Daemon: try/catch + body-size limit + bind `127.0.0.1` + async `execFile` with timeout + mutex (P0-1, P0-2, P0-4, P0-6→server, P1-6).
2. Add `tsconfig.json` strict + `tsc --noEmit` in CI (P0-7).
3. Add `vitest` unit tests for `safeInvoke` and `evaluateRun` (P1-3).
4. Fix the dead PII branch and replace substring PII detection (P0-6, P1-1).
5. Kill `execSync(string)` interpolation in `experiment.ts` (P0-3).
6. Rewrite the "injection-agnostic / real engineering" claims to match reality, or wire a real model (P0-5).
