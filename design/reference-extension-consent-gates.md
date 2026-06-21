# Extension Consent Gates Reference Notes

Topic: codex/uiux-extension-consent-gates

Reference products reviewed:

- Chrome Web Store permissions copy: concise permission warnings before a browser extension can act.
- Chrome Extensions documentation: debugger and host permission language patterns.
- axe DevTools: extension-first review flow that keeps the user inside the browser context.
- PageSpeed Insights: simple scan start surface with one clear run action.

Applied to this increment:

- Quick Scan remains immediately runnable because it is passive.
- Active Probe adds an explicit consent checkbox before the run button enables.
- Deep Scan adds a debugger-banner acknowledgement before the run button enables.
- The detail panel mirrors the selected scan's permission scope so the disabled state explains why it is blocked.
- The side panel opens only after a valid run action and stays labeled MOCK throughout.

Reference capture files:

- design/reference/extension-consent-gates/chrome-web-store.png
- design/reference/extension-consent-gates/chrome-extensions.png
- design/reference/extension-consent-gates/axe-devtools.png
- design/reference/extension-consent-gates/pagespeed.png
