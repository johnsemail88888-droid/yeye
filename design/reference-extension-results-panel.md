# Extension Results Panel Reference Notes

Topic: codex/uiux-extension-results-panel

Reference products reviewed:

- Mozilla Observatory: grade-first security summary with test breakdowns.
- Lighthouse / PageSpeed: top-level score paired with opportunity-style rows.
- Snyk: fixability/type filters that answer what to do first.
- Sentry: compact issue detail hierarchy and metadata near the action.

Applied to this increment:

- Keep the Mode 1 side panel pinned and scannable, with the grade visible above findings.
- Render dimensions as collapsed accordions by default, with one open active section to show the row anatomy.
- Put severity and confidence chips side by side so black-box evidence is never presented as certainty.
- Include a fixability rail for "All", "Fix now", and "Needs review" without changing the underlying mock data.
- Use rem, clamp, and container queries so the panel reflows at 80/100/125/150 zoom equivalents.

Reference capture files:

- design/reference/extension-results-panel/mozilla-observatory.png
- design/reference/extension-results-panel/pagespeed.png
- design/reference/extension-results-panel/snyk.png
- design/reference/extension-results-panel/sentry.png
