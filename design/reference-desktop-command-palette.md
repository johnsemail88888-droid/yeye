# Desktop Command Palette Reference Study

## Sources Captured
- `design/reference/desktop-command-palette/raycast-home.png`
- `design/reference/desktop-command-palette/linear-changelog.png`
- `design/reference/desktop-command-palette/vercel-home.png`

## Moves To Emulate
- Raycast: command search is the primary surface, with one dominant input, compact results, and right-aligned shortcuts.
- Linear: quiet dark chrome, dense list rows, subtle borders, and work content brighter than navigation.
- Vercel: restrained status chips and compact source metadata.

## VibeShield Mapping
- Mode 2 uses a three-pane shell: activity rail, file tree, editor, and collapsible suggestions panel.
- `Cmd/Ctrl+K` exposes the five required editor actions: quick fix, accept hunk, reject hunk, toggle suggestions, and focus selected finding.
- Real data comes from read-only `/api/state` counts and finding fields. File spans and patch hunks are clearly labeled `MOCK TODO` because the endpoint does not expose those fields.
