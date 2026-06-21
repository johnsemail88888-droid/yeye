# Extension Scan Picker Reference Notes

Topic: codex/uiux-extension-scan-picker

Reference products reviewed:

- PageSpeed Insights: one clear input/control area that starts the scan.
- Mozilla Observatory: scan start form paired with grade-oriented security results.
- Snyk: action-first cards that explain what will be checked before the user runs it.
- axe DevTools: browser-extension framing and issue-review workflow.

Applied to this increment:

- The extension starts as a compact popup with three scan direction cards.
- Each card states what the prototype will do before it runs and labels the timing/permission text as MOCK.
- Running a scan shows a local progress strip before opening the pinned results side panel.
- The side panel keeps severity and confidence chips visible and never calls daemon or sponsor endpoints.
- Layout uses rem, clamp, and container queries so the popup/panel pair survives 80/100/125/150 zoom equivalents.

Reference capture files:

- design/reference/extension-scan-picker/pagespeed.png
- design/reference/extension-scan-picker/mozilla-observatory.png
- design/reference/extension-scan-picker/snyk.png
- design/reference/extension-scan-picker/axe-devtools.png
