# Desktop Patch Preview Reference Notes

Topic: codex/uiux-desktop-patch-preview

Reference products reviewed:

- GitHub pull request diff: readable red/green hunks with stable monospace columns.
- Sentry issue view: issue detail as a focused action surface with metadata staying near the primary action.
- Vercel dashboard: restrained dark chrome, compact pills, and calm hierarchy for technical state.

Applied to this increment:

- The selected finding opens a focused patch preview drawer instead of scattering actions across the row.
- The diff is read-only and visibly marked MOCK, with separate copy and reject actions.
- The drawer is clamped inside the viewport and uses rem/container-query layout to stay safe at 80/100/125/150 zoom equivalents.
- The command menu exposes the same preview/copy actions so keyboard users can reach the drawer.

Reference capture files:

- design/reference/desktop-patch-preview/github-diff.png
- design/reference/desktop-patch-preview/sentry.png
- design/reference/desktop-patch-preview/vercel.png
