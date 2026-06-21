# CODEX_UIUX_MISSION.md — VibeShield UI/UX Single Source of Truth

> ⛔ **SAFETY OVERRIDE — read first.** Where anything below conflicts with `CODEX_UIUX_LOOP.md`, **the LOOP wins.** Apply these corrections everywhere in this doc:
> 1. **Create nothing under `web/` or `src/`** (both are CORE, read-only for study). Wherever this doc says `web/styles.css` read **`ui-next/styles.css`**; `web/sponsors.js` → **`ui-next/sponsors.js`**; `src/integrations/*.ts` are **proposed via handoff** for Claude to create, never written by you.
> 2. **Never start the VibeShield daemon or run any `npm` / `tsx` / `demo:*` command** — they overwrite live demo artifacts. Read `GET /api/state` only if it is already up (read-only), else render labeled **MOCK**. Test your own `ui-next/` prototype, not the live surfaces.
> 3. **Branch off `origin/main`** (fetch first); never commit to or push `main` / `overnight-base`; never `git add -A` / `git add .` — stage owned paths by name.

> **Read me every iteration.** This is the only doc you (Codex) need to design, build, and self-test the VibeShield UI/UX. It encodes the founder's two-mode vision, the distilled design system from the research pack, the sponsor-API map, and the hard acceptance criteria. When in doubt, this file wins. Where this file disagrees with your memory, trust this file.

---

## 0. Mission (one paragraph)

VibeShield is a security tool for **AI-agent web apps**: it red-teams an agent, shows what broke, and proves the fix held. The **core already exists and is 10/10 / `demo_ready=true`** — a deterministic scanner, a real BEFORE→AFTER attack harness (3 real failures → 0 under guard), an ArmorIQ-compatible runtime guard, a localhost daemon (`127.0.0.1:7878`) serving live surfaces from real `/api/state` artifacts, and an honesty auditor that flips `demo_ready=false` the instant any number, trace, or sponsor claim lacks a backing artifact. **Your job is the UI/UX layer only** — two product surfaces on top of that proven core, plus continuous self-testing of them. You do **not** touch core (`src/**`, `examples/**`, the daemon-wired HTML files); you build the *experience* that makes the existing engine legible and usable. This mission extends today's VibeShield from "a working engine with a Studio view" to "two polished, zoom-safe, mature-feeling products" — Mode 1 (audit a deployed site) and Mode 2 (edit a pre-launch app) — without inventing a single number.

**Core ownership (do NOT edit — Claude-owned, per `CODEX_OWNERSHIP.md`):** `src/guard.ts`, `src/daemon.ts`, `src/harness.ts`, `src/evals.ts`, `src/run.ts`, `src/scan.ts`, `src/verify.ts`, `src/report.ts`, `src/experiment.ts`, `src/auditor.ts`, `examples/vulnerable-support-agent/*`, and the live surfaces `web/app.html`, `web/demo.html`, `web/judge.html`. Everything you build is **new files in your own dirs** — `ui-next/`, `extension/`, `desktop/`, `design/` (e.g. `ui-next/styles.css`, `ui-next/sponsors.js`, mode-specific assets) — or a proposal-diff in a handoff report for Claude to apply. (`src/integrations/<sponsor>.ts` are CORE; **propose** them, never write them. Create nothing under `web/` or `src/`.)

---

## 1. The two modes (fully specified)

Both modes render the **same finding object** the core already produces. The difference is *who owns the code* and therefore *what kind of fix you can offer*:

- **Mode 1 = a live site you do NOT own the source of** → fixes are config/infra/deployment guidance, every claim carries a confidence label.
- **Mode 2 = a pre-launch app you DO own** → fixes are directly-applicable inline patches, gated behind an explicit Apply.

### 1A — MODE 1: "Audit a DEPLOYED / already-live site" (Chrome/Google extension)

**One-line flow:** click extension → pick 1 of 3 scan directions → progress strip → results open in a pinned **side panel** (not the popup) → per-dimension findings → step-by-step "fix this live site" guide.

**Screens / states:**

1. **Popup — 3 scan-direction cards** (escalating intrusion/permission tiers; each card states exactly what it does to the live site *before* it runs):
   - **Quick Scan** (passive, ~2s, no scary perms): content-script DOM + response headers + request-metadata + static-JS grep. Always-safe default. Finds: header hygiene, exposed client secrets, missing CSP, third-party egress endpoints, unencoded sinks.
   - **Active Probe** (behavioral, ~20–40s, asks consent): types **benign canary prompts** into the detected agent input as the logged-in user, reads streamed DOM replies, scores prompt-injection susceptibility + excessive-agency. Shows a literal consent line: *"We will type test messages into this page as you."* Never auto-runs. This is the differentiator.
   - **Deep Scan** (full, asks for `debugger` permission): everything above **plus** response-body capture via CDP (`Network.getResponseBody`) to inspect agent I/O and catch PII in responses. Explicit warning: *"Chrome will show a 'started debugging this browser' banner; we read traffic only during the scan."* Power-user/demo mode.

2. **Progress strip:** "Reading DOM… checking headers… probing agent…" → results slide into a **`chrome.sidePanel`** (popups are too small and dismiss on blur; the side panel stays pinned and can highlight the offending element on the live page, axe-style).

3. **Results side panel:**
   - **Header:** overall risk **grade ring (A–F)** + scan mode used + timestamp + target origin.
   - **Three dimension accordions**, each with a mini-score + count badge, **collapsed by default**: **Prompt Injection**, **Excessive Agency**, **PII Egress**.
   - **Each finding row (Burp × axe hybrid):** `severity chip (Critical/Serious/Moderate/Minor)` + **mandatory `confidence chip` (Confirmed / Likely / Possible)** + evidence (DOM selector / request URL / canary in-out pair, one-click "highlight on page") + one-sentence "why it matters" + ordered **"how to fix this LIVE site"** steps.
   - **Counts split into "Detected" vs "Needs your review"** (axe): auto-confirmed vs human-must-verify.
   - **A "Fixability/Type" filter rail** (Snyk) so John sees "what I can fix right now" first.

4. **Remediation (live-site framing):** numbered steps are **config/infra-level**, not source edits. Each step labeled **`Confirmed` / `Inferred`**. Examples:
   - *Prompt injection:* "At your gateway/middleware, wrap retrieved/user content in a guard (ArmorIQ policy check) before the model; add an output filter; pin the system prompt server-side." Give copy-paste config + an ArmorIQ snippet.
   - *Excessive agency:* "Require confirmation before any state-changing tool call; scope tool permissions server-side; add human-in-the-loop on destructive actions."
   - *PII egress:* "Add CSP `connect-src` allowlist to block the observed third-party endpoint; strip PII before analytics; set `Permissions-Policy`." (Genuinely ops-applicable without app-code access — lean into these.)
   - Every finding ends with **"Verify the fix:"** (re-run the same probe) + **"Confidence: we observed X from the browser; root cause lives server-side."**
   - A **"Send to Phoenix / export"** action ships findings + canary traces to Arize Phoenix; findings carry a **"graded by ArmorIQ"** badge where the guard was used.

**HONEST feasibility note (Mode 1):** An extension audits the **client surface and observable behavior** of a live agent — a strong **black-box / outside-in** check, *not* a source audit. **It CAN see:** full rendered DOM (incl. streamed agent output via `MutationObserver`), response/security headers (`webRequest.onHeadersReceived`, observational MV3), request *metadata* (URLs/methods/timing), page-context JS state + static client source (grep for secrets, shipped tool/function definitions, system-prompt fragments), and — via Active Probe — it can type a benign canary and read the DOM reply as the logged-in user. **It CANNOT see:** HTTP **response bodies** without the scary `debugger` permission (which flips Chrome's debugging banner, caps at ~1MB, is brittle — so it's opt-in Deep Scan, never default); the real system prompt / tool wiring / server sanitization / RAG sources (we're on the wrong side of the API boundary — we demonstrate the *symptom* via probing, we can't read the *cause*); cross-origin iframe internals, other tabs, non-browser clients. **PII egress is inferred, not proven** unless Deep Scan captured the body — mark "Likely/Possible," not "Confirmed." Frame Mode 1 as *"red-team the live site from the user's seat,"* never *"find every bug in the code."* **The confidence axis IS the honesty layer — never render a black-box guess as a fact.**

> **Packaging reality:** real Chrome-extension packaging is CUT for the hackathon (`CURRENT_STATE.md`). Build Mode 1 as the **`demo.html` surface** that *emulates* the popup→3-choices→side-panel flow against the live daemon, structured so it could be lifted into a real MV3 extension later. Label it as the extension experience; do not claim a shipped extension.

### 1B — MODE 2: "Edit a PRE-LAUNCH vibe-coded product" (desktop app, Codex-styled)

**One-line flow:** add/upload a not-yet-live project → it appears in the left rail → open a file → fixable spots are **highlighted inline** (squiggle + gutter dot + sparkle-lightbulb) → a **right-hand suggestions panel** shows the matching fix card → **Apply** gates an inline red/green diff → live preview re-renders.

**Layout (left→right) — Codex 3-pane shell:**
1. **Activity rail** ~48px: Files / Search / Risk-scan / Suggestions / Run.
2. **Project + file tree** ~240px, collapsible (`Cmd/Ctrl+B`). Codex switcher model: one window, "Add project" rows, **Working-copy vs Sandbox-copy** choice at add-time so edits stay isolated until applied. Files carry a **risk badge** (count of fixable spots).
3. **Editor** (center, flex) — the highlight surface; diffs render **here**, not in the panel.
4. **Suggestions side panel** ~360px, right, **resizable (280–520px) + collapsible** (`Cmd/Ctrl+Opt+B`) — learn from the Replit backlash: never force/non-dismissable.
5. **Live preview**, dockable right-of-suggestions OR bottom (toggle). Bottom log/terminal drawer toggles `Cmd/Ctrl+J`.

**The "directly-fixable spot" (the whole product) — VS Code grammar:**
- Each finding = **colored squiggle** under the exact span + **same-color gutter dot** + **sparkle-lightbulb** on the line. Blue lightbulb = one-click auto-fix available.
- **Dimension color tokens** (drive squiggle, gutter dot, AND panel chip — one shared token): prompt-injection `#E5484D` red · excessive-agency `#F5A623` amber · PII-egress `#8E4EC6` purple · other `#0091FF` blue.
- **Hover the spot** → mini-popover: dimension name + one-line "why risky."
- **Two-way bind (one shared `selectedFindingId`):** click a spot → editor scrolls/flashes the span AND its panel card expands; click a card → editor scrolls + flashes its span.

**Suggestions panel (per card):**
- Header: dimension chip + severity + `file:line`.
- Body: plain-English problem, then the **proposed fix as a red/green diff hunk** (Cursor style: red = remove, green = add; per-hunk accept).
- Footer: **Apply** (writes to source — *gated, never auto-apply*) · **Dismiss** · **Explain** · **Before/After toggle** (v0).
- Panel top: dimension filter tabs + **"Apply all safe fixes (N)"** bulk button (blue auto-fix idiom).
- **Metadata block pinned to bottom of the detail** (Raycast structure): ArmorIQ verdict label · Phoenix trace link · severity tag · "auto-fixable: yes/no."

**Apply flow (the gate):** click lightbulb / Apply → inline diff appears → `Tab`/Apply commits a hunk, `Esc`/Dismiss rejects; `Cmd/Ctrl+→` accepts one word; `Cmd/Ctrl+Enter` = accept all, `Cmd/Ctrl+Backspace` = reject all. **Pending edits show as a distinct tint until committed**; gutter bar marks committed changes; **live preview re-renders on Apply** so the fix visibly lands. **NEVER auto-apply** — the #1 Cursor/Replit complaint.

**HONEST feasibility note (Mode 2):** This is the *strong* surface — you own the source, so fixes are real inline patches gated by Apply. But for the hackathon the **uploaded project + live in-browser editor is an emulation built on `app.html`** against the deterministic demo target (`examples/vulnerable-support-agent/*`), not a general-purpose IDE that compiles arbitrary uploads. The VS Code/Cursor *extension* is CUT (`CURRENT_STATE.md`); arbitrary-site & multi-language support are CUT. Build the **interaction** faithfully (highlight → panel → diff → Apply → preview) over the known demo findings; label the editor as a guided demo, not a universal editor. The fix content shown must trace to a real `risk_map.json` / `runs/**` finding — no invented patches.

---

## 2. Distilled design system ("screenshot-this-then-build")

### Which mature product we emulate, and why
- **Mode 2 shell + overall dark dev-tool feel → Linear + OpenAI Codex desktop app.** Linear gives the recede-chrome dark ladder, hairline list rows, and the Cmd-K spine; Codex gives the 3-pane project/editor/suggestions shell with independently-collapsible panes. We emulate them because VibeShield Mode 2 *is* a keyboard-first dev tool and must feel native to that audience.
- **Inline fixable-spots → Cursor + v0 Design Mode + VS Code.** Cursor's diff-hunk accept/reject, v0's hover-highlight↔panel binding, VS Code's squiggle+lightbulb are the idioms users already recognize for "a fix exists here."
- **Findings + remediation → Sentry + Vercel/Geist + Retool + axe + Burp.** Sentry's master-list→detail→sidebar and stacked-evidence order; Geist's animated status dot; Retool's sectioned remediation; axe's "Detected vs Needs review"; Burp's Severity×Confidence two-axis honesty.
- **Mode 1 popup → securityheaders.com + Lighthouse + Snyk.** A grade ring + collapsed accordions (2-second scannability), opportunities-vs-diagnostics tiering, and a Fixability filter rail.

**Screenshot-this-then-build instruction (do this FIRST every iteration where a screen is unclear):** open the reference, screenshot it, *measure the chrome* (sidebar width, row height, panel width, type sizes), then insert VibeShield's features into that skeleton — do **not** invent layout. Drive the live daemon surfaces with your browser/CUA runtime, screenshot Linear/Codex/Cursor/Sentry side-by-side, and match spacing before adding content.

### Color tokens (dark theme — Linear ladder)
- **Backgrounds (darkest→lifted):** canvas `#08090A` · surface-1 `#0F1011` · surface-2 `#141516` · surface-3 `#18191A` · popover/menu `#191A1B`. Sidebar/topbar are **dimmer than content** so the work "pops."
- **Borders (hairline — nearly invisible by design):** default `#23252A` · strong `#34343A`; in overlays prefer `rgba(255,255,255,0.04–0.08)`.
- **Text (ink):** primary `#F7F8F8` · muted `#D0D6E0` · subtle labels/meta `#8A8F98` · disabled `#62666D`.
- **Accent — ONE color, used sparingly:** primary `#5E6AD2` (hover `#828FFF`, focus `#5E69D1`). ONLY for CTA, focus rings, active nav, links, progress. Never decorative.
- **Semantic / severity (Sentry × Geist):** Critical/fatal **red** · Error/high **red-orange** · Warning/medium **amber** · Info/low **blue** · Passed/clean **gray**. Success `#27A644`.
- **Dimension tokens (Mode 2, shared by squiggle/gutter/chip):** prompt-injection `#E5484D` · excessive-agency `#F5A623` · PII-egress `#8E4EC6` · other `#0091FF`.
- **Status dot (Geist):** green=fixed/passed, red=open critical, amber=needs review, gray=ignored, blue=in-progress — **animate while scanning/fixing, static when terminal.** Highest-value scannability cue.

### Type & spacing
- Font stack: `"Inter", "SF Pro Display", -apple-system, system-ui`. Tight negative letter-spacing on large text.
- Sizes: page/view title 16–18px /500–600 (ls −0.05px) · section header 13px/500 muted sticky · **list-row text 13px/400 (the workhorse)** · sidebar/button 13–14px/500 · meta 12px/400 · mono (IDs/code) 13px/400. Body line-height ~1.5. No bold spam.
- Spacing on a **4px grid: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 96**. Buttons `8px×14px`, inputs `8px×12px`, rows pad `8px×12–16px`, sidebar items 8px horizontal.
- Radius: 4px chips · **6px rows/buttons/inputs (default)** · 8px cards/menus · 12px modals/command-menu · 9999px avatars/pills.
- Chrome metrics: sidebar ~220–260px (items 28–32px tall, 6px hover radius) · topbar ~48px (compact rounded tabs) · detail/suggestions pane 320–460px · **list rows flat, full-bleed, hairline-separated, ~36–40px, hover lift `rgba(255,255,255,0.03)` reveals trailing actions, selected adds 2px accent left-border.**

### Signature interactions (the DNA — build these)
- **Command menu `Cmd/Ctrl+K` is the spine** — build it first. Centered ~600px modal, `#191A1B`, 12px radius, fuzzy grouped results, **right-aligned shortcut chips**, full arrow/`Enter` nav. Every clickable action is also a palette command with its hotkey shown.
- **Two-tier interaction:** list row = navigate (`Enter` = primary action); `Cmd/Ctrl+K` on a selected row = **Action Panel** of all fixes/actions. Don't cram buttons into rows.
- **Keyboard map to ship:** palette `Cmd+K`(/`Cmd+Shift+P`) · Quick Fix `Cmd+.` · accept hunk `Tab` / dismiss `Esc` · accept-all `Cmd+Enter` / reject-all `Cmd+Backspace` · toggle rail/panel/terminal `Cmd+B` / `Cmd+Opt+B` / `Cmd+J` · content-aware search `Cmd+G` · prev/next project `Cmd+Shift+[ ]` · new `Cmd+N` · list nav `↑/↓` + `Ctrl+P/N` · shortcuts `Cmd+/` · settings `Cmd+,`.
- **Optimistic, fast motion** (120–160ms), inline quick-create, sticky/collapsible grouped section headers with count badges, **focus rings not borders**.

### Zoom-safe rules (HARD requirement, 80–150%)
- **Type & spacing in `rem`; fluidity via `clamp()`; reflow via container queries — never `vw/vh` for type/spacing** (they ignore zoom and overflow at 150%; `vw` only allowed as the bounded middle term of a `clamp()`).
- **Never `html{font-size:Npx}`** and never hard-pin a component font-size in px (it cancels zoom + OS a11y scaling). Add `-webkit-text-size-adjust:100%`.
- **Reflow with `@container`, not `@media`** — the extension popup and resizable panels resize independently of the viewport.
- **Caps in `rem`/`ch`/`%`, never px:** `max-width:72ch` not `720px`; grids use `grid-template-columns: repeat(auto-fit, minmax(min(100%,16rem),1fr))` (the single most important anti-overflow trick — a card never demands more than its container).
- **Clamp every popover / lightbulb into the viewport** (VS Code off-screen bug); reserve gutter space; never position a fix-popover purely relative to a possibly-row-0 line.
- **Tap targets ≥ `2.75rem`**, `gap` not margins, `overflow-wrap:anywhere` on any node holding an attack string / tool name / URL / PII value (those blow out rows at zoom). `*{box-sizing:border-box}`; `img,svg,canvas,video{max-width:100%;height:auto}`.
- **Token starter for `ui-next/styles.css`** (your shared stylesheet; propose linking it from the live surfaces via handoff): root stays 16px; 8 `--fs-*` clamp tokens (body `--fs-base: clamp(0.95rem, 0.90rem + 0.30vw, 1.06rem)`); `--sp-1..8` (0.25rem→4rem); radii in rem; `--control-h:2.75rem`; `--measure:72ch`; `--side-panel: clamp(17rem,24vw,26rem)`; `--shell-max:90rem`; `--gutter: clamp(1rem,3vw,3rem)`.

---

## 3. Sponsor-API integration map (real vs honest-local fallback)

Each sponsor is a **seam**: a thin adapter wired to the existing core, gated so the auditor refuses "integrated" without a real artifact. New files only — **core untouched**. Each adapter exports `isLive(): boolean` (env-var check) + `run(...)` returning the real artifact or the labeled-local one.

| Sponsor | Mode 1 (extension / `demo.html`) | Mode 2 (editor / `app.html`) | Real-SDK trigger | Honest local fallback (self-labeled) |
|---|---|---|---|---|
| **ArmorIQ** (guard) | Each scanned dimension run through the guard; pill shows **BLOCK/HOLD/ALLOW** per attack | Live runtime guard behind the editor; inline highlights map to guard verdicts; suggestion = the guard rule to add | `ARMORIQ_API_KEY` set → real SDK | `src/guard.ts` = ArmorIQ-compatible signed-plan allowlist + structural PII/threshold checks (already real engineering, runs offline) |
| **Arize Phoenix** (traces/evals) | BEFORE→AFTER loop emits OpenInference spans + an experiment (5 FAIL → 0 FAIL) openable in Phoenix | Each edit re-runs the eval; trace/eval delta in side panel | `PHOENIX_COLLECTOR_ENDPOINT` (e.g. `http://localhost:6006`) → OTLP export to `${endpoint}/v1/traces` | `src/experiment.ts` writes a local OpenInference experiment to `runs/**`; report links it, labeled local |
| **Anthropic** (real agent) | Optionally replaces the deterministic stand-in so the audited agent is a real Claude under attack | Same model drives the editor's "live agent under test"; its tool-calls are what the guard gates | `ANTHROPIC_API_KEY` set → Claude Agent SDK in the harness | `examples/vulnerable-support-agent/*` deterministic tool-calling sim |
| **Deepgram** (voice) | "Say a scan direction" → pick one of the 3 choices by voice | Voice-dictate a fix instruction / accept a suggestion hands-free | `DEEPGRAM_API_KEY` set → `@deepgram/sdk` live streaming, `model=nova-3` (wss://api.deepgram.com) | Browser Web Speech API or typed transcript stub; report labels voice as local |

**Wiring points:** build the **client** wiring in `ui-next/sponsors.js`. The server adapters `src/integrations/{armoriq,phoenix,anthropic,deepgram}.ts` are under CORE `src/` — **propose them via handoff for Claude to create; do not write them yourself.** **The auditor (`src/auditor.ts`) reads the artifact to decide "live" vs "local" — never hardcode "integrated."** Env for full live demo: `ARMORIQ_API_KEY`, `PHOENIX_COLLECTOR_ENDPOINT=http://localhost:6006`, `ANTHROPIC_API_KEY`, `DEEPGRAM_API_KEY`.

---

## 4. Acceptance criteria

A UI iteration is **done** only when ALL hold:

**Visual fidelity**
- [ ] Mode 2 matches the Linear/Codex 3-pane shell (rail + tree + editor + resizable suggestions panel + dockable preview), all panes independently collapsible with the stated shortcuts.
- [ ] Mode 1 matches the securityheaders/Lighthouse pattern (grade ring + collapsed dimension accordions) and renders results in a **side panel**, not the popup.
- [ ] `Cmd/Ctrl+K` command menu exists and is the primary way to reach every action, each with a right-aligned shortcut chip.
- [ ] Fixable-spot triad (squiggle + gutter dot + sparkle-lightbulb), dimension-color-coded, with working two-way bind (`selectedFindingId`).
- [ ] Every finding shows **Severity** + (Mode 1) **Confidence** chips; remediation is sectioned (Diagnosis → Fix steps → Verify) with numbered steps, copyable snippets, done-checkboxes.

**Zoom safety (the gate that catches the most bugs)**
- [ ] Drive `127.0.0.1:7878/`, `/demo`, `/judge` at zoom `[0.8, 0.9, 1.0, 1.25, 1.5]`; assert `document.scrollingElement.scrollWidth ≤ clientWidth + 1` (no horizontal scrollbar) at every step, with panels both open AND collapsed. Screenshot each into the handoff.
- [ ] No `vw/vh` for type/spacing, no px font-size, no `@media` for panel reflow, no px max-widths (grep the CSS to confirm).

**Continuous self-test (CODEX_OWNERSHIP "continuously test")**
- [ ] Each iteration: **do NOT start the VibeShield daemon** (its `npm`/`tsx` commands overwrite live demo artifacts). Serve and drive **your own `ui-next/` prototype** with your browser/CUA runtime, click through the full Mode 1 (3-choice → findings → fix) and Mode 2 (highlight → panel → Apply diff → preview re-renders) flows, capture screenshots, and assert no console errors and no UI breakage. For real data, read `GET /api/state` read-only **only if the daemon is already up**, else label **MOCK**. Report what you tested + the screenshots.

**Data integrity**
- [ ] Every displayed number/verdict/trace links to a real artifact (`/api/state`, `risk_map.json`, `runs/**`, `report.json`, `verify_results.json`). `demo_ready` stays **true** and `report_audit_pass` stays **true** after your changes.

---

## 5. Scope — IN / OUT

**IN scope (yours to build):**
- `ui-next/styles.css` (the token + layout system above), `ui-next/sponsors.js`, and mode-specific UI assets under `ui-next/` / `extension/` / `desktop/` — the Mode-1 and Mode-2 experiences as **standalone prototypes that read the live daemon's `/api/state` read-only** (you never start or mutate it).
- Sponsor adapters `src/integrations/<sponsor>.ts` are CORE — **propose them via handoff (diff + rationale) for Claude to create**; you build only the client-side `ui-next/sponsors.js`.
- Command menu, keyboard map, inline fixable-spot affordances, suggestions panel, remediation panels, zoom-safe layout, continuous UI self-tests + screenshots.
- Polishing the Shield Pill as a **new `ui-next/` companion file** (never editing `demo.html`) and building shared CSS in `ui-next/styles.css` (your re-scoped lane per `CODEX_OWNERSHIP.md`).

**OUT of scope (do NOT do):**
- **Editing CORE** (`src/guard.ts`, `src/daemon.ts`, `src/harness.ts`, `src/evals.ts`, `src/run.ts`, `src/scan.ts`, `src/verify.ts`, `src/report.ts`, `src/experiment.ts`, `src/auditor.ts`, `examples/**`, and `web/app.html` / `web/demo.html` / `web/judge.html`). A needed core change → **proposal diff + rationale in your handoff report**, for Claude to apply.
- **CUT for the hackathon** (do not attempt, do not claim shipped): real Chrome-extension MV3 packaging, real VS Code/Cursor extension, Browserbase, arbitrary-site / multi-language support, multi-tenant/auth/billing, 5 of 6 live agents, definitive legal compliance, cross-surface <2s daemon sync.
- Changing the guard/daemon/schema from a second place — they have exactly one owner.

---

## 6. Honesty rule (enforced in code — non-negotiable)

**No fabricated metric, trace, scan, block, or integration — ever.** The report auditor (`src/auditor.ts`, unit-tested) **fails the report** if any number isn't backed by an artifact, a critical finding lacks reproduced evidence, a legal claim is absolute, or a sponsor integration is claimed without proof — and a failed audit **flips `demo_ready` to false** via `src/verify.ts`. Therefore:
- **Mock/placeholder data must be visibly labeled as mock** in the UI (e.g. a "sample" / "local fallback" tag). Never style mock data to look confirmed.
- **A sponsor never shows "integrated" without a real artifact** — when its env var is absent, render the honest-local-fallback state and say so.
- **Mode 1 confidence labels are mandatory** (Confirmed/Likely/Possible) — a black-box guess is never shown as a fact; PII egress is "inferred" unless a body was actually captured.
- **Mode 2 fixes trace to real findings** — no invented patches; "auto-fixable: yes/no" reflects the real artifact.
- If data doesn't exist yet, show an honest empty/`TODO` state — do **not** fill it with a plausible-looking number.

**The product's credibility is the honesty layer. When a choice trades polish for truthfulness, choose truthfulness.**
