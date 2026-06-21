# Desktop Apply Preview Reference Study

## Sources Captured
- `design/reference/desktop-apply-preview/vscode-refactoring.png`
- `design/reference/desktop-apply-preview/cursor-home.png`
- `design/reference/desktop-apply-preview/github-code-review.png`

## Moves To Emulate
- VS Code: code actions are explicit and keyboard-driven, with the edit staying close to the selected code.
- Cursor: an apply action previews an inline change before the user accepts it.
- GitHub review: red/green hunks make the proposed change easy to inspect before approval.

## VibeShield Mapping
- Selecting a real `/api/state` finding opens a pending hunk in the editor area.
- `Tab` accepts the pending hunk into local prototype state; `Esc` rejects it.
- The preview panel shows a local refresh status, but source writes and real patch text remain `MOCK TODO` until risk artifacts expose patch hunks.
