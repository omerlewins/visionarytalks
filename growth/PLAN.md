# Growth plan

Decision date: October 9, 2026. Execution clock starts at actual production launch, not at the briefing's old migration date.

## Baseline and implications

The supplied Search Console page export reports 4,814 clicks and 1,081,426 impressions across 206 distinct URLs for **Last 3 months / Web**. The sum is for exported rows, not a verified property-wide total. Clicks are not sessions. Average page positions aggregate many queries; they are not head-term rankings. Some paths appear under distinct query-string or URL variants. The operating queue groups identical full URLs; canonical consolidation requires a separate check.

| Page | Clicks | Impressions | Exported average position | Decision |
| --- | ---: | ---: | ---: | --- |
| `/millionaires-by-state/` | 691 | 54,876 | 5.99 | Protect the strongest observed page; verify methodology and arithmetic |
| `/who-owns-mcdonalds/` | 471 | 120,359 | 6.80 | Review shareholders evidence, clarify company versus restaurant ownership |
| `/who-owns-fiji-water/` | 391 | 112,411 | 6.68 | Improve the September refresh's evidence and focus; avoid a cosmetic date update |
| `/leopold-aschenbrenner-net-worth/` | 376 | 42,429 | 7.51 | Check valuation assumptions, ownership evidence and personal-wealth uncertainty |
| `/who-owns-7up/` | 212 | 105,355 | 5.98 | Maintain the US/international split; examine query-level clicks before another rewrite |

The five leading rows contribute 44.5% of exported clicks. Ownership-like URLs contribute 3,282 clicks, about 68.2%. Ownership remains the acquisition engine, but the wealth-data winner makes Money a real existing audience rather than a future hypothesis.

The briefing's 2,362 keywords and 14.3K September estimated monthly visits use a different source, scope and period. They cannot be reconciled with this export without the original reports. The 100K monthly organic-visit goal for Q4 2027 is an ambition, not a validated forecast. Reforecast after the first complete postlaunch month using actual organic sessions and GSC clicks separately.

Existing migration audit: 129 of 206 sampled URLs returned 200 on staging and 161 on live. Different aliases, redirects, archives and malformed URLs mean this is not a 77-article-loss count. The missing `/aya-new-york-and-valuebase-head-to-court/` has 12 exported clicks; `/contact-page/` has one. Resolve every meaningful URL's intended disposition, using the existing migration gate. Avoid redirecting unrelated missing pages to the homepage.

## Four connected hubs

Keep **Ownership / Salaries / Money / Leaders**. Add the Salaries descriptor **Base pay, compensation and CEO pay**; use filters to distinguish those datasets. Distinguish hub membership from the existing template kind: a Money research story can use the general article workflow.

| Hub | Reader job | Product | First focus | Refresh trigger |
| --- | --- | --- | --- | --- |
| Ownership | Find the legal owner and who controls it | Brand/entity/parent map, source-linked timeline | Existing consumer brands; then retail and sports | Closed acquisition, restructuring, filing or disclosed stake change |
| Salaries | Compare pay on a defined basis | Comparable observations with role, geography, period and sample | AI labs, then quant finance | New DOL release, material source correction, proxy publication |
| Money | Understand earnings and business economics | Revenue/ARR/profit observations, methods and maintained tables | Existing wealth research; AI company tracker and business models | New earnings, funding disclosure or dataset release |
| Leaders | Understand a person's economic influence | Roles, disclosed stakes, dated estimates and valuation scenarios | Existing net-worth pages; founder-linked profiles | Verified role change, financing, exit or estimate revision |

Proposed new landing pages: `/ownership/`, `/salaries/`, `/money/`, `/leaders/`, subject to path-collision checks before implementation. The current build already has `/ai-companies/` and `/ai-salaries/`, but it does not yet implement four research hubs. Keep those tracker routes. Keep all ranked story paths and legacy archive routes.

Each hub needs a count derived from real approved records, scoped search, filters, a sortable accessible table, articles sorted by **editorially verified date**, methodology and source links. Existing `updatedAt` includes imports and template changes and must not become a verification stamp. Add an explicit `verifiedAt`, reviewer and change history before promising verification sorting. None of these product requirements is claimed as shipped by this plan.

Ownership filters: Food and Beverage, Retail and Grocery, Sports Teams, Fashion and Luxury, Tech and AI, Travel. Filters are views within the hub, not new prefixes on article URLs. Index a filter landing page only after it offers useful unique content; avoid thin faceted pages.

## First 90 days after launch

| Window | Work | Evidence needed to advance |
| --- | --- | --- |
| Before launch | Save GSC query/page/date/country/device exports; analytics baseline; approve sources/bylines/contact policy; close migration gates | URL/metadata parity, production indexability, source review and rollback readiness |
| Days 0–14 | Observe indexability and redirects daily; release the first-cycle revisions only after review; finish two retail stories | Correct 200/canonical/indexability behavior; no unresolved factual claims in published copy |
| Days 15–30 | Implement Ownership and Money hub requirements; draft Lakers/Temu if live research supports them; inspect first-cycle query data | Query-level opportunities, accurate primary-source ownership, real hub records |
| Days 31–60 | Pilot AI salary dataset and methodology; update the existing AI-company tracker; produce the next retail/sports pack | Reproducible dataset, deduplication, comparable metrics, editor capacity |
| Days 61–90 | Release a useful original-data report; complete Salaries and Leaders hub structure; review conversion and links | Approved author/methods, citable tables, real audience demand and earned links |

After this first cycle, a sensible capacity is two refreshes, two new stories and one dataset update per cycle. This is a proposed operating rhythm, not a scheduled automation. Quality and review capacity set the throughput; do not commit to 235 new pages before evaluating the pilot.

## Next moves in order

1. McDonald's and Fiji revision proposals; millionaire-table methodology sample.
2. Costco and Aldi: strong historical briefing opportunities, pending fresh demand and full ownership sourcing. Search the full CMS and live site before reserving a new slug.
3. Existing 7UP, Canada Dry, Aschenbrenner and Ben & Jerry's: compare query cohorts and source changes before changing text.
4. Lakers and sports ownership; Temu/Shein and luxury only after fresh SERP/volume checks and source review.
5. AI salary database and maintained ARR tracker. Aggregate tiny startup terms in the tracker; split into articles when demand or distinct reporting warrants it.
6. Higher-competition TikTok, Walmart and Netflix: at most one evidence-rich seed article per later pack; scale after demonstrating links and ranking traction. KD 35 is a historical heuristic, not a proven authority boundary.

Treat the briefing's SpaceX IPO claim and other deal/valuation assertions as research leads. Do not carry them into copy without verifying current primary evidence. No PR outreach is authorized in this cycle. Prepare citation-friendly data and a report; sending pitches is a later explicit action.

## Measurement and decisions

Save an immutable baseline at launch and at each publication/revision. Review at 7 days for technical/indexing failures, 28 days for directional search response and 56 days for a sustained outcome. Compare equal completed windows with identical filters and inspect year-over-year seasonality where available. Log migration changes separately from content revisions; neither correlation nor a two-page anecdote proves causation.

Track GSC clicks/impressions/query CTR/position by cohort, organic sessions, hub-to-story clicks, newsletter conversions only after the real integration exists, cited referring domains and source/review completion. Use DataForSEO for sampled SERPs, estimated demand and competitors, never as a substitute for first-party visits.

Decision rule: material factual changes trigger immediate reviewed correction; technical failures trigger repair; a page with rising impressions but low CTR gets query/SERP examination before title changes; unchanged facts and stable performance require no timestamp-only refresh. Run the next research batch only after resolving the current cycle's source gaps.
