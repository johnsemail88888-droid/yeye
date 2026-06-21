# Extension Export Strip Reference Study

Branch: `codex/uiux-extension-export-strip`

Reference captures:

- `design/reference/extension-export-strip/arize-phoenix-docs.png`
  - Source: https://docs.arize.com/phoenix
  - Useful move: Phoenix positions traces, evaluations, datasets, and experiments as separate but related destinations. The prototype mirrors that by showing an explicit payload summary before any send action.
- `design/reference/extension-export-strip/sentry-product-issues.png`
  - Source: https://docs.sentry.io/product/issues/
  - Useful move: Sentry keeps issue metadata, filters, and copy/export actions close to the issue context instead of hiding them in a separate settings page.
- `design/reference/extension-export-strip/sentry-issue-details.png`
  - Source attempted: https://sentry.io/features/issue-details/
  - Result: 404 page. Kept as an access note, not used as a layout reference.

Applied to VibeShield:

- The export strip sits inside the pinned Mode 1 side panel, directly below the scan summary.
- The primary action is local export when Phoenix is not proven live.
- The disabled Phoenix send button is deliberate honesty: `PHOENIX_COLLECTOR_ENDPOINT` was absent this run.
- The payload preview lists real run IDs and artifact groups from read-only `GET /api/state`; it does not embed trace bodies or PII.
