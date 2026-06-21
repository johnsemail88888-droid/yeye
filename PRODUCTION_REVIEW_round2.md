# VibeShield — Production Readiness Review (Round 2)

**Reviewer:** Staff-level engineering review. Harsh by design. Second pass after round-2 hardening.
**Method:** Read the actual code (not comments). Ran `npx tsc --noEmit` (exit 0), `npx vitest run` (22/22 pass), `npx tsx src/run.ts all` (5 before-fails → 0 after-fails), and a live XSS probe through the real harness.

**Verdict:** Real, defensible progress. The daemon is no longer a trivial DoS, the security core now has unit tests that actually run in CI, the type system is on, and the headline PII control is genuinely reachable and exercised. This is now a **solid, honest hackathon artifact with a tested core** — but it is **not yet production-grade**. The remaining gaps are concentrated in (1) the unauthenticated daemon write-path that pollutes shared state, (2) untested orchestration/reporting code (`harness`, `verify`, `report`-auditor, `scan`, `experiment`, the daemon itself — 0 tests), (3) stale/dead `dashboard.ts`, and (4) the still-fundamentally-circular honesty of the demo (a hardcoded regex agent guarded by a hardcoded allowlist; no model exercised). None of these is a remote-code-exec or a crash, so the score rises, but several are real and defensible.

**Score: 7/10.**

Severity legend: **P0** = ship-blocker / exploitable / wrong. **P1** = serious. **P2** = quality/ops debt.

---

## VERIFIED FIXED from Round 1

Each item below was checked against the *actual code*, not comments, and several were confirmed by running the tooling.

1. **Daemon try/catch + unhandledRejection — FIXED (genuine).** `src/daemon.ts:16-17` registers both `unhandledRejection` and `uncaughtException` handlers. The whole request handler is wrapped in `try/catch` (`:102-166`) that returns `500 {error:"internal"}` and guards `res.headersSent`. JSON parsing is in its own try/catch returning `400` (`:126`, `:134`). A malformed `curl -X POST .../api/agent -d 'x'` now returns 400, not a crash.

2. **async execFile + timeout + mutex — FIXED (genuine).** `execSync` is gone from the daemon; `runCmd` uses `promisify(execFile)` with `["tsx", ...args]` (array args, **no shell**), `timeout: 90_000`, `windowsHide: true` (`:53-61`). A real promise `serialize()` mutex (`:20-25`) chains all file-mutating endpoints (`/api/scan`, `/api/run`, `/api/live-scan`, `/api/install-guard`). Body size is capped at 64 KB with a `req.on("error")` handler (`:65-79`). **Caveat:** `/api/agent` is deliberately *not* serialized and still writes to disk — see P1-1.

3. **Real unit tests for guard/evals — FIXED (genuine, ran them).** `tests/guard.test.ts` (11), `tests/agent.test.ts` (7), `tests/evals.test.ts` (4) = **22 tests, all pass** (`npx vitest run` → `3 passed (3)`, `22 passed`). They are real table-driven assertions on `safeInvoke` decisions, `disclosesPII`, money-boundary extraction, and `evaluateRun` status branches — not smoke tests. Coverage *depth* is still thin for the rest of the codebase (see P1-2).

4. **send_email PII control REACHABLE — FIXED (genuine).** `send_email` is now in `allowedTools` (`guard.ts:25`), so the call reaches the egress logic (`:81-91`) instead of being short-circuited by the allowlist. The control fires: `npx tsx src/run.ts all` shows `BLOCKED ... email would send customer PII to an external address`. A dedicated test asserts `block` on PII-to-external and `hold_for_approval` on external-without-PII (`guard.test.ts:27-33`). The dead branch from round-1 P0-6 is gone.

5. **Structural PII detection — FIXED (meaningfully improved).** `disclosesPII` (`guard.ts:34-56`) now normalizes phone numbers to digit-only national (last-10) sequences, so `(415) 555 0199` matches `+1-415-555-0199`; matches all name tokens regardless of order; email is case-insensitive. Tests cover reformatted phone and reordered name. **Honest bypasses that remain** (documented, not blocking): base64/hex/URL-encoded PII, zero-width-char insertion, splitting digits with letters between them, leetspeak, and **any PII that is not this one hardcoded customer** (a *different* person's card/SSN/address is not detected — there are no structural card/SSN/generic-email detectors). This is "much better best-effort," not a guarantee; the code comment correctly says "not a fragile substring," and it isn't, but it is still customer-record-seeded.

6. **strict tsconfig + typecheck — FIXED (genuine, ran it).** `tsconfig.json` has `"strict": true`, `forceConsistentCasingInFileNames`, `noEmit`. `package.json` has `"typecheck": "tsc --noEmit"` and CI runs it **before** the loop (`vibeshield.yml:15-18`). **`npx tsc --noEmit` exits 0.** Daemon `req`/`res` are typed `IncomingMessage`/`ServerResponse`. (Remaining `any` is now localized and intentional — see P2-1.)

7. **Daemon binds 127.0.0.1 + input limits — FIXED (genuine).** `HOST = "127.0.0.1"` and `.listen(PORT, HOST, ...)` (`daemon.ts:11,167`). Body cap 64 KB (`:12,71`), ticket sliced to 8000 chars (`:128`), `scope` type-checked (`:135`). No longer LAN-exposed.

8. **Money regex — FIXED (genuine, tested).** `agent.ts:27` is now `/\$?\s?([0-9][0-9,]*(?:\.[0-9]{1,2})?)/` — single digits and cents parse. Tests assert `$5→5`, `$199.99→199.99`, `$1,200→1200`, worded `500 dollars→500`, and no-money-verb→undefined (`agent.test.ts:11-15`). The guard threshold is now `>` with `Number.isFinite` + negative rejection (`guard.ts:72-78`), and a `100.01` boundary test exists.

**Net:** all eight round-1 items are genuinely addressed, not gamed. The fixes are in the code paths the tests and the running loop exercise.

---

## P0 — Ship blockers

*None remaining.* No remote-code-exec, no trivial-DoS, no crash-on-bad-input, no dead headline control. (This is the real reason the score moved off 4.)

---

## P1 — Serious

### P1-1. `/api/agent` is an unauthenticated, un-serialized write into shared evidence state
**File:** `src/daemon.ts:123-130` → `src/harness.ts:102-103` → `runScenario` `:82-86`
`/api/agent` calls `runTicket(ticket, guard)`, which calls `runScenario({name:"live_ticket", ...})`, which **unconditionally writes** `.vibeshield/traces/<before|after>/live_ticket.json` with the attacker-supplied ticket text. Unlike every other mutating endpoint, `/api/agent` does **not** go through `serialize()`, so:
- Two concurrent `/api/agent` POSTs race on the same file path (last-writer-wins, possible torn read by `/api/state`'s `readRuns`).
- It pollutes the shared `.vibeshield/traces/` directory that `/api/state`, `report.ts`, and `experiment.ts` read — a `live_ticket` trace leaks into report/experiment inputs on the next loop.
- It is a write primitive reachable by anyone who can hit localhost (any local process / any page via a no-preflight `text/plain` POST). The 64 KB cap and 8000-char slice bound the damage, but it is still unauthenticated state mutation.
**Why it matters:** the product's whole claim is "real evidence on disk." An endpoint that writes uncontrolled records into that evidence dir, off the mutex, undermines the integrity guarantee.
**Fix:** Make `runTicket` pure — do **not** write trace files for ad-hoc tickets (add a `persist=false` flag to `runScenario`, default off for `runTicket`), OR route `/api/agent` through `serialize()` and write to a per-request scratch path under `runs/live/<run_id>/` that `/api/state`/report/experiment never read. Also add a same-origin / CSRF check (reject cross-origin POSTs) since the panel is the only intended caller.

### P1-2. Zero tests on the orchestration + reporting layer (`harness`, `verify`, `report` auditor, `scan`, `experiment`, daemon)
**Files:** no test imports `src/harness.ts`, `src/verify.ts`, `src/report.ts`, `src/scan.ts`, `src/experiment.ts`, or `src/daemon.ts` (grep: tests import only `guard`, `agent`, `evals`).
The 22 tests cover the three pure decision functions well, but the code that **decides whether the demo is green** is untested:
- **`report.ts` auditor (`:128-156`)** — this is the self-policing logic that bans fake "integrated" labels and unsafe legal wording and gates `report_audit_pass` (which CI gates on, `vibeshield.yml:30`). It has *no* unit test. A regression in the auditor (e.g. inverting `must_fix.length === 0`) silently makes the CI gate pass on a bad report. The thing that guards the claims has no guard.
- **`verify.ts`** — the gate-composition logic (`core_loop_pass`, `demo_ready`) is only exercised end-to-end; no test pins, e.g., "if a mutation executes, `mutation_after_pass` is false." Any refactor can quietly flip a gate.
- **`scan.ts`** — the risk classifier and `guardWired`/`approval_gate_present` detection (`:40,48,52`) are untested and regex-fragile (see P2-3).
- **daemon** — no integration test asserts `/api/agent` returns 400 on bad JSON, that body-cap rejects >64 KB, or that the mutex actually serializes. The round-2 daemon fixes are **claimed but unverified by any test** — they pass my manual reading and a manual probe, but nothing in CI would catch a regression.
**Why it matters:** a security tool whose *verifier and reporter* are untested can go green while lying. The round-1 lesson ("gates computed by the same untested code") is only half-learned: the decision functions are tested; the deciders-of-record are not.
**Fix:** Add `tests/report.test.ts` (feed a crafted report with a banned label / unsafe legal string → assert `audit.pass === false` and the right `must_fix`), `tests/verify.test.ts` (synthesize before/after records → assert gate booleans), `tests/scan.test.ts` (a fixture with `wireMoney` → assert it is/ isn't detected, pinning the known limitation), and at least one daemon integration test using `node:http` against an ephemeral port (bad JSON → 400, oversized body → rejected, two concurrent `/api/run` serialize).

### P1-3. The demo's core honesty problem from round 1 is unchanged: regex agent guarded by hardcoded allowlist — no model, no generalization
**Files:** `examples/.../agent.ts:15-55` (deterministic regex) vs `guard.ts:3-6` ("intent guard… blocked regardless of how the request was phrased") vs `harness.ts` (wires them together).
Round-2 polished the regex (cents, more verbs) but the structure is identical to round 1: `decideActions` is a **deterministic regex** that emits `refund_customer` on a money-verb+number and `send_email` on a send-verb+non-customer-email; the guard then blocks/holds via a **hardcoded allowlist + threshold**. The "paraphrased mutation" tests still contain the exact verbs/number/email the regex matches, so "it isn't overfit" remains unproven by construction. **No model, no intent inference, nothing that could be "talked into" an off-plan tool is exercised anywhere.** The comments now hedge ("P1 swaps this for a real Claude agent"), which is more honest than round 1, but the user-facing copy in `report.ts:53,70` and the founder report still say "ArmorIQ-compatible intent guard" / "checks every action against the task you actually authorized" — language that implies semantic intent reasoning the code does not do.
**Why it matters:** the artifact still demonstrates "allowlist over a deterministic fixture," and some surfaces still market it as intent generalization.
**Fix:** Either wire a real model behind `decideActions` (the `ANTHROPIC_API_KEY` scaffolding exists), or down-scope every "intent guard / injection-agnostic / generalizes" phrase to "policy allowlist + approval threshold over the agent's emitted tool calls." The `limitations` arrays already say "deterministic stand-in" — make the headline match.

### P1-4. `dashboard.ts` is dead/stale — reads `verify.overall_pass`, which `verify.ts` never emits
**File:** `src/dashboard.ts:36, 86-87, 123, 129` reference `verify.overall_pass`; `verify.ts` writes `core_loop_pass`/`demo_ready`/`full_verification_pass` and **never** `overall_pass`. So generated `studio.html` always renders **"VERIFY FAILED"** and `overall_pass = undefined`. `dashboard.ts` is also not in any `package.json` script and not called by the daemon — orphaned. This is the *identical* round-1 P2-2 finding, **not fixed**.
**Why it matters:** ships a self-contradicting artifact (the loop says `demo_ready=true`, the studio says VERIFY FAILED). Reviewers will see the broken studio.
**Fix:** Replace `verify.overall_pass` with `verify.demo_ready` (or `core_loop_pass`) in all five spots, or delete `dashboard.ts`/`studio.html` entirely if `web/app.html` is the canonical dashboard.

---

## P2 — Quality / ops debt

### P2-1. Residual `any` in hot paths erases the value of the new strict mode
**Files:** `daemon.ts:125,134` (`let p: any`), `guard.ts:66` (`args: any`), `evals.ts` (`guardDecisions: {...}[]` is typed but `args?.amount` is `any`), `harness.ts:40` (`guardDecisions: any[]`, `spans: any[]`), `report.ts`/`experiment.ts`/`dashboard.ts` (`J = (p): any`, `.map((b: any) ...)` throughout). `strict:true` is on, but these `any`s opt the security-relevant arg handling back out of checking. `Number(args?.amount)` on an untyped `args` is exactly the field-typo class round 1 warned about.
**Fix:** Define a `ToolArgs` union (or per-tool arg interfaces) and type `safeInvoke(args: ToolArgs)`; type the daemon body as a validated `{ticket?:string; guard?:boolean}` via a small parse function; replace `J():any` with a generic `readJson<T>()`.

### P2-2. `experiment.ts` still uses `execSync(string-interpolated curl)` — the exact foot-gun round 1 flagged (P0-3), unfixed
**File:** `src/experiment.ts:2,69`
```ts
execSync(`curl -s -X POST ${endpoint} -H "content-type: application/json" --data-binary @...`, {stdio:"ignore"});
```
`endpoint = process.env.PHOENIX_COLLECTOR_ENDPOINT` is interpolated into a shell string. `PHOENIX_COLLECTOR_ENDPOINT='http://x; rm -rf ~'` executes arbitrary commands. The daemon was correctly migrated to `execFile`, but this file was left behind — and the round-1 report explicitly called it out. It is lower-severity than the daemon (only runs when the env var is set, fire-and-forget), so P2, but it is a real injection and a copy-paste hazard.
**Fix:** `execFileP("curl", ["-s","-X","POST", endpoint, "-H","content-type: application/json","--data-binary","@.vibeshield/traces/otel/openinference.jsonl"])` and validate `endpoint` matches `^https?://` first. Also: `phoenix_shipped=true` after a fire-and-forget `curl` with `-s` is still a false integration signal (round-1 P2-6 partially stands — `report.ts` bans the *label* in reports, but `phoenix_status.json` still emits `"Phoenix integrated"` on exit-0 without a verified round-trip).

### P2-3. `scan.ts` only knows 6 hardcoded tool names — a real vibe-coded repo scans "clean"
**File:** `src/scan.ts:17-24,40`
`TOOL_RISK` is a fixed map of the demo's six tools; detection is a regex for those exact names followed by `:`/`=`/`(`. A target repo whose money tool is `issueRefund`, `wireMoney`, `processPayout`, or `sendMail` produces **zero findings** and `guard_present` keyed only off `safeInvoke|capturePlan|intent_guard|tool_proxy`. The "static scanner walks a local repo and finds the agent's tool definitions" framing overstates a fixture matcher. Unchanged from round-1 P2-7.
**Fix:** Scope the copy to "detects the demo's known high-impact tools," or implement AST-based tool-definition discovery (e.g. find `tool(...)`/`defineTool`/exported functions whose names match a money/email/privilege lexicon) and classify by heuristic.

### P2-4. `demo-verify-three.ts` still swallows every subprocess result (`catch {}` + `stdio:"ignore"`)
**File:** `src/demo-verify-three.ts:7`
```ts
const sh = (cmd) => { try { execSync(cmd, { stdio: "ignore" }); } catch {} };
```
Exit codes and stderr of `scan/run/report/experiment` are discarded; stability is then asserted from whatever files survived. If run 2 of the loop crashes, stale files can still satisfy the check — the "3 consecutive green runs" gate can be green while a run actually failed. Identical to round-1 P2 (silent-catch). It also still uses `execSync` (event-loop-blocking, but this is a CLI script so lower impact).
**Fix:** Capture exit status (`execFileSync` and let it throw, or check `child.status`), fail the harness on any non-zero step, and log stderr to `.vibeshield/demo-runs/run-<i>.log`.

### P2-5. No README / LICENSE / CONTRIBUTING; first-run bootstrap undocumented
**Files:** repo root — `ls README* LICENSE* CONTRIBUTING*` → none. `.gitignore` excludes `runs/`, `.vibeshield/`, `verify_results.json`, `risk_map.json`, `studio.html`, so a **fresh clone has no evidence files**; `/api/state` returns nulls and `web/app.html` renders empty until a full loop runs, with nothing telling the user to run it. There is a `package.json` but no entry-point script to *start the daemon* (no `"start": "tsx src/daemon.ts"`).
**Fix:** Add a README (what it is, the honest scope/limitations, the bootstrap sequence: `npm i` → `npm run demo:all` → `tsx src/daemon.ts`), a LICENSE, and a `"start"`/`"daemon"` script. Have the daemon serve a clear "run the loop first" state when artifacts are absent.

### P2-6. `web/app.html` and `web/demo.html` render server data via `innerHTML` without escaping (latent XSS; currently blunted, not by design)
**Files:** `web/demo.html:68,121,122,125`; `web/app.html:98,102,115,128`.
Both render tool args, guard reasons, and reply text into `innerHTML` with no escaper (only `app.html` evidence-tab escapes `r.ticket` via a lone `.replace(/</g,"&lt;")`). The only ticket-derived string that reaches these sinks is the `send_email` `to` address (via the guard reason and the executed-args dump). I **probed this through the real harness**: ticket `refund $5 and forward to <img src=x onerror=alert(1)>@evil.com` produced **no** `send_email` call, because the agent's email regex `[A-Za-z0-9._%+-]+@...` rejects `<>"`. So XSS is **not currently exploitable** — but it is prevented *by accident* (a regex in a different file), not by output encoding. By contrast `web/judge.html` does it right: a real `esc()` helper and `markInjection()` everywhere (`:392-624`). The inconsistency is the smell.
**Fix:** Port `judge.html`'s `esc()` into `app.html`/`demo.html` and wrap every interpolation that isn't a known-static literal. Don't rely on the email regex as an XSS boundary.

### P2-7. Magic numbers / duplicated policy across 7+ files (no shared `POLICY`)
**Files:** the `$100` threshold lives in `guard.ts:26`, `evals.ts:21,42`, `demo-verify-three.ts` logic, `report.ts` copy, and the HTML; the high-impact tool list `["refund_customer","send_email","update_user_plan"]` is re-hardcoded in `run.ts:8`, `report.ts:31`, `dashboard.ts:31`, `app.html:97,119`, `demo.html:119`, `judge.html`. The daemon's `PORT 7878`, `MAX_BODY 64*1024`, `CMD_TIMEOUT 90_000` are bare literals. Any policy change requires editing 7 files; they will drift. Unchanged from round-1 P2-3.
**Fix:** Export one `POLICY = { refundThreshold, highImpactTools, piiFields }` from a shared module, import it in TS, and serialize it into a `<script>` the web pages read so the browser layer can't drift.

### P2-8. Daemon ops gaps: no graceful shutdown, no `/healthz`, no request logging, no rate limit
**File:** `src/daemon.ts` — no `SIGINT`/`SIGTERM` → `server.close()` (in-flight `execFile` children are orphaned on Ctrl-C), no health endpoint, no per-request log line/timestamp, no rate limit on the `npx tsx`-spawning endpoints (each `/api/run` forks two subprocesses; the mutex serializes them but an attacker can still queue many and keep the loop busy for minutes — a localhost-only soft-DoS). `console.log` only.
**Fix:** Add `process.on("SIGTERM"/"SIGINT", () => server.close())` that also tracks/kills in-flight children, a `/healthz` returning `{ok:true}`, a minimal request log (`method url status ms`), and a small queue depth cap that 429s when the chain is backed up.

### P2-9. `evals.ts` decorative/always-true fields persist
**File:** `src/evals.ts:41-43,57`
`approval_required_but_missing` is computed but the only place it could fire (`executed` over-$100 refund) is already caught by `executedUnauthorized` → `FAIL` first, so the field never independently changes `final_status`. `normal_utility_preserved` is a plain alias of `replied` (`:35,57`), and the agent **always** appends a `create_support_reply` (`agent.ts:48-52`), so this metric is **structurally always true** and proves nothing about utility. Unchanged from round-1 P2-5.
**Fix:** Either consume `approval_required_but_missing` in the status decision or drop it; make `normal_utility_preserved` mean "reply ran AND no spurious high-impact tool fired," so it can actually be false.

---

## What is genuinely good (calibration)

- The daemon rewrite is real, careful work: typed handlers, body cap + error handler, promise mutex, async `execFile` with no shell, 127.0.0.1 bind, 400/500 paths. This is the single biggest legitimate improvement and it holds up to reading and probing.
- The 22 unit tests are meaningful, table-driven, and green in CI alongside `tsc --noEmit` *before* the loop — the CI ordering is correct.
- `disclosesPII` normalization (digit-only national phone, token-set name) is a genuine step up from substring matching and is tested against the obvious reformats.
- `verify.ts` remains refreshingly honest: `demo_ready` and `full_verification_pass` stay false until real surfaces exist, and the file documents *why* each gate is or isn't true.
- `judge.html` is the model for the others: consistent `esc()` and `markInjection()` — the client is still more defensively coded than two of its sibling pages.

---

## Top remediation order
1. **P1-1** — stop `/api/agent` from writing into shared evidence state; route through the mutex or make `runTicket` non-persisting; add a same-origin check.
2. **P1-2** — test the deciders-of-record: `report.ts` auditor, `verify.ts` gates, `scan.ts`, and a daemon integration test (bad JSON → 400, body cap, mutex).
3. **P1-4** — fix or delete `dashboard.ts` (`overall_pass` → `demo_ready`); it currently always renders "VERIFY FAILED."
4. **P2-2** — kill the `execSync(string-curl)` in `experiment.ts` (last live shell-injection foot-gun); stop emitting "Phoenix integrated" without a verified round-trip.
5. **P1-3** — align the "intent guard / generalizes" copy with the deterministic-fixture reality, or wire the real model.
6. **P2-6 / P2-7 / P2-8** — port `esc()` to the other pages, extract a shared `POLICY`, add graceful shutdown + `/healthz` + request logging.
