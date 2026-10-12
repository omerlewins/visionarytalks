# SEO launch audit — October 12, 2026

Checked the isolated Preview against 154 URLs: the previous 149-URL migration inventory plus the Leaders, ownership, tracker, newsletter and disclosure destinations. All returned successful pages after intentional redirects. The audit found no missing titles, descriptions, canonical URLs or social images, no duplicate descriptions among distinct final routes, and no titles over the audit's 75-character review threshold. This is a technical metadata check, not a guarantee of ranking, snippet selection or factual approval.

## Changes

- Sixty-two published CMS records had empty custom description fields. The renderer now uses topic-specific editorial defaults and ownership descriptions when a meaningful CMS value is absent. Valid CMS metadata still takes priority. Long titles and descriptions are shortened at word boundaries; WordPress SEO placeholders are rejected. The original article headlines and CMS reporting are preserved.
- Canonicals use `https://visionarytalks.com` and retain public paths. Archive pagination has distinct titles, descriptions and self canonicals. Populated category hubs are eligible for Production indexing; search, tag and author archives stay noindex, with following allowed in Production.
- Existing leader AI portraits take priority over old thumbnails in article rendering, social metadata, schema and sitemap images. Six research profiles have dedicated portraits. Remaining profiles have named editorial social covers, not invented likenesses. Existing imported images remain on other articles; missing images receive branded 1200×630 PNG covers. Illustrations and graphics retain accurate labels. No research content or stored leader data was synchronized.
- Article/WebPage schema now includes the selected image, publisher, canonical and breadcrumbs. No artificial publication or freshness date was introduced. Twitter large-image cards and a VT favicon are included.
- The AI Voices article had eight additional H1 headings in its imported body. Body H1s are rendered as H2s with their anchors intact, leaving the article title as the only H1; stored CMS source HTML is preserved.
- Production robots explicitly allow `/api/media/file/`, which would otherwise be blocked by the `/api/` exclusion. Admin, internal review and search routes remain excluded. Preview stays noindex with an empty sitemap, even if its APP_ENV is incorrectly set to production.
- The Production sitemap includes public CMS articles, useful hubs and images; fixture/noindex/noncanonical content is excluded. WordPress's live sitemap index and five child sitemap endpoints redirect permanently to `/sitemap.xml`.

Private evidence: `private/growth/seo-audit.json`, `seo-stories.json`, `seo-qa/`; scripts `seo-audit.mjs` and `check-seo-images.mjs`. Image checks cover two generated covers, two AI portraits and a research ownership cover, at 390px and 1440px, including staging indexing protections. All 59 tests, both review-contract validators and the final build passed. See the adjacent migration audit for the separate content and asset parity checks.

## Google integrations

The supplied `sc-domain:visionarytalks.com` and GA4 property ID `530033839` were saved in Preview CMS → Settings → Search & Analytics with a private backup. The existing Google domain verification TXT record was found in live DNS. Preserve it during the Vercel cutover; changing hosting under the same domain does not call for a new identity or new analytics property.

Preview has no GA4 web measurement ID, tracking is disabled, and no `GOOGLE_SERVICE_ACCOUNT_JSON` is configured. The live homepage also exposed no GA4 or GTM identifier during this check. The browser reached Google's sign-in page, so account access and the measurement ID could not be verified. A numeric property ID does not enable tracking.

Before collecting visits, copy the existing web stream's `G-…` measurement ID into the Production CMS and enable consent-based tracking there. The website sends no analytics requests before consent and never tracks Preview or CMS pages. To read reports in the CMS, separately configure a Google service account, enable the Search Console and Analytics Data APIs, and grant it appropriate property access; those credentials are server-side, never placed in CMS fields or client JavaScript. Tracking itself does not require that service account.

After launch, submit `https://visionarytalks.com/sitemap.xml` in the existing domain property, inspect representative articles using URL Inspection, and verify a consented visit in GA4 Realtime. Preserve the current properties and historical reports.

Official references: [Google title guidance](https://developers.google.com/search/docs/appearance/title-link), [meta descriptions](https://developers.google.com/search/docs/appearance/snippet), [GA4 measurement ID](https://support.google.com/analytics/answer/12270356), [GA4 setup verification](https://developers.google.com/analytics/devguides/collection/ga4/troubleshoot), [Search Console URL Inspection](https://support.google.com/webmasters/answer/9012289).

## Remaining launch work

This branch is Preview-only. Production credentials/storage, schema migrations, approved content transfer, integration settings, `APP_ENV=production`, `DEMO_MODE=false` and the domain cutover are separate launch steps. Do not reuse Preview credentials in Production.

The 22 new leader research profiles and ten ownership investigations retain outstanding editorial gates. They are not publicly released merely because metadata passes; Production keeps the original published articles and excludes review batches. Sixteen research profiles have no dedicated portrait yet. The imported `/privacy-policy/` still contains WordPress suggested boilerplate, and several publication policy routes remain drafts; those require actual owner-reviewed content before launch. This audit does not claim the whole website is ready for launch.
