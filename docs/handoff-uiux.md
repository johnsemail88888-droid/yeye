# UI/UX Handoff Log

## 2026-06-21T03:54:50-07:00 - codex/uiux-desktop-patch-preview - read-only patch preview drawer
- **What changed:** Added a standalone Mode 2 desktop prototype where a selected MOCK finding opens a read-only patch preview drawer. The drawer shows red/green before-after hunks, a copy action, a close action, and a reject action. The command menu can also open the selected preview. During validation the drawer initially blocked finding selection, so it now starts hidden and opens only through explicit preview actions.
- **Owned paths touched:** ui-next/styles.css; desktop/index.html; desktop/app.js; desktop/favicon.svg; extension/.gitkeep; design/reference-desktop-patch-preview.md; design/reference/desktop-patch-preview/github-diff.png; design/reference/desktop-patch-preview/sentry.png; design/reference/desktop-patch-preview/vercel.png; design/shots/desktop-patch-preview/080.png; design/shots/desktop-patch-preview/100.png; design/shots/desktop-patch-preview/125.png; design/shots/desktop-patch-preview/150.png; docs/handoff-uiux.md.
- **Data source:** MOCK/TODO only. Daemon state was not read because this increment is a data-free interaction prototype; every finding, severity, file path, and diff is visibly labeled MOCK, with a code comment noting the future read-only GET /api/state binding.
- **How verified:** Used a temporary Playwright HTTP server that mapped only desktop/ and ui-next/. Tested selecting a finding, opening the patch drawer, copying the MOCK diff, rejecting the selected patch, opening the command menu with Ctrl+K, and opening the preview from the command menu. Zoom-equivalent checks passed at 80/100/125/150: no page-level horizontal overflow, visible buttons kept at least 2.75rem min height, no chip/tab/button text overflow, drawer remained visible, and no console/page/request errors. Manually inspected the GitHub diff reference plus 100 and 150 screenshots.
- **Screenshots:** design/shots/desktop-patch-preview/{080,100,125,150}.png
- **Proposal for live surfaces (if any):**
```diff
+ Add a read-only patch preview drawer to the Mode 2 desktop review surface.
+ Drawer state:
+   selectedFindingId
+   previewOpen
+   rejectedFindingIds
+   copiedDiffId
+
+ For each source-backed finding:
+   render proposedDiff as red/green hunks in the drawer
+   keep the drawer hidden until Preview patch is clicked
+   expose Copy diff and Reject selected in both the drawer and Cmd/Ctrl+K
+   never write source until a later explicit Apply hunk gate is accepted
+   preserve MOCK labels unless the diff is backed by risk_map.json, runs/**, or GET /api/state
```
- **Blockers / open items:** None. One validation issue was found and fixed: the drawer originally opened by default and intercepted finding clicks.
- **Next suggested increment:** Add a Mode 1 extension-style results side panel with collapsed Prompt Injection, Excessive Agency, and PII Egress accordions plus severity/confidence chips, all MOCK-labeled.
