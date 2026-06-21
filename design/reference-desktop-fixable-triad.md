# Reference Study - Desktop Fixable Triad

## Sources to emulate
- Codex desktop: compact activity rail, project/file tree, editor center, and right-side suggestion surface.
- Cursor: inline red/green diff hunk gated behind an explicit Apply action.
- VS Code: squiggle, gutter marker, and lightbulb as the visual grammar for fixable code spans.
- Raycast: command menu as the spine, with right-aligned shortcut chips and list-detail behavior.

## Captures
- `design/reference/desktop-fixable-triad/cursor.png`
- `design/reference/desktop-fixable-triad/vscode.png`
- `design/reference/desktop-fixable-triad/raycast.png`

## Moves copied into this increment
- Four-zone desktop shell: activity rail, project tree, editor, suggestions, plus a dockable preview pane.
- Fixable-spot triad on two sample lines: dimension-colored squiggle, matching gutter dot, and lightbulb affordance.
- Two-way bind via shared `selectedFindingId`: clicking editor lines selects the matching suggestion, clicking cards selects the matching line.
- Apply is gated: it reveals an inline diff preview and updates preview state, but never writes source.
- Metadata stays pinned at the bottom of the suggestion pane and labels sponsor state as local fallback / MOCK.

## Honesty notes
- This prototype is data-free and every finding/diff/verdict is `MOCK`.
- The editor is a guided demo, not a universal uploaded-project IDE.
- Real fix content must later trace to `risk_map.json`, `runs/**`, or read-only `GET /api/state`.
