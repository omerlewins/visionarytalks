# October 16 live release

The owner explicitly confirmed deployment of the accepted Preview and marketing article to the main domain. The completed release is live at https://visionarytalks.com/.

## Deployed release

- Application commit: `311b9cf` on `codex/homepage-consolidated-preview`, pushed before deployment.
- Production deployment: `dpl_3bHGdKieULTETKAapQWhRXF89WnE`, https://visionarytalks-e8pwjwfpv-omer-webielcoms-projects.vercel.app.
- Previous live deployment preserved: `dpl_7aeUzpNW1F2YfAbzN1Fwv2Ve3tmz`.
- Built with the project's Production environment and live database configuration using `--prod --skip-domain`. Candidate desktop/mobile checks passed before explicit domain promotion.
- Applied only the two rehearsed additive CMS migrations, `20261015_110000_homepage_hero_money` and `20261015_120000_homepage_exclusion`. Existing Production records and homepage settings were backed up privately first.
- Saved the accepted hero relationship and Ali Ghodsi homepage display headline through the CMS, preserving article editorial dates.
- Replaced watchlist Story 146 only after the new application was live. Its separate October 16 exact claim ledger passes the publication gate. The original publication timestamp is preserved; the real editorial modification time reflects the update. The prior exact October 15 release remains independently valid in the new application.
- Imported marketing Story 147 at https://visionarytalks.com/small-business-marketing-strategies/. All 11 sections, original inline links and final paragraph are retained. Homepage exclusion is enabled; the article is accessible and appears in the sitemap.

## Verification

All 82 unit tests, TypeScript, publication validation, the Production-mode rehearsal build and hosted Production build pass. The 100-entry copy quality check reports 150 to 217 words per entry and no missing fields, public drafting references, long dashes, source-label mismatches, undated financial paragraphs or repeated opening failures. These automated checks do not certify external facts; the actual delta review and limitations are recorded separately under `growth/ai-people-2027/release-2026-10-16/`.

Production-mode rehearsal and the exact hosted candidate pass desktop 1440px and mobile 390px checks. The final custom-domain checks confirm the ten-portrait hero, newsroom, section order, ten dated figures, all 51 map jurisdictions, seven sourced personal-wealth rows, state interactions and article anchors. There are no broken homepage images, horizontal overflow or visible long dashes. Without JavaScript, native state selection and the full table remain usable. Live homepage layout shift was zero at both widths.

The live marketing article passes all four desktop/mobile and JavaScript/no-JavaScript combinations. Every original section and both inline supplier destinations render; canonical metadata is correct. No homepage anchor points to the marketing article in any combination.

Plain and query watchlist URLs, with and without JavaScript, return all 100 complete entries, all five fields, portraits/captions, seven FAQ items and then methodology. Rehearsal profile interaction checks also pass at desktop and mobile, including index search, filters, reset and anchors. No nomination or newsletter submission was sent.

Nine terminal curl checks on the live domain cover curl, Googlebot and Facebook user agents across trailing-slash, no-slash and query URLs. All return 200, 100 entries, FAQ and complete HTML; none contain the old title, old index or `My 2027 test`. Responses report `x-vercel-cache: MISS` and private no-store cache control. No separate cache purge or established stale-content cause is claimed.

Live homepage, article, watchlist, robots.txt and sitemap smoke checks return 200. Public pages have no noindex response header. Robots does not block the whole site, and the sitemap includes the new article.

An isolated mobile Lighthouse 13.5.0 run on the actual main domain measured **92 performance, CLS 0, LCP 2.71 seconds and total blocking time 184 ms**. This is a lab observation, not a guarantee for every visitor or network. It was run after browser tests had ended.

Private evidence and backups are under `private/live-rollout-2026-10-16/`; article checks and screenshots are under `private/article-imports/`. The unrelated original `debug.log` remains uncommitted and excluded from Vercel uploads.

## Rollback boundary

The earlier application knows only the older watchlist release. If rolling back to it, restore the exact prior CMS watchlist artifact from the private backup while the new application can validate both snapshots, then promote the previous application deployment. Do not simply promote the older binary while leaving the new CMS research hash in place. The additive columns can remain during application rollback.

Search Console live inspection and Request indexing were not performed in this release. Terminal user-agent checks do not substitute for that account action.
