# Legal review required

This file lists guest-facing or operational wording that should be confirmed by the founder and/or counsel before treating it as final.

Do **not** invent additional corporate registrations, trademarks, or licenses beyond what Bornfidis already holds.

## Assumed-name / DBA language

| Location | Current wording | Needs review |
|----------|-----------------|--------------|
| Footer copyright (`lib/brand-legal.ts`) | “Bornfidis Provisions and Bornfidis Digital Studio are assumed names of Bornfidis Sportswear LLC” | Confirm both assumed names are registered (or intended) in the relevant jurisdictions |
| Privacy / Terms pages | Same entity + assumed-name framing | Counsel confirm Vermont/Jamaica disclosure sufficiency |
| Prior “DBA Bornfidis Provisions” only | Replaced by assumed-name dual DBA line | Confirm Digital Studio registration status |

## Claims to avoid until verified

- Specific trademark registration numbers or ® claims not confirmed in this repo
- Insurance, licensing, or health-department certifications not documented
- Territorial exclusivity (e.g. sole operator claims)
- Guarantees of revenue, SEO rankings, or Digital Studio outcomes
- Public Digital Studio package pricing (explicitly out of scope for pilot)

## Privacy & payments

| Item | Note |
|------|------|
| Analytics | Privacy page allows privacy-conscious analytics after consent/legal review — do not enable ad pixels until approved |
| Stripe / Resend processors | Named as processors; confirm DPAs and From/Reply-To domains with counsel if required |
| Data retention / deletion | Policy invites contact for deletion; retention periods not yet specified — set with counsel |

## Jurisdiction

Terms default to **Vermont** law. Confirm whether Jamaica-facing guests need additional local disclosures.

## Contact for legal edits

Update `lib/brand-legal.ts`, `app/privacy/page.tsx`, and `app/terms/page.tsx` together so footer and policies stay aligned.
