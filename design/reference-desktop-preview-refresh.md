# Desktop Preview Refresh Reference Notes

Branch: codex/uiux-desktop-preview-refresh

Reference captures:
- `design/reference/desktop-preview-refresh/vercel-home.png`
- `design/reference/desktop-preview-refresh/linear-changelog.png`
- `design/reference/desktop-preview-refresh/github-code-review.png`

Emulation decisions:
- Vercel: compact status language and immediate feedback after an action. The preview dock uses a small status chip that changes after accepting a hunk.
- Linear: quiet rows, hairline separators, dimmer chrome around the work. The file tree and suggestions list stay visually secondary to the editor.
- GitHub code review: before/after review semantics. The diff card keeps per-hunk accept and reject controls while the preview lane shows the before state beside a local after state.

Honesty notes:
- Finding IDs, severities, categories, and details come from read-only `GET /api/state`.
- The source span, patch hunk, and rendered preview are labeled `MOCK TODO` because the state endpoint does not expose those artifacts.
