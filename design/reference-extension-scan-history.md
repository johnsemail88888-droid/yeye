# Extension Scan History Reference Study

Branch: `codex/uiux-extension-scan-history`

Reference captures:

- `design/reference/extension-scan-history/linear-changelog.png`
  - Source: https://linear.app/changelog
  - Useful move: a dark, quiet timeline where date/status metadata stays in a narrow rail and the primary item stays readable.
- `design/reference/extension-scan-history/raycast-store.png`
  - Source: https://www.raycast.com/store
  - Useful move: a compact centered search/action control with low-contrast chrome and visible keyboard affordance.
- `design/reference/extension-scan-history/raycast-extensions.png`
  - Source attempted: https://www.raycast.com/extensions
  - Result: 404 page. Kept only as an access note, not used as a layout reference.

Applied to VibeShield:

- The scan history strip uses flat, hairline-separated rows instead of cards inside cards.
- The current scan entry is the only emphasized row; placeholder history slots are visibly labeled `MOCK TODO`.
- Real counts come from `extension/state-summary.json`, which was derived from read-only `GET http://127.0.0.1:7878/api/state`.
- The right side panel keeps the Mode 1 grade-ring and accordion result model while the history row gives quick orientation before rerunning.
