# Extension Command Palette Reference Study

Branch: `codex/uiux-extension-command-palette`

Reference captures:

- `design/reference/extension-command-palette/raycast-store-command-entry.png`
  - Source: https://www.raycast.com/store
  - Useful move: command/search affordance is a first-class entry point with visible shortcut hints and a compact action surface.
- `design/reference/extension-command-palette/linear-changelog-search.png`
  - Source: https://linear.app/changelog
  - Useful move: dark chrome, restrained search controls, and quiet metadata make the work content remain primary.

Applied to VibeShield:

- The pinned Mode 1 side panel has a visible `Ctrl K` command entry and supports the same shortcut globally.
- The palette groups side-panel actions by Scan, Evidence, Export, and View.
- Rerun, highlight, copy evidence, export, and fix-now filtering are reachable without adding row-level button clutter.
- Every action is local-only in the prototype. Rerun prepares state but does not call any daemon mutation route.
