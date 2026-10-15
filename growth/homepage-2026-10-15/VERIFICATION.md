# Homepage redesign acceptance record

Checked October 15, 2026. Production origin: https://visionarytalks.com/.

## Content and CMS

The lead and six Latest stories come from published, indexable content ordered by editorial update date. The watchlist is excluded from the lead, not from Latest. No new story is published and no editorial timestamp is advanced by the homepage migration.

The ten dated figures come from existing published tracker and ownership records, with exact priced financing measures kept separate from pending transactions, tenders and debt. The initial ownership notebook contains three previously published events, each with its actual date and transaction status. Most Read is an explicitly disclosed manual editor selection, not an analytics ranking.

Site Settings now stores the ownership notebook and five Most Read references. The additive migration and seed were rehearsed in the isolated database before Production. Private backups precede the Production changes. The Harvey illustration has an AI disclosure and was attached without changing the article's modified date.

## Acceptance checks

- TypeScript check and all 73 tests pass.
- Watchlist publication validator, Leaders review validator and ownership review validator pass. This presentation change does not reverify every external article claim or publish a research draft.
- Desktop at 1440px and mobile at 390px: correct section order, six Latest stories, ten figures, three notebook items, five reading picks, six circular portraits and the four requested leader profiles.
- No horizontal page overflow, broken images, browser errors, stale homepage copy or long dashes in rendered homepage text.
- All tested story cards have Updated stamps. Masthead uses the actual most recent content update in America/New_York, with ET displayed.
- LinkedIn, Instagram and Pinterest appear in both locations, use new tabs with noopener, and match Organization sameAs. No Facebook or X placeholder remains.
- Without JavaScript: all new content is present, and the tracker preview expands through native details.
- Reduced motion: figures strip has no animation. Layout shift measured by the browser checks is zero at both widths.
- The published watchlist still renders 100 complete entries, seven FAQ items and methodology in that order on plain and query URLs, with and without JavaScript.

## Performance audit history

Audits are mobile Lighthouse 13.5.0 on the actual public URL unless explicitly identified as a candidate. Chrome 155 is used for the before/after comparison. Reports remain private in private/home-redesign/.

The baseline scored 90 with CLS 0. Intermediate live results ranged from 82 to 89. A protected candidate scored 94 in Chromium 156, which is not a substitute for a public-domain result. The initial portrait download was oversized; responsive sizing reduced the mobile image transfer from about 188 KB to 14 KB. The tracker preview now renders on the server. Separating StoryCard from the full article renderer removed chart and map client bundles from the homepage. A trial change to analytics scheduling was reverted; the original afterInteractive loading and opt-out behavior are retained.

The first audit after splitting StoryCard scored 87, CLS 0, with background route prefetches still active. Shared header and figures links now disable speculative prefetch so those requests do not compete with the first screen.

## Final live result

Commit `683303f`, deployed as `dpl_7aeUzpNW1F2YfAbzN1Fwv2Ve3tmz`, was promoted to the main domain after candidate checks passed. Vercel's production build succeeded.

At 10:08 UTC, mobile Lighthouse 13.5.0 in Chrome 155 measured **91 performance, CLS 0, LCP 2.84 seconds, total blocking time 196 ms** on the plain public homepage. The raw report is `private/home-redesign/lighthouse-final-prefetch.json`. Remaining route prefetches fell to two, compared with the earlier header/figures request burst. This is a measured lab result, not a guarantee of an identical score for every run or visitor.

Public-domain desktop/mobile/no-JavaScript acceptance passed at 10:08 UTC. Final screenshots are `after-1440.png`, `after-390.png`, `after-full-1440.png`, `after-full-390.png`, `after-leaders-1440.png` and `after-leaders-390.png` in `private/home-redesign/`. The `before` images in the same directory were captured before the redesign and were not overwritten.

Automatic GA4 page-view behavior and the existing opt-out passed on the final public deployment. The test intercepted analytics collection requests locally, so those verification page views were not sent to the property. No analytics policy or preferences were changed for this redesign.
