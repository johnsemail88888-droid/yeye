# UI/UX Handoff Log

## 2026-06-21T04:53:03-07:00 - codex/uiux-extension-scan-picker - Mode 1 scan picker and progress flow
- **What changed:** Added a standalone Mode 1 extension-emulation flow that starts with a compact VibeShield popup containing Quick Scan, Active Probe, and Deep Scan cards. Selecting a card runs a local MOCK progress strip and then opens the pinned results side panel with the selected mode, grade, confidence labels, and sample findings. The side panel starts hidden, opens only after a scan choice, and all panel actions show local MOCK status rather than calling daemon or sponsor endpoints.
- **Owned paths touched:** ui-next/styles.css; extension/index.html; extension/app.js; extension/favicon.svg; desktop/.gitkeep; design/reference-extension-scan-picker.md; design/reference/extension-scan-picker/pagespeed.png; design/reference/extension-scan-picker/mozilla-observatory.png; design/reference/extension-scan-picker/snyk.png; design/reference/extension-scan-picker/axe-devtools.png; design/shots/extension-scan-picker/080.png; design/shots/extension-scan-picker/100.png; design/shots/extension-scan-picker/125.png; design/shots/extension-scan-picker/150.png; docs/handoff-uiux.md.
- **Data source:** MOCK/TODO only. Daemon state was not read because this increment is a data-free scan-flow prototype. Every scan estimate, mode, grade, finding, count, target origin, evidence string, and action result is visibly labeled MOCK, and extension/app.js includes a code comment for future read-only GET /api/state binding.
- **How verified:** Used a temporary Playwright HTTP server that mapped only extension/ and ui-next/. Verified the side panel starts hidden, clicked Quick Scan, Active Probe, and Deep Scan cards, waited for the MOCK progress strip, confirmed the side panel opens, expanded Prompt Injection and Excessive Agency, and triggered a panel action. Zoom-equivalent checks passed at 80/100/125/150: no page-level horizontal overflow, visible buttons kept accessible min height, no chip/pill/button text overflow, progress remained visible, and no console/page/request errors. Manually inspected the PageSpeed reference plus 100 and 150 screenshots.
- **Screenshots:** design/shots/extension-scan-picker/{080,100,125,150}.png
- **Proposal for live surfaces (if any):**
```diff
+ Add a Mode 1 scan-picker state model before the results side panel:
+   selectedScanMode: quick | active | deep
+   scanProgressSteps
+   scanConsentAcknowledged
+   sidePanelOpen
+
+ Popup behavior:
+   Quick Scan explains passive DOM/header/request-metadata review before running
+   Active Probe requires the literal consent line before typing benign canaries
+   Deep Scan explains debugger permission and Chrome banner before opening
+   progress strip is visible between card selection and side-panel results
+   results side panel opens only after a scan direction is chosen
+   all unbacked timing/count/finding fields remain MOCK/TODO until sourced from GET /api/state or runs/**
```
- **Blockers / open items:** None. A visual issue was caught and fixed before commit: the side-panel-open companion card no longer stretches to fill the column.
- **Next suggested increment:** Add Mode 1 scan consent and permission microstates: Active Probe consent checkbox, Deep Scan debugger warning confirmation, and disabled-run states until the required acknowledgement is complete.
