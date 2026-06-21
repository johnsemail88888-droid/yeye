# Extension Export Packet Reference Notes

Branch: codex/uiux-extension-export-packet-1002

Reference captures:
- `design/reference/extension-export-packet-1002/sentry-issues.png`
- `design/reference/extension-export-packet-1002/github-security.png`
- `design/reference/extension-export-packet-1002/vercel-observability.png`

Emulation decisions:
- Sentry Issues: capture landed on a Sentry 404 page, so it is kept only as a blocked-reference artifact and was not used as proof of issue-list anatomy.
- GitHub Security: keep evidence references visible beside the issue payload so reviewers know what backs the packet.
- Vercel Observability: put export destination and status in a quiet right-side panel with clear fallback labeling.

Honesty notes:
- Run ids, finding counts, severities, finding details, and evidence file path patterns come from read-only `GET /api/state`.
- Phoenix export, browser confidence, DOM selectors, request URLs, and canary traces are labeled TODO/local fallback because they are not exposed by `/api/state`.
