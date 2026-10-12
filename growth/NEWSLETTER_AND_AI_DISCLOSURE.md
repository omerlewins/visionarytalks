# Newsletter registration and AI disclosure

Implemented October 12, 2026. User chose CMS collection first, with no email delivery.

## Registration

- `/newsletter/` and the shared Visionary Brief section accept an email address and an unchecked, required consent checkbox.
- POST `/api/newsletter` validates consent and email server-side, normalises email case, checks the browser origin against the externally requested host, ignores the spam field and applies an atomic database-backed request limit.
- Duplicate emails do not create additional records or disclose whether an address already exists. The original consent record is retained; withdrawn registrations are not silently reactivated.
- CMS **Audience → Newsletter registrations** stores email, registered/withdrawn state, unverified flag, consent timestamp/version and source path. Public collection listing and writes are denied; access is limited to authorised editors/admins.
- No welcome message, verification email or newsletter is sent. A sending provider, address verification and unsubscribe handling must be connected before delivery is enabled. Registration is not evidence that the visitor owns the email address.
- `/newsletter-privacy/` explains collected data, infrastructure processing and email-based withdrawal/deletion requests.

## Database

Versioned migration `20261012_080223_newsletter_registrations` adds the private registration table, locked-document relation and an expiring rate-limit table. It preserves existing media defaults. Migration was applied only to the isolated Preview project using `scripts/migrate-newsletter-preview.ts`; Production is unchanged and must run the migration before enabling this feature there.

Rate-limit keys use a keyed hash of the network identifier and a 15-minute window; raw addresses are not stored in newsletter records. Expired buckets are cleaned on subsequent requests. This is basic abuse prevention, not a guarantee against determined automated submissions.

## AI transparency

Validation: 51 tests passed, both shared editorial validators passed, and the production build passed. Browser checks cover successful registration, denied unconsented requests, duplicate responses, private collection access, the durable request limit, responsive pages and article disclosure. One reserved `example.com` registration was inspected for persisted consent and unverified status, then removed. No emails were sent.

`/ai-disclosure/` explains AI assistance in research, drafting, editing, analysis and some graphics; distinguishes conceptual portraits from photographs and dated data graphics; explains the author’s pen name and symbolic portrait; retains editorial responsibility; and gives an error/rights contact. Footer and shared article templates link to it. Existing illustration captions are retained.

The statement does not claim every legacy fact has passed human review, that AI output proves a claim, or that disclosure provides immunity from copyright, publicity, privacy or other legal claims.

Primary references consulted for drafting:

- European Commission, [Article 50 transparency FAQ](https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act).
- US Copyright Office, [AI copyright initiative](https://www.copyright.gov/ai/) and [human-authorship guidance](https://www.copyright.gov/ai/ai_policy_guidance.pdf).
- FTC, [endorsement guidance and limits of disclosure](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking).

These inform transparent wording, not a jurisdiction-specific legal opinion or certification. Publication review and rights checks remain separate.
