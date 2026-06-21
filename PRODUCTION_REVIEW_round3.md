# VibeShield — Production Readiness Review (Round 3)

**Reviewer:** Staff-level engineering review. Harsh by design. Third pass, after the round-3 hardening commit (`32459a4`).
**Method:** Read the actual source (not comments, not logs). Ran the full tooling on a real checkout:

- `npx tsc --noEmit` → **exit 0** (clean).
- `npx vitest run` → **35/35 pass** (5 files: auditor 7, evals 4, guard 11, agent 7, verify 6).
- `npx tsx src/run.ts all` → BEFORE **5 FAIL / 2 safe** → AFTER **0 FAIL / 7 safe** (guard blocks PII egress, holds over-threshold refunds). Correct.
- `npm ci --dry-run` → exit 0; lockfile is v3 with 121 integrity hashes.
- **Live exploit probe** through the real daemon: POSTed an XSS payload to `/api/live-scan`, confirmed it is stored raw on disk and served raw by `/api/state`, then traced it into `web/judge.html`'s `innerHTML` sinks through a **broken `esc()`**. (State was restored to `demo_ready=true` afterward — see note at end.)

**Verdict:** Round 3 did real work — the `/api/agent` write path is now genuinely non-persisting, the daemon has a same-origin guard, `experiment.ts` has no shell injection, and the two *deciders of record* (`computeGates`, `auditReport`) are now pure, guarded, and unit-tested with assertions that actually exercise the branch logic. **Five of the six claimed round-2 fixes are genuine.** But the **sixth — "XSS escaping in the web UIs" — is only two-thirds done: `web/judge.html` ships an `esc()` that is a complete no-op**, and the daemon stores attacker-controllable scope/title strings verbatim, giving a **reachable stored XSS in Judge Mode** (the surface a hackathon judge actually opens). That is a P0 regression of the exact issue the commit claims to close. Below that sit untested orchestration code, dead code (`dashboard.ts`/`studio.html`), a CI that uses `npm install` over `npm ci`, no graceful shutdown, and the unchanged structural honesty caveat (regex agent guarded by a hardcoded allowlist).

**Score: 6/10.** (Down from the round-2 self-assessment of 7 — not because the codebase got worse, but because round-2 was scored *before* the XSS-escaping work, and round 3's escaping is demonstrably incomplete in the highest-traffic view, with a working exploit. Fix the one no-op function and it is a defensible 7.)

Severity legend: **P0** = ship-blocker / exploitable. **P1** = serious. **P2** = quality/ops debt.

---

## VERIFIED FIXED (round-2 issues, checked against real code + tooling)

1. **`/api/agent` non-persisting — GENUINELY FIXED.** `src/harness.ts:105-107` `runTicket()` calls `runScenario(..., persist=false)`; the persist guard at `:81-88` skips the `.vibeshield/traces/*` write, and `runTicket` is *not* routed through `runAll` (which is the only writer of `runs/*`). `src/daemon.ts:133-140` calls `runTicket` directly, **outside** the `serialize()` chain, and returns the record inline. Verified by probe: POSTing a ticket to `/api/agent` left `runs/` and `.vibeshield/traces/` untouched. Attacker ticket text never reaches shared evidence. **Real.**

2. **Daemon same-origin / DNS-rebinding guard — GENUINELY FIXED.** `src/daemon.ts:101-107` `originOk()` requires `Host` ∈ `{127.0.0.1:7878, localhost:7878}` **and** (if `Origin` present) that it matches `^https?://(127\.0\.0\.1|localhost):7878$`. Enforced on **every** POST at `:114` before any handler runs. This blocks a malicious web page from driving the local write endpoints via a forged `Host`/`Origin`. **Real.** (Minor: a null-Origin request with a spoofed `Host` header from a non-browser client still passes — acceptable for a localhost-only tool; see P2-5.)

3. **Deciders unit-tested — GENUINELY FIXED, and the tests bite.** `computeGates` (`src/verify.ts:23-67`) and `auditReport` (`src/auditor.ts:28-58`) are both pure (file existence is injectable in the auditor; `computeGates` takes a plain `VerifyInputs`) and both `main()`/script bodies are guarded so importing for tests does not run I/O (`verify.ts:98` `import.meta.url === pathToFileURL(process.argv[1]).href`). The tests are **not** smoke tests: `tests/verify.test.ts` flips a single AFTER run to `FAIL` and asserts `demo_ready` goes false (`:52-57`); asserts `liveScan.source==="cli"` is rejected (`:61-64`); asserts a one-mutation set fails `mutation_generic` (`:69-72`). `tests/auditor.test.ts` mismatches the summary count, deletes an evidence path, injects an absolute legal claim, drops the disclaimer, fakes "ArmorIQ integrated", and removes a source — each asserts the *specific* `must_fix` entry (`:30-56`). A faked number genuinely cannot turn a gate green. **Real.**

4. **`experiment.ts` shell injection removed — GENUINELY FIXED.** `src/experiment.ts` has no `exec*`/`child_process` import at all; the only outbound call is `fetch(endpoint, …)` (`:69`) guarded by `if (endpoint && /^https?:\/\//.test(endpoint))` (`:66`). The Phoenix endpoint comes from `process.env.PHOENIX_COLLECTOR_ENDPOINT`, is scheme-validated, and on any throw sets `phoenix_shipped=false` (`:71-73`). No string is ever passed to a shell. **Real.**

5. **README LIMITATIONS honesty — GENUINELY FIXED.** `README.md:20-25` is a blunt, accurate scope statement: deterministic stand-in (not a real LLM), sandbox-only, synthetic data, sponsor integrations are seams, single-surface. The honesty rule (`:27-28`) correctly describes the auditor flipping `demo_ready` false. No inflated claims; matches the code. **Real.**

6. **XSS escaping in `web/app.html` + `web/demo.html` — FIXED *only here*; see P0-1 for `judge.html`.** `web/app.html:70` and `web/demo.html:68` define a **correct** `esc()` (verified at the byte level: the map emits `&amp; &lt; &gt; &quot; &#39;`). In `app.html` every untrusted sink in the Findings/Evidence/Before-After panels is wrapped (`:116,119-122,128-129`), and in `demo.html` the `/api/agent` reply path — the one fed attacker ticket text — escapes `reply.args.text`, each bad call, each guard decision/reason (`:122-126`). I tried to bypass these: ticket text rendered via `demo.html send()` is fully escaped; I could not construct an injection. **These two are real.** (One residual in `app.html` — see P2-4.)

**Net:** 5.5 of 6. The escaping work is correct in the two files a *user* touches and broken in the one file a *judge* touches.

---

## P0 — Ship blockers (exploitable)

### P0-1. `web/judge.html` `esc()` is a no-op → reachable **stored XSS** in Judge Mode
**File:** `web/judge.html:392` (the function), reachable via `src/daemon.ts:141-159` (`/api/live-scan` stores `scope` verbatim) and `renderScan`/`renderEvidence`/`renderEvent` innerHTML sinks (`:477, 614, 548, 555`).

**The bug (byte-verified, not a render artifact):**
```js
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&","<":"<",">":">","\"":"\""}[c];});}
```
The replacement map maps **every character to itself**: `&`→`&`, `<`→`<`, `>`→`>`, `"`→`"`. The HTML entities (`&amp; &lt; &gt; &quot;`) that the round-3 commit intended are simply absent — almost certainly mangled when the file was written. `esc()` therefore returns its input **unchanged**. `app.html`/`demo.html` have the correct map; `judge.html` does not. (`grep -c "amp;"`: app=1, demo=3, **judge=0**.)

**Why it's reachable (proven live):** `judge.html` renders entirely from `GET /api/state`, which includes `live_scan.scope`. The daemon writes the POSTed `scope` object **straight to `.vibeshield/live_scan.json` with zero sanitization** (`daemon.ts:145,151-154`). The browser panel populates `scope` from `captureScope()` → `location.href`, `document.title`, `window.getSelection()` (`demo.html:73-86`) — all attacker-influenceable (a crafted link/hash, a poisoned page title). I POSTed:
```
{"scope":{"url":"<img src=x onerror=alert(document.domain)>","feature":"<script>steal()</script>"}}
```
and confirmed `/api/state` returns `live_scan.scope.url` **verbatim**. In `renderScan` that value flows into `'<span class="v">'+esc(r[1])+'</span>'` → broken `esc` → `innerHTML` → the `onerror` handler executes. Because it is persisted, every subsequent Judge-Mode load re-fires it: **stored XSS**, not reflected.

Every other untrusted field in judge.html (`r.test`, `r.ticket` via `markInjection` which calls `esc` first at `:399`, guard `reason`, finding `detail`, evidence paths) rides the same dead `esc` — so the broken function compromises the *entire* view, not just one field.

**Fix (one line):** replace the map with real entities (mirror app.html):
```js
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c];});}
```
**Defense in depth (do both):** sanitize `scope` server-side in `daemon.ts` before persisting — coerce to known keys and `String(...).slice(...)`, drop anything not whitelisted — so a future template bug can't be weaponized via stored state.

---

## P1 — Serious

### P1-1. Orchestration + I/O code is still **0%-tested**: `scan.ts`, `harness.buildSpans`, `experiment.ts` OTel shaping, the daemon
**Files:** `src/scan.ts` (whole module), `src/harness.ts:40-56` `buildSpans`, `src/experiment.ts:40-58` `toOtel`, `src/daemon.ts` (whole module).
**Why:** The 35 tests cover the four *deciders* well, but everything that **produces** their inputs is untested top-to-bottom and is plain script bodies (run on import), so they cannot be unit-tested without refactoring.
- `scan.ts:40` detects tools with `new RegExp(\`["'\\\`]?${t}["'\`]?\\s*[:=(]\`)` — substring-ish; a tool named in a comment or a string literal yields a false finding, and `guardWired` is a naive `/safeInvoke|capturePlan/` text match (`:48`) that flips the headline "missing-control" finding. No test pins this. If the scanner mis-fires, `risk_map.json` (which drives both judge.html and the report) is silently wrong, and **nothing catches it**.
- `buildSpans` builds the "canonical 9-span" evidence the whole OTel/Phoenix story rests on; `toOtel` maps span→`span_kind`. Both are `any`-typed and unverified. A shape regression would corrupt `openinference.jsonl` with zero signal.
**Fix:** extract `scan.ts`'s scan logic and `buildSpans`/`toOtel` into pure exported functions guarded like `verify.ts:98`, and add table tests: scanner finds exactly the 6 known tools on the example, flags `missing-control` when the guard import is absent, and `buildSpans` emits the 9 span types in order with `guard_decision` present iff `withGuard`.

### P1-2. `dashboard.ts` + `studio.html` are **dead code** carrying an unescaped-innerHTML XSS pattern
**File:** `src/dashboard.ts` (entire), output `studio.html`.
**Why:** `dashboard.ts` is invoked by **nothing** — not `package.json` scripts, not `.github/workflows/vibeshield.yml`, not `daemon.ts` (which serves `web/app.html`, not `studio.html`). Confirmed by grep. It is orphaned. Worse, it is the one surviving place that interpolates `r.test` and `JSON.stringify(c.args)` **raw** into a template-literal `innerHTML`/file (`:32,40-42,49-53,115-118`) with no `esc()` — the exact anti-pattern round 3 fixed in the live UIs. It is currently low-risk only because it reads fixed test data, but it is untested, unowned, and rots. The round-2 "dashboard dead field" fix (`studio.html:87 "dashboard_builds": null`) was cosmetic — the whole module is dead.
**Fix:** delete `src/dashboard.ts` and `studio.html`, and drop `studio.html` from `.gitignore:15`. If a static export is wanted, fold it into the daemon and reuse the real `esc()`.

### P1-3. CI uses `npm install`, not `npm ci` → the integrity-pinned lockfile is not enforced
**File:** `.github/workflows/vibeshield.yml:13`.
**Why:** The repo ships a valid `package-lock.json` (v3, 121 integrity hashes, `npm ci --dry-run` clean), but CI runs `npm install`, which may **mutate** the lock and does **not** fail on a lock/manifest mismatch or a tampered integrity hash. For a tool whose entire pitch is supply-chain-adjacent agent security, the CI should be the strict path.
**Fix:** change `:13` to `npm ci`. It is faster, reproducible, and fails closed on a poisoned lock.

### P1-4. No graceful shutdown / signal handling in the daemon
**File:** `src/daemon.ts` (no `SIGTERM`/`SIGINT`/`server.close` anywhere — grepped, zero hits).
**Why:** The server is created and `.listen()`-ed (`:109,177`) but never closed. On `Ctrl-C`/container stop it dies mid-request; an in-flight `serialize()`-chained `run.ts`/`verify.ts` child (up to a 90 s `execFile`) can be killed **between** `rmSync("runs/after")` and the regeneration in `/api/live-scan` (`:148-157`), leaving the evidence dir half-deleted and `demo_ready` stuck false until a manual rerun. There is no `server.close()`, no draining, no child-process cleanup.
**Fix:** capture the `createServer(...).listen(...)` return; on `SIGINT`/`SIGTERM` call `server.close()`, stop accepting, await the `chain` promise (or a short timeout), then exit. Make the `/api/live-scan` regenerate sequence write-then-rename instead of delete-then-write so an interrupt can't leave a hole.

---

## P2 — Quality / ops debt

### P2-1. `disclosesPII` false-negative space is real (documented best-effort, but worth stating)
**File:** `src/guard.ts:34-56`. Probed directly:
- partial email (`jane@`), space-obfuscated email (`j a n e @ …`), first-name-only, phone last-7-only, and **`plan + customer id` (`cus_8842 … pro`)** all return **false**.
- full email / full national phone / all-name-tokens (incl. concatenated `DoeJane`) return **true**.
For *this* agent it is not a live bypass: `agent.ts:43` always stuffs the full email+name+phone into the email body, so the egress block fires on those. But it is seeded from one hardcoded customer record — a *different* person's card/SSN/address is undetectable (no generic PAN/SSN/email detectors). **Fix:** add structural detectors (Luhn-checked card, SSN, generic RFC-ish email, E.164 phone) so the control generalizes beyond the seeded record; or state the boundary in the guard's own doc-comment, which currently oversells "structural."

### P2-2. `structured logging` is absent — the daemon logs via `console.error` strings
**File:** `src/daemon.ts:16-17,58,173`. All operational logging is freeform `console.error("[daemon] ...")`. No request id, no timestamp, no level, no JSON. Fine for a demo, not for "keeps the test in CI" production framing. **Fix:** a tiny `log(level, msg, fields)` JSON emitter; tag each request with the `RUN_ID`.

### P2-3. Magic numbers are unnamed-but-localized (low)
`daemon.ts:10-13` (`PORT 7878`, `MAX_BODY 64*1024`, `CMD_TIMEOUT 90_000`), `harness.ts`/`guard.ts` threshold `100`, `daemon.ts:138` ticket `slice(0,8000)`. They are at least hoisted to named consts in the daemon; the `100` refund threshold is duplicated across `guard.ts:27`, `evals.ts:21/42`, and `agent.ts` logic — a single source-of-truth const would prevent drift. **Fix:** export `REFUND_APPROVAL_THRESHOLD` once and import it in all three.

### P2-4. One residual unescaped sink in `web/app.html` (lower risk than P0-1, but real)
**File:** `web/app.html:95-103`. The `timeline` array is built with **raw** interpolation of `r.test` and `JSON.stringify(c.args)` (`:99`) and then written via `innerHTML` (`:103`) — these are *not* wrapped in `esc()`, unlike the Findings/Evidence panels in the same file. Today the desktop view only renders the fixed server-side `runs_before`, so it is not attacker-reachable through app.html itself. But it is the same latent pattern, in an escaped file, one data-source change away from live. **Fix:** wrap `r.test` and the args string in `esc()` for consistency, matching the rest of the file.

### P2-5. `originOk` accepts a spoofed `Host` from a non-browser client when `Origin` is absent
**File:** `src/daemon.ts:103-107`. The guard is correct against *browser* DNS-rebinding (browsers always send `Origin` on cross-origin POST). A raw client (curl) with no `Origin` and a forged `Host: 127.0.0.1:7878` passes — which is how my probe drove `/api/live-scan`. For a localhost-bound dev tool this is acceptable, but the daemon write endpoints have **no auth token at all**, so any local process can pollute shared state. **Fix (if hardening):** require a per-session token (printed at startup) on state-changing endpoints, or bind the write endpoints behind a `POST`-only token header.

### P2-6. `demo-verify-three.ts` deletes and regenerates `runs/` 3× but never restores `live_scan.json` ordering relative to `report.ts`
**File:** `src/demo-verify-three.ts:14-26`. Each loop `rmSync("runs")` + regenerates, and (correctly) does not touch `live_scan.json`. But `report.ts`'s auditor depends on `runs/*` matching `report.json` numbers; if a loop is interrupted (no signal handling — see P1-4) the stability summary can record a half-run as the source of truth. Low likelihood, but it is the same fragility class as P1-4. **Fix:** make each loop atomic or checkpointed.

---

## What I could NOT break (credit where due)
- `demo.html`'s `/api/agent` reply rendering — fully escaped; I could not inject through ticket text.
- The `computeGates`/`auditReport` deciders — I could not make `demo_ready` go true with a faked number, a CLI-source live_scan, a single mutation, or a missing evidence file; the tests pin each path.
- `experiment.ts` — no shell, scheme-validated fetch, fails closed.
- The before/after loop — deterministic, correct, real evidence on disk.

---

## Bottom line
One mangled function (`judge.html` `esc`) reintroduces the headline vulnerability the commit claims to have fixed, and it is **live-exploitable as stored XSS in the exact view a judge opens**. That is a P0 and it caps the score. Everything else is honest, tested where it counts, and defensible. Fix P0-1 (one line) + add server-side `scope` sanitization, delete the dead dashboard, switch CI to `npm ci`, and add `scan`/`buildSpans` tests, and this is a clean **7–8/10**.

---
*Note on method: the live exploit probe ran against a daemon instance and, as designed, mutated `runs/after`, `.vibeshield/traces/after`, and `.vibeshield/live_scan.json`. After confirming the exploit, the repository was fully restored — clean `browser-panel` `live_scan.json` rewritten, full loop + 3-run stability re-run — and re-verified: `demo_ready=true`, `core_loop_pass=true`, no XSS payload remaining on disk, stray daemon processes killed. The repo is left in the same green state it was found in.*
