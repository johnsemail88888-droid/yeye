# UI/UX Handoff Log

## 2026-06-21T05:23:17-07:00 - Extension consent gates

- Branch: `codex/uiux-extension-consent-gates`
- Loop sources read: `CODEX_UIUX_LOOP.md` and referenced `CODEX_UIUX_MISSION.md`
- Increment: added a standalone Mode 1 Chrome-extension-style scan picker with explicit consent gates for Active Probe and Deep Scan. Quick Scan can run immediately; Active Probe and Deep Scan stay disabled until their specific acknowledgement checkboxes are checked. The scan detail panel lists permission expectations before the run, and the results side panel opens only after a valid scan.
- Product direction advanced: Mode 1 now communicates the difference between passive checks, typed active probes, and debugger-backed deep scans before the user starts. This makes the "point at a live site, choose scan, see risks, follow fixes" flow safer and more trustworthy without touching the live app.
- Data source: `MOCK` UI copy and findings only. Future production wiring should read daemon state through read-only `GET http://127.0.0.1:7878/api/state` when that service is already running.

Files changed:

- `extension/index.html`
- `extension/app.js`
- `extension/favicon.svg`
- `ui-next/styles.css`
- `design/reference-extension-consent-gates.md`
- `design/reference/extension-consent-gates/chrome-web-store.png`
- `design/reference/extension-consent-gates/chrome-extensions.png`
- `design/reference/extension-consent-gates/axe-devtools.png`
- `design/reference/extension-consent-gates/pagespeed.png`
- `design/shots/extension-consent-gates/080.png`
- `design/shots/extension-consent-gates/100.png`
- `design/shots/extension-consent-gates/125.png`
- `design/shots/extension-consent-gates/150.png`
- `desktop/.gitkeep`
- `docs/handoff-uiux.md`

Verification:

- Used a temporary local static server that only exposed `extension/` and `ui-next/`; no daemon was started and no project `npm`, `tsx`, or `demo:*` commands were run.
- Interaction checks passed: `initialPanelHidden=true`, `activeDisabledBefore=true`, `deepDisabledBefore=true`, `activeDisabledAfter=false`, `deepDisabledAfter=false`.
- Zoom-equivalent viewport checks passed:
  - 80 percent: width 1800, `overflowX=false`, `buttons=7`, `minHeightOk=true`, `textOverflow=0`, `checked=2`, `progressVisible=true`, `panelVisible=true`
  - 100 percent: width 1440, `overflowX=false`, `buttons=7`, `minHeightOk=true`, `textOverflow=0`, `checked=2`, `progressVisible=true`, `panelVisible=true`
  - 125 percent: width 1152, `overflowX=false`, `buttons=7`, `minHeightOk=true`, `textOverflow=0`, `checked=2`, `progressVisible=true`, `panelVisible=true`
  - 150 percent: width 960, `overflowX=false`, `buttons=7`, `minHeightOk=true`, `textOverflow=0`, `checked=2`, `progressVisible=true`, `panelVisible=true`
- Visual screenshots reviewed:
  - `design/shots/extension-consent-gates/100.png`
  - `design/shots/extension-consent-gates/150.png`
  - `design/reference/extension-consent-gates/chrome-extensions.png`

Suggested diff for live surfaces:

- Add the same acknowledgement gates before any Active Probe run that can type into the inspected page.
- Add a debugger-warning acknowledgement before any Deep Scan path that relies on Chrome debugging APIs.
- Keep passive Quick Scan one click, but show the scan's permission footprint in the detail panel before execution.
- Map real confidence and risk dimensions from daemon state; do not ship the current `MOCK` findings as factual results.

Next small increment:

- Add a compact scan history strip that records the last selected scan type, acknowledgement state, and latest `MOCK` result so the user can rerun or compare without guessing what happened last.
