# Claude Code Integration Prompt — 耶耶（Yeye）

Implement the Yeye mascot using the provided `yeye_mascot_pack` assets.

## Naming

- Keep the product name `VibeShield` for this hackathon.
- Rename the browser mascot, floating assistant, and friendly security guide to `耶耶` in Chinese and `Yeye` in English.
- Replace user-facing `Shield Pill`, `Mascot`, or generic assistant labels with `Yeye`, but do not rename security protocols, package names, APIs, or evidence schemas.
- Preferred tagline: `VibeShield with Yeye`.

## Required behavior

### Idle
- Yeye stays near a viewport edge and occasionally walks a short distance or rests.
- Never cross the central content area repeatedly.
- Never cover the primary CTA, finding cards, code diff, or judge controls.
- Pause movement while the user is typing, reading a modal, or viewing a trace.

### Scan
- Start only after a real scan event.
- Move to the real selected DOM feature or current scan target.
- Alternate `yeye_sniff_1` and `yeye_sniff_2` while mapping.
- Use `yeye_scan` while a detector is actually running.
- Show real progress such as `2 / 5 tests`, not timer-generated fake progress.

### Finding
- Use `yeye_alert` only when a real finding artifact exists.
- Clicking Yeye should open the matching Finding/Evidence view.
- Bubble copy should be plain language, e.g. `我闻到一个没有审批边界的高风险工具调用。`

### Remediation and verification
- Use `yeye_protected` only after the guard is truly installed and the protected test has returned BLOCKED, REDACTED, or NEEDS_APPROVAL.
- If verification fails, return to alert rather than showing success.

### Accessibility and performance
- Use GPU-friendly transform animation; do not animate layout-heavy properties during production integration.
- Preload SVG assets.
- Respect `prefers-reduced-motion` and provide a static status-chip mode.
- Mascot container should be `pointer-events:none`; only the explicit button/hit area may receive input.
- Include accessible label and status text; important findings must also appear outside animation.
- Cap rendered mascot size around 96–144 CSS pixels on desktop and 72–112 on mobile.

### Draggable position
- The user may drag Yeye to a different edge.
- Snap to the nearest safe edge after release.
- Persist position per domain/project.
- Provide `Hide Yeye` and `Reduce motion` controls.

## Real-event state mapping

- `idle` → `yeye_idle` / `yeye_walk_1` / `yeye_walk_2` / `yeye_rest`
- `scope_captured` → `yeye_sniff_1`
- `surface_mapping` → `yeye_sniff_2`
- `test_running` → `yeye_scan`
- `critical_finding_created` → `yeye_alert`
- `guard_installing` → `yeye_scan`
- `verification_passed` → `yeye_protected`
- `verification_failed` → `yeye_alert`

## Acceptance checks

1. Yeye responds to actual scan events, not a standalone canned timer.
2. Idle animation never blocks the demo path.
3. Finding click opens the correct `run_id / test_id / trace_id`.
4. Protected pose cannot appear without after-verification evidence.
5. Reduced-motion mode is functional.
6. Animation is smooth in Chrome and does not increase layout shift.
7. All previous core tests continue to pass.
8. Do not redesign the core demo or delay browser → trace → guard → retest work for mascot polish.

Use `demo.html`, `yeye.css`, and `yeye.js` only as an interaction reference. Integrate with the existing event bus and design system rather than copying the demo's fake scan timer.
