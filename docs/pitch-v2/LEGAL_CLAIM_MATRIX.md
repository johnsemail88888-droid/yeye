# Legal Claim Matrix

Status: SPEC_ONLY
Rule shown on every legal card:

> Risk indicator for developer or legal review; not legal advice.

Sources checked on 2026-06-21:

- FTC AI/deceptive claims enforcement: https://www.ftc.gov/news-events/news/press-releases/2024/09/ftc-announces-crackdown-deceptive-ai-claims-schemes
- FTC AI substantiation example: https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-order-requires-workado-back-artificial-intelligence-detection-claims
- Apple App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
- Apple third-party SDK privacy manifests: https://developer.apple.com/support/third-party-SDK-requirements/
- Google Play Data safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Google Play User Data policy: https://support.google.com/googleplay/android-developer/answer/10144311
- U.S. Copyright Office DMCA agent directory FAQ: https://www.copyright.gov/dmca-directory/faq.html
- U.S. Copyright Office fee history noting $6 online designation: https://www.copyright.gov/newsnet/2016/640.html

## Safe Claim Rules

| Topic | Do not say | Safe pitch wording | Required evidence |
| --- | --- | --- | --- |
| FTC and AI disclosure | A universal AI disclosure plus automatic fine claim | AI-related marketing, capabilities, privacy practices, and consumer-facing representations must not be deceptive or unsubstantiated | Observed claim text, app context, source link, limitation |
| Arbitration | One sentence prevents class actions and saves millions | The app's Terms do not visibly address dispute resolution; this may warrant counsel review | Terms evidence, jurisdiction/context questions |
| Apple privacy | Apple automatically creates CCPA liability | App Store privacy details require developers to describe relevant data collection and sharing accurately | Data inventory, SDK list, App Store context |
| Google Play Data safety | Google automatically validates every app as safe | Google Play's Data safety section asks developers to describe collection, sharing, and handling practices, including relevant SDK behavior | Data inventory, SDK list, Play context |
| DMCA/UGC | Registering an agent guarantees safe harbor | A qualifying online service may seek section 512 safe-harbor protection, but registration is only one condition | UGC feature evidence, public agent info, notice process, counter-notice process, repeat-infringer policy |
| Statutory damages | Every UGC upload creates automatic $150,000 liability | Willful infringement damages can reach statutory limits, but liability and damages depend on facts and law | Legal review note and limitations |

## Legal Card Schema

Every legal card must include:

- observed evidence
- applicability questions
- jurisdiction or platform context
- confidence
- official source
- safe next action
- limitations
- "Risk indicator for developer or legal review; not legal advice."

## Demo-Ready Claims

These are safe when evidence is shown:

- VibeShield can flag unclear AI capability or privacy claims for developer or legal review.
- VibeShield can create a draft data inventory checklist and flag missing or uncertain disclosures.
- VibeShield can label UGC/DMCA readiness questions when the app accepts user uploads.
- VibeShield cannot decide legal compliance.

## Roadmap Labels

The current scanner does not implement dynamic privacy, Apple/Google, UGC/DMCA, rate-limit, token-cap, streaming, or audit-log checks. Those items are static readiness checklist entries unless a future artifact proves implementation.
