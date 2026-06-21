# Desktop Project Intake Reference Notes

Branch: codex/uiux-desktop-project-intake-0947

Reference captures:
- `design/reference/desktop-project-intake-0947/linear-changelog.png`
- `design/reference/desktop-project-intake-0947/raycast-teams.png`
- `design/reference/desktop-project-intake-0947/vercel-dashboard.png`

Emulation decisions:
- Linear: dim navigation chrome, hairline list rows, and a quiet selected state in the project rail.
- Raycast: command-first project actions with visible shortcut chips and concise action rows.
- Vercel dashboard: project intake should move from source choice to active project row to next action, with the primary action kept compact.

Honesty notes:
- Counts and verify flags come from read-only `GET /api/state`.
- Import, clone, upload, file picker, and working-copy write behavior are labeled `MOCK TODO` because no such fields or mutation-safe APIs are exposed.
