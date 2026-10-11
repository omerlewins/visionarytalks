# New content in the protected Vercel Preview

The Preview CMS contains 23 new draft articles: the October 11 batch of 20 AI leaders, Michael Truell's original Cursor investigation, and the first-cycle Costco and ALDI reporting drafts. Three existing-article proposals are saved in Content inbox with preparation disabled.

Open `/content-review/` to browse everything. Michael Truell retains `/michael-truell-net-worth/`. The two ownership drafts can be read at `/review-content/who-owns-costco/` and `/review-content/who-owns-aldi/`. All of these review pages are noindex and unavailable in production. Production publication was not performed.

Leader research is saved both as editable CMS story drafts with linked rich text and as structured research records under Claim evidence. The dedicated leader renderer reads the stored structured profile in the isolated Preview. Capital and financial-definition boundaries are retained in those records. Original source check dates remain unchanged; import is not new verification.

From `app`, dry-run the idempotent importer with `node --env-file=../private/.env.vercel-preview --import tsx scripts/sync-review-content.ts`. Add `--apply` to write the isolated Preview. The script rejects production, missing Neon project configuration and unmanaged existing-path collisions. It does not launch content generation or overwrite existing published articles.

Imports and checks are recorded in ignored `private/growth/content-sync.json` and `private/growth/cms-content-checks.json`. Articles remain research drafts with the outstanding reporting gaps documented in the batch audit.
