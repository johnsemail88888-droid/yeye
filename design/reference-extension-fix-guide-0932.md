# Extension Fix Guide Reference Notes

Branch: codex/uiux-extension-fix-guide-0932

Reference captures:
- `design/reference/extension-fix-guide-0932/securityheaders.png`
- `design/reference/extension-fix-guide-0932/snyk-advisor.png`
- `design/reference/extension-fix-guide-0932/portswigger-burp.png`

Emulation decisions:
- securityheaders.com: capture landed on a Cloudflare verification page, so it was kept only as a blocked-reference artifact, not used as proof of grade anatomy.
- Snyk Advisor: keep a fixability rail so the user can narrow to the dimension they can act on now.
- Burp Suite: pair severity with a separate confidence surface. The confidence value is labeled `TODO` because `/api/state` does not expose browser-observed confidence.

Honesty notes:
- Finding count, severity count, categories, and details come from read-only `GET /api/state`.
- Browser-only evidence such as DOM selector, request URL, canary trace, confidence, and overall grade remains visibly labeled `TODO`.
