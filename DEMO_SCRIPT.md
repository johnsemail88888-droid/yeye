# VibeShield — 3-Minute Demo Script

Everything below uses the REAL working surfaces. Daemon: `npx tsx src/daemon.ts` (http://localhost:7878). Runs fully offline, no API keys.

## One-line pitch
> "VibeShield is a risk debugger for vibe-coded AI products. It opens your deployed app, finds where an agent can be hijacked, proves it, installs a runtime guard, and reruns the same attack to prove it's fixed."

## Flow (≈3 min)

**0:00 — The deployed product.** Open `http://localhost:7878/demo` (Acme Support — a vibe-coded AI support agent). Bottom-right: the 🛡 VibeShield panel.

**0:20 — Scan the feature.** Click **① Scan selected feature**. The panel captures the real page scope and the daemon runs the real BEFORE suite → **5 real failures** appear, with a `run_id`. (Say: "These aren't mockups — the agent really did this.")

**0:50 — Same run on the desktop.** Click **Open desktop ↗** → the control plane shows the **same `run_id`**. Risk Inspector → **Evidence**: the support ticket with a hidden instruction, and the agent actually calling `refund_customer($500)` and emailing PII to `external@evil.com`. → **Trace**: user goal → untrusted input → tool_call → guard_decision.

**1:30 — Install the guard, rerun the SAME attack.** Click **② Install guard & rerun**. The before→after table flips **red → green**: the unauthorized refund is **HELD_FOR_APPROVAL**, the PII email is **BLOCKED**, and the normal support reply still **PASSES**.

**2:10 — Prove it's generic, not overfit.** Point at `paraphrased_injection_mutation_a/_b` — two attacks worded completely differently ("credit of 500 dollars… forward to backup@external-vault.net", "wire back 750… BCC ops-archive@…"). Both blocked with the **same structural reasons**. (Say: "It doesn't pattern-match the attack; it enforces the signed plan.")

**2:35 — Reports + audit.** Open `.vibeshield/reports/founder-report.md` (plain English, business impact, privacy **risk indicator — not legal advice**) and `report-audit.json` (**score 100, pass: true** — every number traces to an artifact).

**2:50 — Close.** Show `verify_results.json`: `demo_ready=true`, every gate real. 
> "From the deployed product, to the source, and back to verified behavior — with evidence at every step."

## What to actually click (no dead buttons)
`/demo` panel: ① Scan selected feature → Open desktop ↗ → ② Install guard & rerun. Desktop: Findings / Evidence / Before-After / Overview tabs. All read real artifacts.

## Sponsor one-liners (only where real)
- **ArmorIQ**: the runtime intent guard (plan-signed, off-plan blocked) — labelled "ArmorIQ-compatible" (local adapter; real SDK = drop-in with a key).
- **Arize**: the trace→eval→fix→reverify loop + before/after evidence (local trace now; Phoenix UI = feature-flag with a key).
- **Anthropic**: Claude Agent SDK replaces the deterministic stand-in with a key (`.env.local`).
