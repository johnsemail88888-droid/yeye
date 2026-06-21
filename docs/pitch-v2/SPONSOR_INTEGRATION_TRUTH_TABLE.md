# Sponsor Integration Truth Table

Status: SPEC_ONLY
Last updated: 2026-06-21 05:34 PT

Purpose: keep sponsor and integration questions honest during Q&A. This branch does not implement or verify any external sponsor integration.

## Rule

Mention a sponsor or integration only as:

- a current repo-backed artifact,
- a possible production integration path,
- a roadmap readiness category, or
- a limitation.

Do not imply a live external service is wired unless the evidence packet names the endpoint, artifact, or source integration.

## Truth Table

| Name / category | Current status | Safe answer | Do not say | Evidence needed to upgrade |
| --- | --- | --- | --- | --- |
| Arize / observability | NOT CLAIMED by this SPEC_ONLY branch | "Observability integrations are a production path; today the demo focuses on VibeShield's own run evidence." | Live Arize connection claim without evidence | Config, endpoint, trace export artifact, or UI evidence owned by integration team |
| ArmorIQ / guard framing | COMPATIBILITY LANGUAGE ONLY if already in repo copy | "The demo shows a plan-aware runtime guard pattern; external ArmorIQ integration is not claimed here." | Live external ArmorIQ service claim without evidence | Implemented connector, policy artifact, vendor-backed evidence, and integration-owner approval |
| Token Company / token budgets | ROADMAP readiness category | "Per-user AI budgets are a useful readiness indicator; the current scanner does not implement token-cap detection." | Live token-budget check claim without evidence | Scanner/runtime check, artifact field, and claim ledger update |
| Browser extension / Shield Pill | ROADMAP unless UI owner proves otherwise | "The real browser Shield Pill is roadmap; this route uses the current in-page entry point or labeled fallback." | Shipping extension claim without evidence | Extension package, live demo evidence, and integration-owner signoff |
| CI / GitHub Action | LIVE for hand-committed workflow existence only | "The repo includes a hand-committed CI workflow that runs the risk loop." | "The CLI generated this workflow" | Actual CLI/generator evidence |
| Legal/platform sources | STATIC REVIEW INDICATOR | "Legal/platform cards are review indicators with official sources, not legal advice." | Compliance proof claim | Product evidence cards plus legal review, still not a legal conclusion |

## Q&A Patch Lines

If asked "What is the real role of Arize?":

> No Arize integration is claimed by this SPEC_ONLY branch. If mentioned, it is an observability production path; today's proof is VibeShield's own run evidence.

If asked "What is the real role of ArmorIQ?":

> The demo can use guard-framing language only when backed by repo copy or artifacts. It should not imply an external ArmorIQ service is running live.

If asked "What is the real role of Token Company?":

> Token budgets are roadmap readiness indicators unless a real token-cap check exists. The current scanner does not implement that check.

## Upgrade Checklist

Before any sponsor/integration claim moves from ROADMAP or NOT CLAIMED to LIVE, require:

- integration owner approval,
- named endpoint/config/artifact,
- visible truth badge,
- evidence packet update,
- claim ledger update,
- Q&A update,
- no edits from this SPEC_ONLY branch to runtime, UI, package files, or CI.
