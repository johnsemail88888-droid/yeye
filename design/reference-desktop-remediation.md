# Desktop Remediation Reference Notes

Topic: codex/uiux-desktop-remediation

Reference products reviewed:

- Raycast: compact command surface, direct actions, tight spacing.
- Vercel: calm technical panel hierarchy and clear status chips.
- Retool: dense builder layout with editor context beside actionable panels.

Applied to this increment:

- Keep the remediation panel narrow and action-first, similar to command palettes and builder sidebars.
- Use compact chips for severity and confidence while marking every sample as MOCK.
- Split each suggestion into Diagnosis, Fix, and Verify sections so the user can copy the next safe action without losing context.
- Use rem-based spacing, container queries, and clamp-based layout values so browser zoom does not collapse the editor or side panel.

Reference capture files:

- design/reference/desktop-remediation/raycast.png
- design/reference/desktop-remediation/vercel.png
- design/reference/desktop-remediation/retool.png
