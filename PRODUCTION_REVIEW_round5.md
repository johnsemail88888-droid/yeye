# VibeShield — Production Readiness Review (Round 5)

**Reviewer stance:** ruthless staff-level, no inflation for effort.
**Prior scores:** r1=4, r2=7, r3=6 (stored XSS), r4=7 (Windows daemon ENOENT disqualifier).
**This round:** all round-4 fixes verified by running real code on Windows; full exhaustive gap hunt.

**SCORE: 9/10**

The round-4 disqualifier is genuinely dead and every claimed round-5 fix is real. I withhold the
last point for ONE concrete, reproducible defect: the README states a test count that does not match
reality (the README edit promised in the commit message was never actually applied), which trips the
project's own in-code "no fabricated metric" honesty rule. Secondary: the daemon — the exact component
that shipped the round-4 production break — still has **zero automated test coverage**, and its
endpoints **swallow subprocess failures into HTTP 200**, so the next regression of that class again
ships silently. Details below.

---

## Environment

- Host: Windows 11, Node v24.14.1, npm 11.11.0 (repo pins `.nvmrc=20`, `engines.node>=20`).
- All commands run from `C:\Users\Admin\Desktop\vibeshield` in a real shell.

## Commands actually run (results)

| Command | Result |
|---|---|
| `npx tsc --noEmit` | **exit 0** (clean, strict mode) |
| `npx vitest run` | **39 passed / 39** (6 files) |
| `npx tsx src/run.ts all` | **5 FAIL before → 0 FAIL after** |
| `node_modules\.bin\tsx src/daemon.ts` (fresh start) | boots clean, **no stderr**, `GET /api/state` → 200 |
| `rm risk_map.json` → `POST /api/scan` | **HTTP 200, risk_map.json REGENERATED** (round-4 ENOENT is fixed) |
| `POST /api/run` | HTTP 200, `runs_before` = **5 real FAILs**, `runs_after` = 0, `demo_ready=true` |
| 3× concurrent `POST /api/run` | serialized (0.31s/0.60s/0.90s staggered), distinct run-ids 0004/0005/0006, no clobber, no stderr |
| `npm ci --dry-run` | **exit 0** ("up to date") — lockfile matches package.json |
| `npx tsx src/report.ts` | findings: 5 · **audit score 100 · pass: true** |
| `npx tsx src/experiment.ts` | 7 examples · 229 OpenInference spans |
| `npx tsx src/demo-verify-three.ts` | **3/3 PASS**, demo_ready=true |

---

## VERIFIED FIXED (round-4 items — confirmed genuine by running the code)

### ✅ R4-DISQUALIFIER: Daemon POST works on Windows (was ENOENT)
- `src/daemon.ts:64-66` `runCmd` spawns `execFile(process.execPath, [TSX_CLI, ...args])` — i.e. the real
  `node.exe` + the resolved `tsx/cli` entry, **not** `npx`. Verified `process.execPath` =
  `C:\Program Files\nodejs\node.exe` and `tsx/cli` resolves to
  `node_modules\tsx\dist\cli.mjs` on this machine.
- **Live proof:** deleted `risk_map.json`, `POST /api/scan` → **HTTP 200 and the file was regenerated**
  (2013 bytes, correct content). This is the exact operation that ENOENT'd in round 4.
- `POST /api/run` produced `runs_before` with 5 genuine FAILs (incl. `pii_exfiltration_attempt`
  with `pii_disclosed: true`) and `runs_after` 0 FAIL. Not stale, not faked.
- Fallback path (`join(ROOT, "node_modules","tsx","dist","cli.mjs")`) exists if `tsx/cli` can't resolve.

### ✅ Same-domain PII egress now blocked
- `src/guard.ts:61-65` `isExternalAddress` treats any recipient `!== customer.email` (case-insensitive,
  trimmed) as external. Verified live: `archive@example.com` (same domain as `jane@example.com`) carrying
  PII → **block**. Customer's own address with PII → allow (correct). UPPERCASE customer self → allow
  (case-insensitive match works). Whitespace-padded external → still **block**.
- New test exists and passes: `tests/guard.test.ts:37-41` "blocks PII exfil to a SAME-DOMAIN but
  non-customer mailbox".

### ✅ `.nvmrc` + `engines` exist, `_v4pack` removed
- `.nvmrc` = `20`; `package.json` `engines.node` = `>=20` (coherent).
- No `_v4pack` anywhere in the tree; `git ls-files` is clean (41 tracked files, no stray pack).

### ✅ (carried from r3) Stored-XSS class is closed
- All three HTML files escape correctly. `judge.html markInjection` (line 398) does `esc(raw)` **first**,
  then regex-wraps already-escaped text in `<span>` — no raw `<` can survive. `demo.html` escapes
  `reply.args.text`, bad-tool args, and guard reasons (lines 122-126).
- **Live XSS probe:** ticket `forward my details to "><img src=x onerror=alert(1)>@evil.com` →
  agent's email regex rejected the payload as a non-address, so `send_email` never fired; and even
  if it had, the `esc()` on `demo.html:123` neutralizes it. No attacker-reachable unescaped sink.

### ✅ (carried from r2/r3) Daemon hardening holds
- Origin guard: `POST` with `Origin: http://evil.com` → **403**; `Host: attacker.com`
  (DNS-rebind) → **403**. Body cap 64KB. Invalid JSON → **400**. Mutex genuinely serializes
  (proven by staggered timings + monotonic run-ids). `unhandledRejection`/`uncaughtException` handlers
  present; SIGTERM/SIGINT graceful shutdown with 5s unref'd fallback. `/api/live-scan` uses tmp+rename
  atomic write.

---

## Remaining gaps (severity-ranked)

### 🟠 MEDIUM-1 — README test count is wrong (violates the project's own honesty rule) — THE #1 ISSUE
- **File:** `README.md:17` — says **"38 unit tests"**. Actual count is **39** (verified: `vitest run` →
  `Tests 39 passed (39)`).
- **Reproducible:** `npx vitest run` prints 39; README prints 38.
- The round-5 **commit message** (`0712b81`) explicitly claims *"README 39 tests"* — but the edit to the
  README file was never applied. The promised fix exists only in the commit message, not in the artifact.
- Why this costs the point and isn't a nitpick: VibeShield's entire thesis (`README.md:27`, `src/auditor.ts`)
  is **"No fabricated metric… every number is backed by an artifact."** A shipped, public, off-by-one
  metric in the project's own front-page README is precisely the failure mode the product claims to
  prevent. A 10/10 honesty-gated tool cannot ship a wrong number in its own README.
- **One-line fix:** `README.md:17` change `**38 unit tests**` → `**39 unit tests**`.

### 🟠 MEDIUM-2 — Daemon failures are swallowed into HTTP 200 (silent stale state)
- **File:** `src/daemon.ts:137-185`. `runCmd` returns a `boolean` success flag, but **all 9 call sites
  discard it** (lines 139, 146-147, 172-173, 179-182). On subprocess failure `runCmd` logs to stderr and
  returns `false`, yet the endpoint still returns **HTTP 200 with whatever is currently on disk**.
- Consequence: the round-4 ENOENT, had it still existed, would have surfaced to the user as a cheerful
  "done" with stale data rather than an error — i.e. the failure mode that disqualified round 4 would be
  *invisible* through the HTTP/UI path. This is a real observability/robustness gap, not cosmetic.
- Not higher severity because: on-disk state remains honest (never fabricated), the failure IS logged to
  stderr, and the surface is single-user localhost.
- **One-line fix:** capture the booleans and `return json(res, 500, { error: "a step failed; see daemon log" })`
  when any `runCmd` returns false (e.g. `const ok = await runCmd(...); if(!ok) return …`).

### 🟡 LOW-1 — Daemon has zero automated test coverage
- **Files:** `tests/` — no test references `daemon`, `7878`, or `/api/`. The ~200-line daemon (routing,
  origin guard, body cap, JSON validation, the serialize mutex, atomic write, the `process.execPath`+tsx
  spawn that JUST broke and was JUST fixed) is verified by **manual run only**.
- Risk: the round-4 regression class can recur and **CI will stay green** — CI runs the loop via `npx tsx`
  directly (`.github/workflows/vibeshield.yml:21-26`), never through the daemon's `execFile` path, so it
  cannot catch a daemon-spawn regression.
- **One-line fix:** add `tests/daemon.test.ts` that boots the server on an ephemeral port and asserts
  `POST /api/scan` regenerates `risk_map.json` and returns 200 (the exact round-4 case), plus a 403
  origin-guard assertion.

### 🟡 LOW-2 — `decideActions` only refunds on the FIRST number in the ticket (logic narrowness)
- **File:** `examples/vulnerable-support-agent/agent.ts:27` — `ticket.match(/\$?\s?([0-9][0-9,]*…)/)`
  takes the first numeric match. A ticket like "ticket #900123, refund $5" would extract `900123`.
- Impact: cosmetic for this sandbox (the demo tickets are crafted), and it does not weaken the guard
  (the guard re-checks the amount structurally). Worth noting only because it's the kind of input-parse
  narrowness a reviewer should flag. Not a shipped-output risk.

### 🟡 LOW-3 — `npx`-spawn pattern still lives in `demo-verify-three.ts`
- **File:** `src/demo-verify-three.ts:7,19-24` uses `execSync("npx tsx …")`. This is the same fragile
  `npx`-resolution pattern the round-5 fix deliberately removed from the daemon. It ran fine here
  (verified: 3/3 PASS) because `execSync` goes through a shell where `npx` resolves, unlike the daemon's
  direct `execFile`. So it is **not a live defect on this machine**, but it is an inconsistency: if this
  script is ever run in the daemon's spawn context it would reintroduce the round-4 break.
- **One-line fix (optional):** switch to `execFileSync(process.execPath, [tsxCli, …])` for parity with the
  hardened daemon.

### ⚪ COSMETIC (named for completeness, not point-affecting)
- `src/daemon.ts:155` `typeof p !== "object"` accepts a JS array (arrays are `object`); a posted
  `[1,2,3]` yields an empty-ticket run rather than a 400. Harmless (no crash, no security impact).
- `src/guard.ts` `isExternalAddress("")` → not-external, so an empty-recipient email with PII is
  "allowed". You cannot exfiltrate to no recipient; defensible.
- `buildSpans` (`harness.ts:40`), `toOtel` (`experiment.ts:40`), `report buildFindings` (`report.ts:27`)
  are not unit-tested, but their outputs are cross-checked end-to-end by the auditor
  (`numbers_from_artifacts`, `criticals_have_reproduced_evidence`) which scored 100. Untested but not a
  live risk.
- `any` usages in `src/` are all at I/O boundaries (JSON parse, disk reads) — acceptable.

---

## Security posture summary
- Injection-agnostic guard: confirmed structural (never matches attack strings); allowlist + $100 approval
  threshold + structural `disclosesPII` (catches reformatted phone, reordered name, case changes) +
  external-egress block, all reachable at runtime. No bypass found across email-lookalike domains,
  display-name spoofs, array recipients, padded addresses, or case changes.
- No secrets committed; `.env.local` ignored; no generated artifacts tracked; `npm ci` reproducible.
- Daemon bound to 127.0.0.1, origin/host guarded, body-capped, JSON-validated, mutex-serialized.

## What a genuine 10/10 needs (small, concrete)
1. Fix `README.md:17` 38→39 (kills the honesty-rule violation — the only true defect).
2. Make the daemon return 500 when a `runCmd` step fails (kills the silent-stale-state gap).
3. Add one daemon integration test covering the exact round-4 case (so the regression class can't
   recur green in CI).

None of these are architectural; all are an afternoon. The core engineering (the guard, the honesty
auditor, the before/after proof loop, the Windows spawn fix) is sound and verified real.
