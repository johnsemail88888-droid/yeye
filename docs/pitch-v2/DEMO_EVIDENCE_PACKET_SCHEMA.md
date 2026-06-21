# Demo Evidence Packet Schema

Status: SPEC_ONLY
Last updated: 2026-06-21 07:04 PT

Schema file:

- `tests/pitch-spec/demo_evidence_packet.schema.json`
- `tests/pitch-spec/demo_evidence_packet.example.json`

Purpose:

The schema gives the integration owner a structured target for a future filled evidence packet. It does not fill the packet and does not create live evidence.

The example JSON is a placeholder only. It intentionally uses TODO values, NOT_CONFIGURED / ROADMAP labels, and false timing/signoff fields.

## What It Requires

- selected route: LIVE, RECORDED_REAL_RUN, LOCAL_FALLBACK, or ROADMAP_NOT_CONFIGURED
- decision owner, time, demo surface, visible source label, and fallback route
- project_id and run_id
- before, after, and verify artifact paths
- truth badge rows with evidence field and downgrade label
- exactly three timing rows
- capability downgrade rows
- presenter signoff fields

## Safe Defaults

The schema preserves conservative defaults:

- `three_minute_timing_pass` must remain false in the schema target until a reviewer intentionally changes the schema for measured timing.
- `any_live_badge_without_evidence` must be false.
- `any_do_not_claim_item_still_in_script` must be false.

## Reviewer Use

Use this schema only after the integration owner creates a filled JSON evidence packet in an allowed future location. This SPEC_ONLY branch does not create that filled packet.

Do not use schema validation to claim the demo is live. Passing a schema only means the packet is structurally complete; the artifact paths still need human review.

Do not use the example packet as evidence. It is a safe starting shape for the integration owner to replace with real values.
