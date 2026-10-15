# Consolidated homepage and watchlist Preview

The owner approved implementing the three attached prompts in Preview. This revision supersedes the first October 15 homepage layout. It is not authorization to change the main domain or approve a new watchlist publication release.

## Homepage

The order is masthead/date/figures, watchlist hero, From the newsroom, 01 Leaders, 02 Money, 03 Ownership, 04 AI Companies, 05 Careers, 06 Newsletter and footer. The hero has ten accepted editorial portraits across the watchlist chapters, including Ying Sheng, Sharon Zhou, Emma Lundberg, Beth Barnes and Helen Toner. Names and recorded organizations appear beneath them. Mobile uses a horizontal portrait row. These are existing illustrations, not new photographic likenesses.

Site Settings now has Homepage hero and an optional Newsroom lead. Both resolve against published, indexable articles. The default is the published watchlist. An unavailable relationship falls back safely; the hero and lead never appear in Latest. A manually selected lead is labelled Editor's pick. An article's optional Homepage headline does not replace its title or SEO fields. The requested Ali Ghodsi display headline was saved only to the isolated Preview snapshot, preserving its editorial date.

The four Leaders cards remain below the newsroom. The duplicate watchlist feature is removed from that section. The existing ownership notebook, manual Most Read selection, tracker, careers, newsletter and three social accounts remain. Every new story module shows its editorial or estimate date.

## Money data and interaction

The map uses the exact financial values and April 2026 snapshot from the published top 1% article's `us-state-wealth.json`. It is inline server-rendered SVG. The overview simplifies boundary geometry at a 1.2-unit tolerance in the 975-unit viewBox; it retains every jurisdiction and polygon ring. This reduces geometry payload without changing dollar values. The full article retains its original boundaries. The national about-$13.7M callout is the article's separate SCF 2022 benchmark, explicitly dated and never computed from state percentiles.

Mouse/keyboard preview, touch selection, a state dropdown and real article anchors are present. A native GET form supports state selection without JavaScript. View as table exposes all 50 states and DC with exact original dollar figures. Small-state links remain available independently of map hit areas.

The millionaire module is selected only when its existing sourced article is published. State shares use millionaire households divided by total modelled households. The US reference is the ratio of summed rounded counts across all states plus DC, not an average of percentages. Top ten ranking excludes DC. If that article becomes unavailable, the published net-worth-by-age article and its original SCF 2022 table supply the shared EditorialChart fallback.

AI billionaires use published Leaders research artifacts only, with Forbes personal estimates of at least $1B. Unknown, unestablished, historical and company/partial-holding measures are excluded. Each row names the estimator and date. The caption discloses the selection's scope; no complete wealth ranking or audited balance sheet is claimed.

## Article review

The approved Production JSON and publication ledger remain unchanged. `watchlist-preview.ts` checks the exact base hash before applying reviewed copy deltas to a clone. It sets changed entries pending and marks the Preview article awaiting editorial review. It cannot pass the existing publication gate. No draft was published merely to satisfy validation.

The Preview removes the remaining Grant Lee brief reference, omission/drafting language, undated repeated financial references and an unsupported current valuation-offer lead. It adds dated company attribution and Wonderful's September 2, 2026 closing statement, without converting financing into personal wealth. The new numerical evidence, six named role checks and source-access limitations are recorded in `rebuild-2026-10-15/preview-review.json`. Hongyu Ren's current employer was not inferred from a failed personal-site retrieval or an old search result.

The quality check covers all 100 entries, required fields, 150 to 220 words of prose, repeated outlook openings, prohibited public drafting references, long dashes, known publisher-label mismatches and the presence of dates in financial paragraphs. External truth still requires evidence review. Existing education unknowns remain unknown. The workflow now preserves these rules for future refreshes.

Display-only punctuation normalization covers legacy text, Lexical text nodes, metadata and linked prose while preserving original URLs, archived markup, financial values and publication hashes.

## Isolation and publication

The additive migration and CMS seed were applied only to the existing isolated Production rehearsal branch, used here as a Preview snapshot with Preview environment flags. Private backups precede the setting and headline changes. The main Production database and domain aliases were not changed. Do not promote this environment-specific Preview as Production: publication requires a deliberate reviewed integration, a new exact article ledger, rehearsed Production migration and a Production-environment build.

## Crawler and Search Console checks

Real terminal curl succeeded for default, Googlebot and Facebook clients across trailing-slash, no-slash and new-query URLs. All nine returned complete HTML, 100 entries and the FAQ, with none of the old title/test/index phrases. Headers indicated private/no-store and Vercel MISS. No stale copy was reproduced, so no invented cache cause or unnecessary purge is claimed. Raw evidence remains private.

Search Console live inspection and Request indexing were not submitted. Browser control failed to initialize twice with `failed to write kernel assets: The system cannot find the path specified`. Spoofed Googlebot checks do not substitute for that account action. Preview itself stays noindex.

## Final acceptance

Review branch: `codex/homepage-consolidated-preview`. Hosted Preview: https://visionarytalks-ccc7fk2dh-omer-webielcoms-projects.vercel.app/, deployment `dpl_GLKgM8PGBUhqiChmGeXchLZ17NsX`. Local review is available at http://127.0.0.1:3126/ without Vercel authentication. Both use the isolated rehearsal data, not the live database.

All 80 tests, TypeScript, the local and hosted production-mode builds, watchlist Preview validation and the Leaders/ownership review validators pass. The 100-entry copy check has a 150 to 217 word range and no field, punctuation, drafting, financial-date or opening-repetition failures. The separate publication gate still rejects the pending Preview revision as intended.

Final hosted checks at 1440px and 390px pass: one hero, ten eager portraits, six Latest items excluding hero/lead, requested section order, ten figures, 51 state areas, seven sourced personal-wealth rows, no overflow, no broken images and no client errors. Touch selection and state links pass. Without JavaScript, the native state form rerenders the selected figure, the full table is available and the article's state anchor opens visibly. Initial and post-scroll layout shift were both zero at both widths.

The full article checks pass on plain and query URLs, with and without JavaScript: all 100 entries, all five fields, all 100 portraits and captions, seven FAQ items followed by methodology, no drafting references or old research panels, correct index separators and no old funding table. Desktop/mobile search, filters, reset, anchors and nomination-form validation also pass. No test nomination was submitted.

The CMS alternate-hero check selected the existing top 1% article and a manual Ali Ghodsi lead, confirmed its display headline and Editor's pick label, and restored the watchlist hero afterward. It exposed and fixed a Next.js 16 local-image query restriction. Only `/social-image/` permits the generated cover's query string; other local-image paths retain the no-query restriction. Actual optimized image delivery passed locally and in protected Preview, returning a 200 image response.

Final mobile Lighthouse 13.5.0 in Chrome 155, at 20:17 UTC on the exact hosted Preview above, measured **96 performance, CLS 0, LCP 1.76 seconds, total blocking time 172 ms**. Earlier Preview audits scored 79 and 77 and remain part of the audit history. The improvements isolate the shared newsletter client chunk, reduce overview geometry from 110,370 to 30,448 characters, avoid a second React path tree, parallelize homepage reads and defer offscreen layout/paint with reserved intrinsic sizes. All content remains in server HTML; JavaScript is not required to reveal it while scrolling. Screenshot capture temporarily reveals deferred sections solely to capture the entire page; Lighthouse uses the actual unmodified site styles. This is a Preview lab measurement. Production performance must be checked again during an approved rollout.

Final private evidence is under `private/home-consolidated/`: `checks.json`, `article-completeness.json`, `article-layout/browser-check.json`, `watchlist-quality.json`, `scroll-cls.json`, `lighthouse-preview.json` and `tests-final.txt`. Before screenshots are `before-1440.png`, `before-390.png` and their full-page variants. Final screenshots are `after-1440.png`, `after-390.png`, their full-page variants and `after-money-1440.png` / `after-money-390.png`.

Production remains unchanged. Search Console live inspection and indexing remain the outstanding account action because of the browser-control initialization failure described above.
