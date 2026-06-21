# Demo Evidence Packet Template

Status: SPEC_ONLY template
Last updated: 2026-06-21 04:34 PT

Purpose: one place for the integration owner or presenter to fill the evidence required before calling the pitch LIVE or RECORDED REAL RUN. Leave fields blank until real evidence exists. Do not invent values.

## Route Selection

| Field | Value |
| --- | --- |
| Selected route | TODO: LIVE / RECORDED REAL RUN / LOCAL FALLBACK / ROADMAP |
| Decision owner | TODO |
| Decision time | TODO |
| Demo surface | TODO: web/judge.html, web/demo.html, deployed app, recorded artifact, or local fallback |
| Source label shown to judge | TODO |
| Fallback route if primary fails | TODO |

## Evidence Identifiers

| Identifier | Value | Required for LIVE? | Notes |
| --- | --- | --- | --- |
| project_id | TODO | Yes | Use current endpoint or artifact value |
| run_id | TODO | Yes | Must be visible during demo |
| test_id | TODO | Preferred | Use artifact path when test_id is unavailable |
| trace_id | TODO | Preferred | Optional if artifact path is visible |
| before artifact path | TODO | Yes | Required for attack evidence |
| after artifact path | TODO | Yes | Required for protection proof |
| verify artifact path | TODO | Yes | Required for after-proof and benign utility |
| CI artifact or workflow path | `.github/workflows/vibeshield.yml` if shown read-only | No | Describe as hand-committed, not generated |

## Truth Badge Checklist

| Segment | Planned badge | Evidence field that justifies it | Downgrade if missing |
| --- | --- | --- | --- |
| App works normally | TODO | TODO | LOCAL FALLBACK |
| Feature selected | TODO | TODO | LOCAL FALLBACK |
| Live assessment | TODO | TODO | RECORDED REAL RUN or LOCAL FALLBACK |
| Critical finding | TODO | TODO | RECORDED REAL RUN |
| Trace/evidence chain | TODO | TODO | RECORDED REAL RUN |
| Apply protection | TODO | TODO | RECORDED REAL RUN |
| Same-test proof | TODO | TODO | RECORDED REAL RUN |
| Static readiness checklist | ROADMAP | docs/pitch-v2 specs | ROADMAP only |
| Deployment/CI | TODO | hand-committed workflow path | ROADMAP for generated CI |

## Timing Packet

Do not set `three_minute_timing_pass=true` unless all three rows are filled with measured values.

| Run | Source label | Start | Stop | Duration | Failure visible by 70s? | Fix starts by 95s? | After proof by 150s? | Pass? | Evidence path |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | TODO | TODO | TODO | TODO | TODO | TODO | TODO | false | TODO |
| 2 | TODO | TODO | TODO | TODO | TODO | TODO | TODO | false | TODO |
| 3 | TODO | TODO | TODO | TODO | TODO | TODO | TODO | false | TODO |

## Capability Downgrade Table

| Capability | Default label | Upgrade allowed only when | Current SPEC_ONLY position |
| --- | --- | --- | --- |
| Browser Shield Pill / real extension | ROADMAP | Integration owner provides implemented extension evidence | Do not call LIVE |
| `npx vibeshield install` | ROADMAP | Repo has real CLI bin and install flow | Do not show as working |
| Generated GitHub Action | ROADMAP | CLI or generator creates workflow | Existing workflow is hand-committed |
| Readiness checks 5-12 | ROADMAP | Scanner or runtime artifacts implement each check | Static checklist only |
| Legal/platform findings | ROADMAP/static review indicator | Product has evidence cards with source and limitation | Not legal advice |

## Presenter Signoff

Before pitch, fill:

- Route chosen:
- Evidence packet complete: yes/no
- Three rehearsals measured: yes/no
- Any LIVE badge without evidence: yes/no
- Any DO NOT CLAIM item still in script: yes/no
- Final safe close selected:

If any answer is unsafe, downgrade the route before presenting.
