# October 18, 2026 pay explorer review

## Implemented

An isolated Preview explorer using real public employer-board records: 34 distinct jobs across Anthropic, OpenAI, the xAI-hosted board and the Cursor-hosted board; 29 salary ranges and five undisclosed ranges. The five undisclosed observations are retained rather than estimated.

The interface includes job-family and exact-title search, listed location, explicit title level, company and pay-definition controls; a company-by-role heatmap; selected-role mobile comparison; job-source drawers; current-filter CSV with job URLs; and a complete server-rendered source ledger. Existing company salary articles remain intact, with an added jump link and explorer module in Preview. The existing main salary route and a new product-manager view supply discovery links and tailored metadata.

## Evidence actually retrieved

- All four public feed responses returned HTTP 200. Counts: Anthropic 655, xAI-hosted 304, OpenAI 813, Cursor-hosted 133. These are returned feed totals, not counts researched in the pilot.
- The 34 selected records' exact titles, pay fields and locations were extracted from those primary feeds. All 34 direct job-page requests returned HTTP 200 and were archived privately with retrieval timestamps and hashes.
- Ashby HTML can be a JavaScript shell; numerical evidence comes from its employer posting API, not the empty web-reader page.
- The Anthropic Billing and xAI-hosted Exceptional Software Engineer pages were also opened in the web reader. Their observed pay/attribution matched the retrieved feeds.
- Source labels in the public records preserve the actual salary definition. No unqualified annual-salary range is promoted to verified base salary.

## Material limitations

This is a bounded convenience sample, not a market or employee census. The explicit title-level mapping is intentionally sparse. Related titles have different responsibilities, and shared multi-location ranges are not separate city estimates. A higher sampled median advertised minimum is not proof of better total compensation.

Source identity changed: the xAI-hosted records identify SpaceXSI, while sampled Cursor-hosted descriptions include SpaceXSI/SpaceXAI branding. These limitations are shown in the interface; corporate ownership and unchanged legal employer are not inferred. Cursor's sampled feed records disclose no pay. Existing legacy salary article bodies were preserved and were not comprehensively fact-checked as part of adding this module; they need a coordinated editorial review before publication integration.

There is one observation date, October 18. No salary change history, employee sample size, bonus/equity valuation or real-time vacancy promise is claimed. No refresh automation is running. The importer is specific to this snapshot and must not stamp October 18 onto future captures.

## Checks

- `npm run validate:salaries`: passed, 34 structurally valid source-linked records and five null ranges.
- `npm test`: passed, 87 tests including new data-integrity, pay-basis, median, filtering and Production-isolation cases.
- TypeScript: passed before build.
- Local browser: passed hub and four landing routes, noindex, filters, exact-title search, missing-pay and single-company states, CSV source links, complete 34-source ledger, 390px layout and reading without JavaScript. Filter accessible names were corrected during this check.
- Individual job URL capture: 34/34 HTTP 200. This is availability at observation, not a guarantee the listing remains open.
- Build: passed using the existing guarded isolated Preview configuration. The hosted Vercel build also passed, including TypeScript. Existing dependency/configuration warnings were emitted; no unrelated dependencies were changed.
- Browser checks on the built application with actual isolated CMS content: passed the same five routes and desktop/mobile/no-JavaScript checks. Existing company articles retain their original body and one H1, with the explorer appended as a section.
- Hosted Preview: deployment `dpl_J93oAAZp89mYVVHZb2H6VR1H5Fyu` reached READY, with Vercel Authentication retained. Seven URL variants (five routes plus no-slash and query variants of the hub) returned 200 through authenticated Vercel read access. Each returned the complete 34-source ledger, noindex and a clean intended canonical. Raw HTML and results are private in `tracker-research/hosted/`.
- Production configuration rehearsal on the isolated database: passed. None of the five routes exposes the new review module or source ledger; the new role draft returns 404. The actual Production database was not accessed by this check.

Preview: https://visionarytalks-n0ukfw6xj-omer-webielcoms-projects.vercel.app/ai-salaries/

The protected Preview is ready for review, not indexed publication. Existing salary articles need their own coordinated editorial refresh before a later Production integration. The new dataset remains a review snapshot; its publication validator intentionally refuses approval.

No production content, CMS research records, database schema, production indexing, outreach or recurring task was changed.

## Expanded revision requested October 18

The owner requested broader coverage and better UX/UI. This revision replaces the Preview snapshot, not Production content. The initial pilot remains archived privately, and its checks above describe only that initial revision.

Current coverage is 12 boards and 310 selected listings across six title families. Direct ranges: 233; USD location-tier disclosures: 25; no disclosed pay: 48; source-extraction review: four. Company coverage: Anthropic 44, OpenAI 67, xAI-hosted 21, Cursor-hosted 18, Perplexity 25, Cohere 26, ElevenLabs 16, Harvey 26, Mistral AI nine, Runway six, Together AI 19 and Glean 33. These are bounded selected records, not all jobs advertised by each company.

All 12 feed requests returned 200; their responses contained 3,136 jobs in total, of which only the selected 310 enter this feature. All 310 selected job URLs returned 200 and were captured privately with timestamps/hashes. Salary evidence comes from employer feeds and disclosure sections, not inferred market pay. Four extraction-review cases remain null: the OpenAI Privacy record's nonpositive lower bound and three Together AI disclosures with ambiguous omitted multipliers.

Cohere's USD geography tiers now resolve only where an explicit tier matches the selected listed US city. Canadian pay is excluded from the USD view rather than blended or converted. All-geography and remote/nationwide selections do not silently choose a city tier. OTE has its own comparison definition. Technical-staff job naming no longer manufactures a Staff seniority classification.

The redesigned interface provides a compact primary search/filter bar, secondary filter disclosure, company summary range bars, a six-role heatmap, up-to-three-company comparison, paginated source job cards, CSV exports and validated fragment-based share links. Source and methodology ledgers use native disclosures to keep the initial page compact while preserving every record in server-rendered HTML. Salary-feature pages have a compact publication masthead; other site pages are unaffected.

Expanded validation and all 89 tests passed. The expanded browser harness passed comparison-limit feedback, filter restoration from copied views, malformed fragment handling, heatmap-to-job drill-down, correct Cohere US tiers, pagination, CSV sources, five routes, 390px/320px layouts and no-JavaScript access to all 310 sources. The harness also passed against the built application with actual isolated CMS articles. Evidence is private under `pay-expanded/qa/`.

The local build and final hosted build passed, including TypeScript. The final small UX pass promotes pay definition into the primary filter area rather than hiding it in advanced filters. Both the final browser checks and final TypeScript pass succeeded. A Production-configuration rehearsal on the isolated database again confirmed no pay-review module is exposed on any of the five routes and the new role route returns 404. No Production database was accessed.

Final expanded Preview: https://visionarytalks-3mr0d3a3c-omer-webielcoms-projects.vercel.app/ai-salaries/

Deployment `dpl_GY7cTLFwbxbFitsmMbXcHimD44Wo` reached READY with Vercel Authentication retained. Seven hosted URL variants returned 200 through authenticated Vercel read access. Every variant contained the complete 310-source ledger, the primary pay-definition control, noindex metadata and a clean intended canonical. Verification results and HTML are private under `pay-expanded/hosted/`. The preceding expanded candidate remains a recoverable Preview at `visionarytalks-3ymptfmt0-omer-webielcoms-projects.vercel.app`; the original four-company pilot remains separate.

The expanded feature remains review content. No CMS records, Production routing, production indexing, database schema, outreach or recurring tasks were changed. Existing legacy company article bodies still require coordinated editorial review before a deliberate later Production integration.

## Owner-authorized public release and menu integration

The owner subsequently asked to “push and add it somewhere in the menu.” This is the deliberate publication instruction for the accepted explorer. The shared desktop/mobile navigation now labels its existing salary destination **AI Salaries**, replacing the unclear Charts & Data label.

The immutable public snapshot retains all 310 dated job observations, 233 direct ranges, 25 location-tier disclosures, 48 undisclosed ranges and four unresolved numeric records. The latter remain null and have source-limitation wording rather than internal drafting instructions. The snapshot and source ledger are content-hash bound by `PUBLICATION_REVIEW.json`. Publication validation rejects review data, modified salaries, substituted paths and a missing unresolved-number ledger.

Only `/ai-salaries/` and `/ai-product-manager-salary/` are released, with clean canonical URLs, Production indexing and sitemap entries. Legacy company salary article bodies and metadata are preserved in Production; their Preview research appendices are not part of this release. No CMS/database changes or source-history refresh are performed.

The remote branch had advanced with other work. It was merged cleanly before the release; the younger-billionaires and KD10 article work is preserved. The new rollout explicitly disables unrelated build-time CMS synchronization/import hooks. The live deployment before this release was recorded privately as `dpl_GdigCNzw19oR9weRyymQHarQViG4` (`visionarytalks-c7hv2k3xx-omer-webielcoms-projects.vercel.app`) for rollback.

After the merge, all 94 tests and the salary publication validator passed. Production-config rehearsal, candidate/live verification and final deployment results will be recorded below after execution.
