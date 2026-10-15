# Small business marketing article import

The owner's October 15, 2026 request was to upload `visionarytalks.com.docx`, keep the article off the homepage, provide its link and push all changes. This import continues the accepted isolated Preview review; it does not promote the homepage/watchlist changes or this article to Production.

- Article path: `/small-business-marketing-strategies/`.
- Title and all 11 sections retained, including the complete conclusion. The DOCX contains 60 body blocks and 1,405 body words, with no tables or illustrations.
- Both supplier links retained with their original labels. Removed two empty space-only hyperlink nodes from the Word formatting. No marketing-performance or endorsement claim was added.
- Added an original SEO title, description and canonical URL. Uses the shared article layout, cover generator and existing Daniel Mercer byline.
- Read Google's SEO Starter Guide and both supplier catalogues. The three CMS reference records describe the limited evidence they support; no interview, tested product or independent marketing study is claimed.
- Source checksum and imported HTML are retained in `article.json`. The source Word document is unchanged. `extract-docx.py` reproduces the conversion with the bundled document runtime.
- `import-marketing-article-preview.ts` is guarded to the existing isolated Preview snapshot. It defaults to a dry run, refuses to replace conflicting content and keeps private import backups. Production import is intentionally unsupported.

## Homepage exclusion

Stories now have an **Exclude from homepage** checkbox. It leaves direct URLs, archives and indexing eligibility intact. Excluded stories cannot enter the hero, newsroom lead, Latest list, story modules, manual homepage selections, ownership figures or ownership update box. Their edits do not advance the homepage masthead update date.

The additive migration updates the story and version schemas. It was applied only to the isolated Preview database. Production requires a separate reviewed migration and publication integration.

## Verification

- All 81 unit tests pass, including a newest-story/manual-selection exclusion regression.
- Optimized Next.js build and TypeScript checks pass.
- Article returns 200, all 11 sections and final sentence render, both original inline links and the canonical remain present.
- Desktop 1440px and mobile 390px pass, each with JavaScript enabled and disabled. No horizontal overflow or long dashes in the article.
- No homepage anchor points to the article in all four browser checks.
- Repeat import dry run finds the same record with a matching content checksum, without duplicating it.
- Screenshots and browser results are private under `private/article-imports/`.

The earlier unrelated untracked `debug.log` is excluded from the commit. The previous accepted homepage and watchlist work is included in the branch being pushed.
