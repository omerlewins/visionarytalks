# Homepage edition and freshness

The homepage keeps the publication's serif masthead, cream and black editorial palette, accepted portraits and AI illustration disclosures. The order is hero, 01 Leaders, 02 Ownership, 03 AI companies, 04 Careers, 05 Newsletter, then footer.

## Automatic content

`home-editorial.ts` selects from published, indexable story teasers. The hero uses the most recent editorial modification date, falling back to publication date. Ties use publication date, then path. `/ai-people-to-watch/` is excluded only from the lead slot because it has its own Leaders feature. Latest has the next six stories without repeating the lead. No named story is hardcoded into either selection.

Dates are rendered on the server. The masthead uses America/New_York with an ET suffix, including daylight-saving changes. Card dates use actual editorial dates, not the time a migration or image upload ran. Relative labels are generated at request time and do not require browser hydration.

The figures strip uses published tracker observations and published ownership release artifacts only. Every item links to a published ownership page and identifies its measure and month. These are selected dated financing records, not live share prices or necessarily the latest transaction of every kind. Exact priced rounds remain separate from tenders, debt, licence consideration, proposed deals and unknown/lower-bound values. The strip has no marquee or injected content, scrolls horizontally on desktop and wraps on mobile; reduced motion requires no animation.

## CMS editing

Open `/admin/globals/site-settings`:

* **This week in ownership** has three native rows with event date, status, headline and a published ownership-story selector. It is a weekly editorial reading selection; the displayed dates remain the dates of the actual announcements. It does not relabel September events as having occurred this week. Changing or removing a published destination removes that item from the public panel.
* **Most Read: manual selection** holds up to five story references in editor-defined order. The public caption discloses editor selection. No analytics ranking or traffic number is invented. Replace the manual source only after genuine readership data is available.

The initial selected events reuse the published Lambda October 6 financing report, Cohere September 16 definitive agreement and Harvey September 9 round. Seeded labels preserve reported talks, pending completion and announced financing as distinct states. Existing publication dates and release artifacts remain unchanged.

The old slogan and manual featured-story fields are retained in the schema for backward compatibility but hidden from the CMS editor. Automatic selection replaces them. The additive migration was rehearsed before production; global settings and the illustration story were backed up privately before applying content changes.

## Shared presentation and verification

`UpdatedStamp` is used on general story cards, leader directory/feature cards, ownership archive cards and related-story cards. LinkedIn, Instagram and Pinterest use one shared icon/URL source in both masthead and footer and the Organization `sameAs` array. Account links open in a new tab with `noopener`; no Facebook, X or forthcoming-account placeholders remain in those blocks.

Run `npm test`, `npm run typecheck`, `npm run build`, and:

```powershell
node growth/homepage-2026-10-15/check-homepage.cjs https://visionarytalks.com
node growth/ai-people-2027/check-complete-article.cjs
```

The homepage browser check covers 1440px and 390px, automatic lead exclusion, six latest items, ten figures, three ownership updates, five manual reading picks, all four requested leaders, six circular portraits, timestamps, no long dashes/stale copy, images, schema, new-tab link attributes, section order, reduced motion and no-JavaScript content. Raw reports and before/after screenshots are private under `private/home-redesign/`. The Lighthouse target must be checked on the actual public domain as well as the protected candidate; record browser version and failed measurements rather than substituting a candidate result for a live result.

The lead portrait uses image sizes for the actual contained portrait area, rather than the full landscape frame. This avoids a roughly 188 KB mobile download for a portrait displayed at about 125 CSS pixels. New hero links disable speculative prefetch; analytics configuration and consent/opt-out behavior are unchanged.

The homepage uses `TrackerPreview`, a server component with native expandable details, rather than hydrating the full interactive tracker. This keeps the filtering and validation libraries on the actual tracker page. An idle analytics scheduling experiment was reverted; the final implementation retains `afterInteractive` automatic analytics loading and the existing preferences.

`StoryCard` lives in its own small server-rendered module. The homepage imports it directly instead of importing the complete article renderer, keeping article chart and state-map client bundles off the homepage. `Story.tsx` re-exports it for compatibility with article and archive callers.
