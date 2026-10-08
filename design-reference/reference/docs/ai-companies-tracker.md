# AI companies tracker

Route: `/ai-companies.html`. Homepage preview: `/#ai-companies`.

The initial edition covers ten companies in seven editorial verticals. This is a manually reviewed October 4, 2026 snapshot, not a live feed. All figures have linked sources, dates, metric labels, qualifiers, and provenance. Earlier measurements are visibly marked. No total revenue, market-share calculation, or implied growth rate combines the mixed observations.

## Reader experience

- Search by company, description, or vertical.
- Filter by primary vertical and metric (ARR / annualized revenue).
- Sort by numeric figure, observation month, or company name.
- Expand company names to inspect source context and available ownership stories.
- Reset filters and a clear no-results state.
- Mobile rows become labeled, two-column records; source links remain visible.
- Without JavaScript, the full static table and source links remain readable.
- Homepage preview uses the same dataset for Base44, Lovable, Cursor, and ElevenLabs. Clicking a name opens a filtered tracker view.
- AI Tracker is linked in the primary navigation across all pages.

## Data and future company pages

`dist/data/ai-companies.json` is the single editorial input. Each company has a stable `id`, name, primary vertical, description, nullable `profileUrl`, optional `ownershipUrl`, and an `observations` array. Observations record value in USD, a human display string with qualifiers, metric, observation month, evidence basis, source publisher/URL/publication date, editorial note, and review date.

The current observation is the first in the array. To add history, preserve existing observations and prepend the newly reviewed one. The initial table has one selected observation per company and does not yet graph history. Unknown numeric values must remain null; never substitute zero. Sort treats null as missing.

Future company pages can connect to `profileUrl` using these IDs, with ownership, leaders, funding, and operating metrics as separate relations. No unbuilt profile links are shown today. Adding a non-null profile URL exposes a “Company profile” link within the row notes; company names continue to expand source notes.

## Maintenance

1. Update the source record and observation; preserve the difference between ARR and annualized revenue. Do not insert forecasts as current results.
2. Update the review date and matching page prose when publishing a later edition.
3. Run `python scripts/build-ai-tracker.py` from the repository root to regenerate both the page and homepage preview.
4. Run `node --test tests/ai-tracker.test.cjs` to check filtering/sorting.

Static output requires no API key, database, or external JavaScript dependency. `ai-tracker-core.js` implements filtering and sorting; `ai-tracker.js` connects those functions to the controls. `ai-tracker.css` contains the table/mobile and homepage-preview layouts.

The page has title/description, canonical, text social metadata, and CollectionPage structured data. It remains `noindex,follow` as a design concept. The newsletter remains an explicitly unconnected preview.

## Evidence choices

- OpenAI and Anthropic: Reuters reporting; run-rate thresholds, not audited annual sales.
- Cursor: the June $2.6B annualized figure summarized in the user-supplied ownership report. Conflicting estimates are acknowledged in the expanded note.
- Lovable, Replit, Perplexity, Harvey: explicitly labeled Sacra estimates with observation months.
- ElevenLabs: company-disclosed April ARR milestone, not its later valuation or segment-growth figure.
- Base44: founder-stated milestone reported by CTech; scope excludes other Wix revenue.
- Synthesia: approximate ARR disclosed in a February engineering post; exact measurement date unspecified and noted.

Verticals are editorial classifications, not claims that a company operates in only one market. Source provenance is not a confidence score or audit certification.
