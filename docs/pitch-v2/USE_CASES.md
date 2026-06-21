# VibeShield Use Cases

Status: SPEC_ONLY

## Primary Hackathon Use Case

AI customer-support application with a support/refund flow.

Controlled assumptions:

- fake customers
- fake ticket text
- fake refund and email tools
- no real money movement
- no real external messages
- one risky feature selected instead of broad company scanning

Demo value:

- A normal support flow can pass.
- An indirect prompt injection can attempt a high-impact action.
- Evidence can identify where the tool boundary failed.
- A guard can block or hold the high-impact action.
- Verification can preserve benign support utility.

## Secondary Static Readiness Use Cases

These are roadmap/static checklist use cases unless future implementation proves otherwise:

| Use case | Current label | Notes |
| --- | --- | --- |
| Rate limiting or request quota | ROADMAP | Not implemented in `src/scan.ts` today |
| Per-user token/cost cap | ROADMAP | Not implemented in `src/scan.ts` today |
| Specific actionable error handling | ROADMAP | Spec item only |
| Streaming response indicator | ROADMAP | Spec item only |
| Audit logging for high-impact actions | ROADMAP | Some demo artifacts may exist, but dynamic readiness check is not implemented |
| Privacy/data inventory | ROADMAP | Legal/readiness checklist, not scanner result |
| Apple/Google privacy declaration readiness | ROADMAP | Checklist for review, not legal conclusion |
| UGC/DMCA workflow readiness | ROADMAP | Only applies if app accepts user uploads |

## Future Buyer Stories

### Solo vibe-coded founder

Need:
Know whether a working AI feature is safe enough to show users.

VibeShield story:
Select one deployed workflow, run bounded tests, get evidence, fix one high-impact failure, and keep the test as a regression.

### Hackathon team

Need:
Show judges a real product, not slides.

VibeShield story:
The pitch opens with the app, reveals a real failure, applies protection, and proves benign utility remains.

### Platform or accelerator

Need:
Help many small builders avoid obvious AI-agent risks before launch.

VibeShield story:
Run a structured risk loop and static readiness checklist while labeling legal/platform items as review indicators.
