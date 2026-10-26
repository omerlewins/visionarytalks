# Anthropic public S-1 analysis, October 26, 2026

Live article: https://visionarytalks.com/anthropic-ipo/

The owner requested writing and publishing a deep, original analysis of Anthropic's IPO filing. This is a new Money article using the existing Story template, responsive editorial tables, shared EditorialChart, source ledger, author profile and FAQ renderer. No Leaders, Ownership or watchlist research record was changed. The existing Anthropic ownership and valuation stories are linked as separate dated background.

## Research and argument

Primary records retrieved successfully: the issuer's October 26 notice, SEC S-1 accession `0001628280-26-067168`, its filing index and registrant submissions JSON. The latter confirmed Anthropic, PBC, CIK `0002130357`, acceptance at 13:00:11 UTC and the latest retrieved form as S-1. Raw captures and their extracted text are private under `private/growth/2026-10-26/anthropic-ipo/`. `REVIEW.json` records SHA-256 hashes, evidence scope, calculations and limitations. All six distinct SEC section anchors used in the article resolve within the captured document.

The article's analysis connects customer-spending flexibility, committed infrastructure capacity, conditional partner financing and separated economic/voting rights. It reconstructs the functional margin reconciliation from Note 8 without confusing total compute cost with cost of revenue or excluding research from operating profit. It distinguishes the $80.748B net loss, $693M operating loss and $3.929B operating cash inflow; the $72.388B financing revaluation and separate $8.720B adjustment are not conflated. It labels revenue sensitivities as fixed-expense illustrations, not forecasts, and keeps the nine-month usage-policy estimate separate from first-half revenue.

The article does not add overlapping infrastructure disclosures, invent updated commitment totals, treat unused conditional facilities as cash, forecast an exact IPO-quarter RSU charge, claim public shareholders have no vote, or equate a wholly owned public-benefit subsidiary's shares with an immediate external cash gift. The SEC document is issuer disclosure, not an independently verified audit by this publication. No every-exhibit or draft-by-draft review is claimed. Final price, shares, valuation, trading date and current complete commitment schedule remain unknown.

## Publication and verification

`app/scripts/publish-anthropic-ipo.ts` is dry-run by default, bound to the exact article and metadata hashes, and restricted to the known isolated rehearsal or an explicitly selected Production target. It refuses to overwrite a different existing story and makes a private backup before writes. It creates only this article and its necessary source records; repeated exact releases are unchanged. It does not change database schema, unrelated content, homepage settings or deployment aliases.

The isolated rehearsal dry-run/apply passed (Story 148), followed by a Production-settings build and the rendered-page harness. Production dry-run confirmed a new path. The owner-authorized Production apply created Story 171 with three source relationships and six same-definition quarterly revenue observations for the shared chart. Article checksum: `0f69777ed641256e60f76b7704b77261d8918a12b881ca2d6e150bdf4a849d65`. Private before/after records preserve IDs and publication timestamps.

All 94 existing tests, TypeScript and the site build passed. Browser checks passed first on the isolated built site and then on the public live domain: one H1, six analytical tables, three primary-source records, one shared chart with six quarterly observations, working table-of-contents anchors, clean canonical/indexable metadata, 390px/320px document widths, no-JavaScript article/source/table access, homepage discovery, exactly one sitemap entry and no browser errors. Desktop and mobile screenshots were reviewed. Results and screenshots are private under `rehearsal-qa/` and `live-qa/`.

This is a CMS publication using the existing deployed renderer, so no new frontend deployment was needed. The source article, metadata, evidence review and guarded publishing/check scripts are retained in Git for review and reproducibility; Production CMS remains the public serving record.
