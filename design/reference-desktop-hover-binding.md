# Desktop Hover Binding Reference Study

## Sources Captured
- `design/reference/desktop-hover-binding/vscode-editing.png`
- `design/reference/desktop-hover-binding/cursor-home.png`
- `design/reference/desktop-hover-binding/linear-changelog.png`

## Moves To Emulate
- VS Code: diagnostics are attached to exact editor rows with a gutter marker, underline, and hover detail.
- Cursor: the editor span and side explanation feel like one object, not two unrelated panels.
- Linear: selected rows are quiet, dense, and full-width; the active item uses a subtle accent and does not add button clutter.

## VibeShield Mapping
- This prototype has one shared `selectedFindingId`.
- Hovering a mock editor span opens a mini-popover clamped into the viewport.
- Clicking an editor spot expands the matching suggestion card; clicking a suggestion card flashes the matching editor span.
- Real values come from `/api/state`. Line spans and patch snippets stay visibly labeled `MOCK TODO`.
