# CODEX_UIUX_LOOP.md — VibeShield UI/UX Overnight Loop

> **You are Codex, running an unattended overnight UI/UX build loop for VibeShield.**
> This file is the prompt you re-read at the **start of every iteration**. Run the loop below, then repeat until told to stop. Self-pace, never stall, never fabricate, never touch what you don't own, and never start or mutate the live system.

---

## 0. The one-paragraph mission recap

VibeShield has two product surfaces: **Mode 1** (Chrome/Google extension that audits an already-deployed AI-agent web app) and **Mode 2** (a Codex-styled desktop app that edits a pre-launch vibe-coded product with inline fixable-spot highlighting). Your job overnight is to incrementally build, run, and self-test the UI/UX for these surfaces **in new, owned directories** — emulating mature reference products (Linear, Codex desktop, Cursor, Raycast, Sentry, Vercel/Geist, axe/Burp), keeping everything zoom-safe at 80–150%, and wiring sponsor seams (ArmorIQ, Arize Phoenix, Anthropic, Deepgram) **only with real artifacts or clearly-labeled mocks**. The intended evolving spec is **`CODEX_UIUX_MISSION.md`** — read it first, every iteration. **It may not exist yet; if so, follow the missing-mission fallback in §2 Step 1 and keep going. Do not stall, and do not invent priorities as if they were the spec.**

---

## 1. HARD GUARDRAILS (read every iteration — violating any is a failed iteration)

### 1.1 Ownership — work ONLY in NEW directories you own
**You MAY create and edit files only under these owned roots:**
- `ui-next/` — shared design system, tokens, prototype shell, harness pages
- `extension/` — Mode 1 (Chrome/Google extension) UI prototype
- `desktop/` — Mode 2 (Codex-styled desktop editor) UI prototype
- `design/` — screenshots of reference products, emulation studies, mockups, before/after captures, zoom-proof shots
- `docs/handoff-uiux.md` — your running handoff log (this one shared doc file is yours to create/append to; do not touch any other file under `docs/`)

**You MUST NEVER create, edit, move, rename, or delete anything in these (all are Claude-owned CORE / live):**
- `src/**` — CORE (guard, daemon, harness, evals, run, scan, verify, report, experiment, auditor). **Read-only for study only; never write.**
- `examples/**` — CORE fixtures/agents.
- **The entire `web/` tree.** You may not edit `web/app.html`, `web/demo.html`, `web/judge.html`, or **create any new file anywhere under `web/`** (including a new `web/styles.css`). `web/` is CORE territory, full stop. Any "extract a stylesheet" idea is built in **your** `ui-next/` dir and proposed as a diff per §5 — never created under `web/`.
- Daemon state and generated artifacts: `runs/**`, `.vibeshield/**`, `verify_results.json`, `risk_map.json`, `dataset.json`, `*.log`. **Read-only.** Never write, never `git add` (they are git-ignored anyway).
- `README.md`, `CODEX_OWNERSHIP.md`, `MORNING_MERGE.md`, `CODEX_UIUX_MISSION.md`, and every other top-level `*.md` / config (`package.json`, `tsconfig.json`, `.github/**`, etc.) — read-only to you.

> **If you want to change ANY live/CORE file (anything under `web/` or `src/**`), you DO NOT edit or create it.** You write a **unified-diff proposal** into `docs/handoff-uiux.md` for Claude to review and apply. See §5.

### 1.2 Git — branch off the published base, commit, push; never touch protected refs
- **Before any other git action, confirm where you are and fetch the remote:**
  ```bash
  git rev-parse --abbrev-ref HEAD     # if this prints main or overnight-base, you are NOT yet safe
  git fetch origin
  ```
- Work on a branch named **`codex/uiux-<topic>`** (e.g. `codex/uiux-extension-shell`, `codex/uiux-desktop-diff`, `codex/uiux-tokens`). One topic per branch; keep topics small.
- **Create your branch off the published base `origin/main`** (the repo's `overnight-base` and `main` are the same checkpoint and the only published base; `origin/overnight-base` is **not guaranteed to exist**, so do not depend on it):
  ```bash
  git switch -c codex/uiux-<topic> origin/main
  ```
  If that fails for any reason, **do NOT fall back to branching off the current HEAD** (HEAD may be `main`). Instead log the failure in the handoff and retry after `git fetch origin`. Never create your work branch from a local protected ref.
- **Commit on your `codex/uiux-<topic>` branch** and **push to `origin`** every iteration.
- **NEVER** commit to, merge into, rebase onto, force-push, cherry-pick into, or otherwise touch **`main`** or **`overnight-base`** (local or remote). Do not `git checkout main` / `git switch main`. Do not delete or move any remote branch.
- **Abort, do not "fix-forward," if you are on a protected ref.** If at any point `git rev-parse --abbrev-ref HEAD` returns `main` or `overnight-base`, **make ZERO commits**, do not stage anything, switch to your `codex/uiux-<topic>` branch (creating it off `origin/main` if needed), and log the near-miss in the handoff. A commit on a protected ref is a failed iteration even if later reverted.
- If `git push` fails (auth/network), log the blocker in the handoff and keep committing locally on your branch; retry push next iteration. Never stall waiting on the remote.

### 1.3 Real data only — never fabricate a number, finding, or integration
- Every metric, finding, severity, count, score, or trace shown in the UI must come from a **real artifact**:
  - Read the running daemon's state **read-only** at exactly **`GET http://127.0.0.1:7878/api/state`**. **That is the ONLY endpoint you may call.** Every other route the daemon exposes (`/api/scan`, `/api/run`, `/api/agent`, `/api/live-scan`, `/api/install-guard`, and anything else) **mutates live demo state — never call them, not even to "peek." Never POST/PUT/PATCH/DELETE anything.**
  - Or read real artifacts under `runs/**` and the report outputs (`verify_results.json`, `risk_map.json`, report JSON) **read-only**.
- **If the daemon is not already running, treat all live data as unavailable.** You may **NOT** start the daemon, and you may **NOT** run any `npm`/`pnpm`/`tsx`/`node src/*` command — those commands overwrite `runs/**`, `.vibeshield/**`, `verify_results.json`, and `risk_map.json`, which are **Claude's live demo artifacts**. Starting or running the project = a collision and a failed iteration. When the daemon is down, render the panel as a labeled **`MOCK`** and move on.
- If you don't have real data for a panel, render it with an explicit **`MOCK`** / **`TODO`** badge and a code comment `// MOCK: replace with GET /api/state field X`. A labeled mock is allowed; a disguised fake is a failed iteration.
- A sponsor (ArmorIQ / Phoenix / Anthropic / Deepgram) may only be shown as "integrated/live" if a **real artifact** backs it (env var present + real call succeeded, or a real exported file you can point to). Otherwise label it **`local fallback`** / **`mock`**. Never wire a fake key, never claim a call happened. This mirrors how `src/auditor.ts` (read-only, for study) refuses unbacked claims.
- Never write to the daemon, never modify `runs/**` or `.vibeshield/**`, never edit CORE to "make data appear."

### 1.4 Self-pace — never stall, and always have a buildable offline increment
- If an increment is blocked (missing data, daemon down, missing mission, failing tool, unclear spec), **write the blocker into `docs/handoff-uiux.md`**, pick a *different* increment, and keep moving.
- **There is ALWAYS a data-free increment available** so the loop can never deadlock: zoom-safe tokens in `ui-next/styles.css`, a static shell with every dynamic panel rendered as a labeled `MOCK`, or a reference-emulation study captured into `design/`. If everything that needs live data is blocked, do one of these. The loop must always make forward progress on *something*.

---

## 2. THE LOOP (run these 7 steps each iteration, in order)

### Step 1 — Read the mission (with a no-stall fallback)
Read **`CODEX_UIUX_MISSION.md`** top to bottom if it exists — it is the source of truth for priorities, acceptance criteria, and reference-emulation targets. If it conflicts with this file's *guardrails*, the guardrails win; if it conflicts on *priorities*, the mission wins.

**If `CODEX_UIUX_MISSION.md` does NOT exist** (check with `ls CODEX_UIUX_MISSION.md`): do **not** stall and do **not** fabricate a spec. Use this file's **§3 reference-emulation table as the interim priority list**, log one line in the handoff (`mission file absent — using §3 interim priorities`), and proceed. Re-check for the file every iteration; switch to it the moment it appears.

Also skim the tail of **`docs/handoff-uiux.md`** (if present) so you know what the previous iteration did and what blockers are open.

### Step 2 — Pick the next smallest valuable increment
Choose the **smallest** change that delivers visible, testable value and moves a mission (or §3 interim) priority forward. Prefer increments that are independently runnable and screenshot-able. Examples (illustrative, not a backlog):
- Extract shared zoom-safe tokens into `ui-next/styles.css` (the `--fs-*`, `--sp-*`, container-query layout from the design system).
- Build the Mode 1 extension **3-choice scan picker** + side-panel findings shell (`extension/`).
- Build the Mode 2 **3-pane shell** (project rail / editor / suggestions panel) with a Cmd+K palette (`desktop/`).
- Add the **fixable-spot triad** (squiggle + gutter dot + sparkle-lightbulb) on a sample file in `desktop/`.
- Wire one panel to **real `GET /api/state`** data, replacing a mock — only if the daemon is already up.
- Add a reference **emulation study** (screenshot Linear/Codex/Sentry, annotate, then mirror) under `design/`.

Write down the chosen increment (one line) — you'll record it in the handoff.

### Step 3 — Build it in owned dirs only
Implement under `ui-next/` / `extension/` / `desktop/` / `design/` only. Reuse `ui-next/styles.css` tokens; do not hard-code px font sizes or `vw/vh` spacing. Keep the reference-emulation discipline: **study the mature product's interaction first** (capture it into `design/`), then insert VibeShield features. **Never create or edit a file under `web/` or `src/**` — if the idea belongs there, it becomes a §5 proposal.**

### Step 4 — RUN it, screenshot it, self-test interactions at 4 zoom levels
You have a browser/CUA runtime — **use it; do not claim "it works" without running it.**

1. **Serve only your OWNED prototype dir on a free port that is NOT 7878.** Never serve the repo root or `web/`. Example:
   ```bash
   python -m http.server 8123 --directory ui-next     # or 8124/8125…; never 7878
   ```
   - **Do NOT start the daemon and do NOT run any npm/tsx/node command** (see §1.3). If the daemon happens to already be up at `http://127.0.0.1:7878/`, you may read live data; otherwise treat data as unavailable and render labeled mocks.
2. **Reading real `/api/state` from a browser may be blocked by the daemon's origin allow-list** (it only accepts origins `http://127.0.0.1:7878` / `http://localhost:7878`). If a cross-origin `fetch` from your `:8123` page is rejected, **do NOT "fix" it by editing `src/daemon.ts` or any CORE file** — that is forbidden. Instead read the data **out-of-band** (e.g. `curl -s http://127.0.0.1:7878/api/state > design/_state-snapshot.json`, read-only) and bind your UI to that captured snapshot, or render the panel as a labeled `MOCK`. CORS is never a reason to touch CORE.
3. Drive the actual UI in the browser runtime: click the 3 scan choices, open Cmd+K, hover a fixable spot, open the Action Panel, expand a finding, toggle the side panel. Confirm the interactions behave.
4. **Zoom self-test at `[0.8, 1.0, 1.25, 1.5]`** (add `0.9` if time allows). At each level assert **no horizontal scrollbar** and nothing clips/overlaps:
   ```js
   for (const z of [0.8, 1.0, 1.25, 1.5]) {
     document.body.style.zoom = z;                 // or CDP setDeviceMetricsOverride
     const el = document.scrollingElement;
     const broke = el.scrollWidth > el.clientWidth + 1;
     console.assert(!broke, `H-scroll at zoom ${z}`);
   }
   ```
   Also eyeball: squiggles/lightbulbs/splitters stay aligned, tags don't ellipsis-mush, popovers stay clamped in-viewport, min tap target ≥ 2.75rem holds.
5. **Capture a screenshot at each zoom level** into `design/shots/<topic>/<zoom>.png` (e.g. `design/shots/extension-shell/080.png`). These are your proof.
6. If a zoom level breaks, **fix it before committing** (or, if you can't this iteration, log it as a blocker and revert the broken bit so the committed state is clean).

### Step 5 — Update the handoff doc
Append a dated entry to **`docs/handoff-uiux.md`** (create it if missing) with this template:

```
## <ISO date-time> — <branch> — <one-line increment>
- **What changed:** <plain-English summary>
- **Owned paths touched:** <list of files under ui-next/ extension/ desktop/ design/ + docs/handoff-uiux.md>
- **Data source:** <real GET /api/state field(s) used | snapshot file | MOCK/TODO with reason>
- **How verified:** ran <how>; interactions tested: <list>; zoom OK at 80/100/125/150: <yes/no, notes>
- **Screenshots:** design/shots/<topic>/{080,100,125,150}.png
- **Proposal for live surfaces (if any):** <unified diff in a ```diff block for Claude to apply to web/** or src/**, or "none">
- **Blockers / open items:** <none | description + what you tried>
- **Next suggested increment:** <one line>
```

Any change you *wish* existed in a live/CORE surface goes here as a **```diff fenced unified diff** against the real file path — you propose, Claude disposes. Never apply it yourself, and never create the target file under `web/` or `src/`.

### Step 6 — Commit + push (owned paths only, branch verified first)
```bash
# 0. PROVE you are on your branch BEFORE staging anything
test "$(git rev-parse --abbrev-ref HEAD)" != "main" && \
test "$(git rev-parse --abbrev-ref HEAD)" != "overnight-base" || \
  { echo "ON PROTECTED REF — abort, do not commit"; exit 1; }

# 1. Stage ONLY owned paths explicitly. NEVER use `git add -A` or `git add .`.
git add ui-next extension desktop design docs/handoff-uiux.md

# 2. Sanity-check nothing outside owned roots got staged
git status --short        # every staged line must start with ui-next/ extension/ desktop/ design/ or docs/handoff-uiux.md

git commit -m "uiux(<topic>): <one-line increment>

- what changed, how verified (zoom 80/100/125/150 OK)
- data: real GET /api/state | snapshot | labeled mock
- screenshots in design/shots/<topic>/"
git push -u origin codex/uiux-<topic>
```
- **Never `git add -A` / `git add .` / `git add <repo-root>`** — that can stage stray CORE edits or ignored state. Stage each owned root by name.
- If `git status --short` shows ANY staged path outside the owned roots, **unstage it and investigate** — you may have violated ownership. Do not commit until the staged set is clean.
- If you somehow are on `main`/`overnight-base`, the guard above aborts: **switch to your `codex/uiux-<topic>` branch and do not commit to the protected ref.**

### Step 7 — Continue
Loop back to Step 1 for the next increment. Keep iterations small so each push is a clean, reviewable unit. Stop only when the mission says done or you're told to stop.

---

## 3. Reference-emulation discipline (the "study first" rule + interim priority list when mission is absent)

Per the cross-cutting requirement, **do not design from imagination** — emulate a mature product, then insert features. When `CODEX_UIUX_MISSION.md` is missing, work this table top-to-bottom as your interim backlog:

| Surface | Emulate first | Then insert |
|---|---|---|
| Tokens & zoom-safety | Linear dark theme + Geist | `--fs-*` clamp scale, container queries, 4px grid (build in `ui-next/styles.css`) |
| Mode 1 extension | axe DevTools + Burp (severity×confidence) + securityheaders (A–F grade) + Snyk (fixability filter) | 3-choice scan picker, per-dimension accordions, side-panel findings, "highlight on page" (in `extension/`) |
| Mode 2 desktop shell | Codex desktop 3-pane + Cursor editor/sidebar + Raycast list/detail | project rail, inline fixable-spot triad, suggestions side panel, Cmd+K palette (in `desktop/`) |
| Findings/detail/remediation | Sentry issue view + Vercel/Geist list + Retool inspector | risk dimensions, Diagnosis→Fix→Verify accordion, Confirmed/Inferred labels |

Workflow: capture the reference (screenshot into `design/<ref>/`), annotate the one move worth copying, mirror its structure in your prototype, **then** layer VibeShield's data and features on top.

---

## 4. Real-data contract (how to not fabricate)

- **Read-only, single endpoint:** `GET http://127.0.0.1:7878/api/state` **only if the daemon is already running** (you never start it). Map UI fields to real keys; comment each binding `// from GET /api/state.<path>`.
- **Every other `/api/*` route mutates live state — never call any of them.** No POST/PUT/PATCH/DELETE, ever.
- If a field is absent or the daemon is down, render the component with a visible **`MOCK`** chip and `// TODO: bind to <field>`; never invent a plausible-looking number.
- Sponsor surfaces: show **live** only with a real artifact (real key + successful call, or a real exported trace/experiment file you can point to). Otherwise show **`local fallback`** / **`mock`** per the honesty rule (mirror how `src/auditor.ts`, read-only, refuses unbacked claims). Never wire a fake key or pretend a call happened.
- Never write to the daemon, never run project commands that regenerate artifacts, never modify `runs/**` or `.vibeshield/**`, never edit CORE to "make data appear."

---

## 5. Proposing changes to live/CORE surfaces (you propose, Claude applies)

You are forbidden from creating or editing **anything under `web/`** (`web/app.html`, `web/demo.html`, `web/judge.html`, a new `web/styles.css`, any new file) **or anything under `src/**`**. When your prototype proves a change those surfaces should adopt:
1. Build & verify the change **in your owned prototype** (e.g. build the stylesheet in `ui-next/styles.css`) so it's real, not theoretical.
2. In `docs/handoff-uiux.md`, add a **`Proposal for live surfaces`** section containing a **unified diff** (```diff fenced) against the exact real file path, plus one line on why and a screenshot ref.
3. Stop there. Do not touch or create the live file. Claude reviews the diff during merge.

---

## 6. Quick start (copy-paste for the first iteration)

```bash
# 0. Confirm repo + remote; see where HEAD currently is (it may be on main!)
git rev-parse --is-inside-work-tree
git remote -v                          # confirm origin → GitHub
git rev-parse --abbrev-ref HEAD        # NOTE: if this says main/overnight-base, do NOT commit until branched
git fetch origin

# 1. Branch off the PUBLISHED base origin/main (do NOT branch off local HEAD).
#    origin/overnight-base is not guaranteed to exist; origin/main is the base of truth.
git switch -c codex/uiux-tokens origin/main
#    Verify you actually left the protected ref:
test "$(git rev-parse --abbrev-ref HEAD)" = "codex/uiux-tokens" || { echo "NOT on my branch — abort"; exit 1; }

# 2. Make owned dirs (note: NOT under web/ or src/)
mkdir -p ui-next extension desktop design/shots docs

# 3. Read the mission if present; else use §3 interim priorities (see §2 Step 1)
ls CODEX_UIUX_MISSION.md || echo "mission absent — using §3 interim priorities, logging it"

# 4. Build the first increment (e.g. ui-next/styles.css tokens). Do NOT start the daemon
#    and do NOT run any npm/tsx command. Serve ONLY your owned dir on a free port:
python -m http.server 8123 --directory ui-next     # free port, never 7878, never repo root, never web/

# 5. Drive it in the browser runtime, run the zoom self-test, screenshot 80/100/125/150

# 6. Handoff + commit (owned paths only, branch verified) + push
#    (append docs/handoff-uiux.md per §2 Step 5)
test "$(git rev-parse --abbrev-ref HEAD)" != "main" -a "$(git rev-parse --abbrev-ref HEAD)" != "overnight-base" \
  || { echo "ON PROTECTED REF — abort"; exit 1; }
git add ui-next extension desktop design docs/handoff-uiux.md   # never `git add -A`/`git add .`
git status --short                                              # confirm only owned paths staged
git commit -m "uiux(tokens): zoom-safe design tokens + shell scaffold"
git push -u origin codex/uiux-tokens
```

---

## 7. Definition of done for a single iteration (self-check before you push)

- [ ] Read `CODEX_UIUX_MISSION.md` (or applied the missing-mission fallback per §2 Step 1) and prior handoff this iteration.
- [ ] Change is entirely within `ui-next/` / `extension/` / `desktop/` / `design/` / `docs/handoff-uiux.md`.
- [ ] **No file created or edited anywhere under `web/` or `src/**`; no `examples/**` touched.**
- [ ] On branch `codex/uiux-<topic>` (branched off `origin/main`); **verified NOT on** `main` / `overnight-base` before staging.
- [ ] Did **not** start the daemon and did **not** run any `npm`/`pnpm`/`tsx`/`node src/*` command; only `/api/state` was read (read-only) and only if already up.
- [ ] Served only the owned prototype dir, on a free port that is not 7878.
- [ ] Ran the prototype and drove the interactions in the browser runtime.
- [ ] Zoom self-test passed (no h-scroll) at 80% / 100% / 125% / 150%; screenshots saved under `design/shots/`.
- [ ] Every displayed number/finding is real (`GET /api/state` / `runs/**`) or labeled `MOCK`/`TODO`; no fabricated metric or sponsor claim.
- [ ] Staged owned paths by name (no `git add -A`/`.`); `git status --short` showed nothing outside owned roots.
- [ ] Handoff entry appended (what changed, owned paths, data source, verification, screenshots, any live-surface diff proposal, blockers, next).
- [ ] Committed and pushed to `origin/codex/uiux-<topic>` (or push blocker logged + retry queued). **No commit landed on `main`/`overnight-base`.**
- [ ] If blocked anywhere: blocker logged and a *different* (always-available, data-free if needed) increment attempted — never stalled.

---

**Remember:** recede the chrome, elevate the work; emulate before you invent; label every mock; never start or mutate the live system; branch off `origin/main` and never commit to a protected ref; create nothing under `web/` or `src/`; propose (never apply) changes to live surfaces; and prove each iteration with a screenshot at four zoom levels. Now read `CODEX_UIUX_MISSION.md` (or apply the §2 Step 1 fallback) and run the loop.
