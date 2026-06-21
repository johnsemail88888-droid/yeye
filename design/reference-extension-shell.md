# Reference Study - Extension Shell

## Sources to emulate
- axe DevTools: issue rows pair severity with affected element evidence and a direct highlight action.
- Burp Suite: severity and confidence are separate labels, which fits live-site black-box honesty.
- securityheaders.com and Lighthouse: one fast top-level grade/status summary before detailed remediation.
- Snyk: fixability filters help the user find the next actionable repair instead of staring at a flat list.

## Captures
- `design/reference/extension-shell/securityheaders.png`
- `design/reference/extension-shell/burp.png`
- `design/reference/extension-shell/snyk.png`

## Moves copied into this increment
- A popup starts with three explicit scan direction cards before any scan action.
- Results live in a pinned side panel, not a small popup.
- The panel leads with a grade ring, scan mode, target origin, and progress strip.
- Findings are grouped by dimension accordions and every row has severity plus confidence chips.
- "Highlight on page" is a first-class action because Mode 1 is an outside-in browser audit.
- Fix steps are live-site / config guidance, not source edits.

## Honesty notes
- Every grade, count, finding, timestamp, and target in this prototype is labeled `MOCK`.
- PII egress confidence is `Possible` because a live extension cannot prove body contents without explicit Deep Scan/debugger permission.
- The prototype does not claim Chrome-extension packaging is shipped.
