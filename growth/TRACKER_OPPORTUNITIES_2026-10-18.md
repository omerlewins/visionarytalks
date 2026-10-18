# Tracker opportunity review

Research date: October 18, 2026. Recommendation only; no application, CMS, publication or automation changes.

## Decision

Build out the existing `/ai-salaries/` route first as an AI Company Pay Tracker. Its useful distinction is a dated comparison of employer-advertised pay, filtered by company, role, location and experience, with a history of changes. Follow with a richer financial comparison on the existing `/ai-companies/` route. A generic AI-company directory is a weaker first SEO target.

The website already connects Ownership, Salaries, Money and Leaders. The supplied historical GSC export summarized in `growth/PLAN.md` attributed about 68.2% of exported clicks to ownership-like URLs; its exact dates and filters are incomplete. That supports linking trackers to ownership reporting, not forecasting salary traffic from it.

## Research scope and limitations

- DataForSEO has no callable tools in this session. Plugin discovery for DataForSEO returned no matches. The October 9 record documents an earlier 401; authentication was not retested today. No current DataForSEO volume or difficulty is claimed.
- Used the connected Semrush service: one 25-query metrics batch and three ten-result organic reports. Metrics returned 24 query rows; `ai revenue tracker` was absent, so its demand is unknown, not zero.
- US database, English query terms, latest available database, retrieved October 18. The underlying measurement period was not returned. Volumes are provider estimates of monthly searches; KD is Semrush's difficulty measure, not a ranking probability. Do not add overlapping queries into a traffic forecast.
- Returned usage: 240 + 300 + 100 + 300 = 940 API units. No monetary charge was returned.
- Sanitized raw data: ignored `private/growth/2026-10-18/tracker-research/semrush.json`.
- Public `/ai-companies/` and `/ai-salaries/` fetches failed in the web reader. Existing routes and behavior below were inspected in repository code; current public content and CMS coverage remain unverified.

## Observed keyword metrics

| Query | Estimated US searches/month | Semrush KD |
|---|---:|---:|
| ai companies | 14,800 | 85 |
| ai company revenue | 20 | 0 |
| ai company valuations | 110 | 46 |
| openai revenue | 4,400 | 62 |
| anthropic revenue | 4,400 | 42 |
| cursor revenue | 1,000 | 73 |
| perplexity revenue | 720 | 55 |
| glean revenue | 320 | 41 |
| harvey ai revenue | 210 | 48 |
| ai engineer salary | 5,400 | 64 |
| machine learning engineer salary | 5,400 | 50 |
| openai salary | 720 | 49 |
| anthropic salary | 590 | 21 |
| ai research scientist salary | 260 | 60 |
| cursor salary | 110 | 11 |
| xai salary | 260 | 16 |
| highest paying ai companies | 20 | 0 |
| ai salaries | 140 | 50 |
| ai startup funding | 720 | 63 |
| ai ipo | 390 | 35 |
| openai ipo | 14,800 | 68 |
| anthropic ipo | 33,100 | 48 |
| glean ipo | 260 | 14 |
| harvey ai ipo | 40 | 12 |

These are individual keyword observations, not traffic projections. Low or zero KD does not establish attainability.

## What the sampled search results imply

`anthropic salary`: Levels.fyi ranked first, followed by Reddit, LinkedIn, a recruiter overview and Fokal; Glassdoor was sixth. `xai salary`: Levels.fyi first, Reddit second, Glassdoor third, a recruiter page fourth and Business Insider fifth. The opportunity is a reproducible employer-source comparison with dates and history. The established salary sites still create meaningful competition despite lower returned KD.

`anthropic revenue`: WSJ first, SaaStr second, Reddit third, LinkedIn fourth and Reuters fifth. This sample suggests strong news intent and freshness demands. A maintained timeline with explicit definitions could serve a different reader need, but a thin table of headline figures would be weak differentiation. These are provider database positions, not a live browser SERP or the site's own rankings.

## Product 1: AI Company Pay Tracker

Reader question: What does this company advertise for my kind of work, in my location, and has that changed?

Recommended row fields: company; exact advertised title; normalized role family; stated level (unknown when unstated); location; currency; annual salary lower/upper bounds; employer's pay definition; bonus/equity disclosure; evergreen/open/closed/unknown status; observation date; source link. Only label a range base pay when the source establishes that definition. Preserve OTE separately for sales roles.

Start with a proposed pilot of five companies and roughly 25 to 40 verified listings, subject to source availability. Anthropic, xAI, Cursor and OpenAI are research priorities; choose the fifth after checking available primary data. This is a scope proposal, not a claim that those records have been collected.

Useful features:

1. Comparable role/location filters and a compact company comparison.
2. A pay-range visual on each row; distinguish overlapping ranges without implying matched seniority.
3. A source drawer and dated change log. Show salary changes only for the same listing, location, currency and pay definition; explain revisions rather than assuming a market raise.
4. Display listing count and distinct roles, not employee sample size. Deduplicate syndicated postings and repeated locations; flag evergreen listings.
5. CSV export and a short methodology. Keep the complete evidence table readable without JavaScript.

Primary-source feasibility check: Anthropic's employer listing for Research Engineer / Research Scientist, Tokens lists annual salary of $350,000–$500,000 USD and locations in New York, Seattle and San Francisco. It explicitly describes itself as evergreen. This is one advertised range, not typical employee earnings or proof of an immediate vacancy. Accessed October 18:
https://job-boards.greenhouse.io/anthropic/jobs/4951814008

Official careers directories also opened:
https://www.anthropic.com/careers
https://openai.com/careers/search/

Later, add DOL LCA disclosures in a separate view after checking the source dataset, employer aliases, cases, status and wage units. Filings are not a census of employees or total compensation; do not pool them with job advertisements. The direct performance page returned 403 today; no disclosure workbook was downloaded or analyzed.
https://www.dol.gov/agencies/eta/foreign-labor/performance
https://flag.dol.gov/programs/LCA

SEO: retain `/ai-salaries/` as the hub. Pilot a substantive Anthropic company salary page, then xAI and Cursor, only after CMS/URL duplicate checks and enough verified records for useful analysis. Exact child slugs remain provisional. Cover OpenAI within the comparison first. Index useful company analysis; keep arbitrary role/location filter combinations from creating thin pages. Existing ownership investigations provide contextual incoming and outgoing links. No founder link should be invented.

Maintenance proposal: weekly listing/status review and a monthly editorial summary when the evidence supports one. No automation was created. A source check date is not a pay observation date or an editorial re-verification date.

## Product 2: AI Company Financial Tracker

Expand `/ai-companies/` with separately typed observations: company, sector, product, disclosed revenue, ARR or annualized run rate, metric period, valuation and transaction type/date, source type, verification date, and links to existing ownership/leader reporting.

Add distinct views for operating performance, financing valuations and funding events. Provide a chronological source trail and a clear description of what changed. The useful feature is comparison with definitions and dates, rather than a single mixed-metric ranking. Expose unknowns honestly.

Keep recognized annual revenue, ARR, run rate, forecasts, bookings, company valuation, fund size and founder wealth separate. Never sort mixed measures as one financial leaderboard. Do not calculate valuation/revenue ratios from mismatched dates or definitions, or invent margin, profit, runway or revenue per employee from incomplete denominators. Do not plot tenders, debt, deal consideration or pending transactions as priced funding rounds. Reuse shared EditorialChart only with appropriate verified observations.

Prioritize Anthropic, Glean, Harvey and Perplexity research alongside broader OpenAI coverage. Revenue queries have more observed demand than the generic tracker term, but stronger freshness and competition requirements.

## Product 3: AI public-market status table

A later view could answer whether companies are public, their verified listing/ticker if applicable, and what official filing or announcement supports that status. The IPO query volumes justify investigation, not an assumption that any company remains private. Verify each status before entering data, distinguish announced plans from filed offerings and completed listings, and never invent IPO dates. Connect the table to existing ownership investigations instead of duplicating their stock/IPO answers. IPO demand can spike around events, so do not treat it as stable recurring traffic.

## Existing implementation and next step

`SalaryTracker.tsx` currently provides an occupation filter and observation cards. `salary-fixtures.ts` explicitly marks its occupational figures as unverified fixtures; they cannot seed company-pay reporting. The route reads CMS occupation observations outside demo mode. Live record availability was not inspected.

`Tracker.tsx` already supports company search, vertical and metric filters, source links and dated observations. Its numeric sort explicitly permits mixed metrics. A financial comparison upgrade needs definition-aware views and sorting before positioning it as a comparable leaderboard. The company seed file contains historical financing observations; no current-company financial facts were revalidated in this research.

Next implementation scope: verify the salary pilot's employer records, specify the contract and provenance, then build and review the existing salary route in isolated Preview. Run relevant tests/build and desktop/mobile/no-JavaScript checks after implementation. Apply ownership, Leaders or watchlist workflows only if changing those features. No publication approval is implied by this recommendation.

## Follow-up: how the pay explorer earns search traffic

An additional October 18 Semrush US batch returned `ai product manager salary` at 590 estimated monthly searches / KD 23; `anthropic software engineer salary` 170 / 26; `xai software engineer salary` 40 / 11; `cursor software engineer salary` 40 / 0. `highest paying ai companies` returned 20 / 0, so that phrase alone is a weak acquisition case. Broad `ai engineer salary` and `machine learning engineer salary` each returned 5,400, at KD 64 and 50 respectively. Demand is not incremental traffic: variants overlap and provider counts are estimates with no returned measurement period.

The sampled AI product manager top five included two Medium articles, a recruiter guide, ZipRecruiter and Glassdoor. This supports investigating a role-specific sourced comparison. The generic research engineer sample included a chemical-engineer title page, demonstrating ambiguous intent; do not assume its 170 searches / KD 27 are all AI-related. Comparison query `openai vs anthropic salary` and `ai engineer salary senior` were absent from the batch, not measured at zero. Three sampled city variants each returned only 20, so city filters should serve users before becoming standalone SEO pages. Additional returned usage: 160 units for metrics and 150 for two five-row organic samples.

Proposed acquisition structure, pending duplicate checks and source coverage:

- Company landing pages for Anthropic, xAI and Cursor pay. Each includes the filtered comparison in initial HTML, source-linked observations, methodology and original company analysis. Include software engineer variants within the company page first; do not generate a separate URL for every synonym.
- A substantive AI product manager salary page comparing employers for matched location, level and disclosed pay basis.
- Existing `/ai-salaries/` as the full explorer and internal-link hub. Broader role pages follow when the dataset supports stronger analysis.
- An editorial report on observed advertised pay changes once a real historical dataset exists. Prepare citation-ready findings and downloadable evidence; no outreach is authorized or sent.

Visual: company rows, level columns, title and location filters, and a sequential heat scale for median advertised minimum. Keep actual ranges, listing counts and missing values visible. Rank the selected cohort by a named statistic; never claim the highest ceiling means the best total compensation. Levels require explicit evidence and careful mapping; preserve unmapped roles separately. Cells open dated employer evidence. On mobile, prioritize the selected level as a ranked list rather than shrinking a full matrix.

Index a small curated set of useful landing pages with crawlable links, unique analysis and the comparison rendered without requiring clicks. Keep arbitrary filter states local to avoid generating thousands of URLs. Google guidance supports server rendering/pre-rendering and warns about faceted-navigation crawl growth:
https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
https://developers.google.com/crawling/docs/faceted-navigation

Suggested pilot: explorer plus three company pages and one role page, only when evidence supports each. After release, use Search Console to measure indexed pages, query impressions, clicks and CTR at 28 and 56 days, with an equal-window comparison where available. Track role/location selection, source clicks and repeat use separately from organic acquisition. Expand based on actual query cohorts and evidence coverage. No traffic forecast or ranking promise is established by these keyword samples.

An interactive conversation concept demonstrates filters, sorting and observation details with explicitly fictional employers and invented pay. It is not salary research, a repository component or a published page. Sanitized follow-up metrics and SERPs are saved privately beside the earlier research.
