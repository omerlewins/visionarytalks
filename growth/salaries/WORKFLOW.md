# AI pay explorer

## Authorized publication integration — October 18

The owner explicitly requested pushing the explorer and adding it to the menu. The accepted public snapshot is now separate in `app/src/data/pay-explorer-published.json`; `PUBLICATION_REVIEW.json` binds its exact content hash, source-manifest hash, two public routes and four unresolved numeric IDs. `npm run validate:salaries -- --publish` validates that exact release. It does not approve the mutable review dataset.

Public scope is `/ai-salaries/` and `/ai-product-manager-salary/`, discovered through the **AI Salaries** desktop/mobile menu and sitemap. The legacy Anthropic, xAI and Cursor salary articles retain their existing Production content; their appended research modules remain Preview-only. No CMS write or database migration is part of this integration.

`pay-content.ts` serves only the validated published snapshot on the two public routes. Production environment flags still cannot expose a company-page review module. Future source or copy changes require a new isolated review and separately recorded release; do not change the release hash merely to make a validator pass. Publication may retain sourced job observations with unknown pay: the four ambiguous numeric records remain null, carry public-facing source limitations and never enter a pay comparison.

The remaining workflow below documents the source/review process and the original Preview boundary; this explicit integration supersedes its statements that no public salary release exists.

The current October 18 expanded revision is isolated Preview research using `ai-pay-v1`: 12 employer boards, 310 distinct selected listings and six title families. It preserves the original four-company pilot privately; the initial review below remains a historical record. Neither snapshot is approved Production content or an employee-pay survey.

## Reproducible source capture

The reviewed board registry is `app/src/data/pay-source-boards.json`. `SOURCE_MANIFEST.json` records the primary feed URLs, retrieval timestamps, capture SHA-256 values, selection method and listing IDs. The current raw feeds, extraction review and 310 individual job-page captures are private under `private/growth/2026-10-18/pay-expanded/`. The first pilot's raw feeds and page captures remain separately under `pay-sources/`, with its original data preserved as `pay-expanded/initial-pilot.json`.

Ashby job HTML can require JavaScript; its employer posting API supplies structured salary tiers, title and location evidence. A successful HTTP request establishes availability at that observation, not current vacancy status. Do not substitute a third-party salary estimate for absent employer disclosure.

From `app/`, rebuild the explicitly dated saved snapshot:

```powershell
./node_modules/.bin/tsx.cmd scripts/build-pay-explorer.ts
npm run validate:salaries
npm test
npm run build
```

The builder verifies capture hashes and dates before extracting data. It selects up to 12 matching US-location records per employer/title family in saved feed order, excludes internships and engineering management, and retains the original Anthropic Tokens evergreen observation. It does not fetch, schedule or publish anything. For a future date, retain this baseline and create a newly dated capture, manifest and reviewed source delta. Never stamp October 18 onto a later source capture.

## Pay and geography rules

- Preserve the exact job title, source-listed location text, source ID/URL, observation date and source edit/publication timestamp.
- The six editorial title families are software engineering, research engineering/science, ML engineering, product management, data science and solutions/deployed engineering. Preserve exact titles because related jobs are not equivalent responsibilities.
- Only explicit senior/staff/principal/junior/new-graduate wording creates a title-level group. `Member of Technical Staff` is not itself a Staff level. Titles naming multiple levels remain a separate multiple-level group. Years of experience do not establish internal levels.
- Keep explicit base salary, annual salary with an unconfirmed base-only definition, and OTE separate. OTE includes variable pay. Never value equity, add bonuses, infer total compensation or mix financing values with pay.
- Missing disclosure, multiple geography tiers and extraction-review gaps are different states. Retain null numeric bounds until a single valid annual USD range applies. Keep all three gap labels visible.
- Retain USD annual source tiers only. Do not blend CAD and USD, convert currencies, or use an employer's broad summary component when the actual location tiers differ.
- Cohere explicitly labels a US California/New York/Washington tier; it can resolve to the listed cities in those states. All-locations and broad US remote selections do not silently select that tier. Tier resolution must not mutate the underlying source observation, and exports preserve the selected tier.
- A single range covering several cities stays a shared advertised range, not a separately verified city-specific estimate. One listing counts once per selected view. US remote/nationwide and other-US groups are too broad for a city ranking.
- Median lower and upper advertised endpoints are calculated separately within the same role/definition/cohort. Their resulting pair need not be an actual offer. A company comparison is a sample description, not typical employee earnings or an employer-quality score.
- Do not guess missing multipliers in ambiguous salary shorthand. The current source-review gaps include three Together AI shorthand disclosures and an OpenAI Privacy salary component with a nonpositive lower bound; none enters a numeric comparison.
- Exclude evergreen expressions of interest by default. Source edit/publication timestamps are not salary-change dates. One snapshot establishes no trend.
- Preserve source identity limitations: the xAI-hosted listings identify SpaceXSI, while sampled Cursor-hosted descriptions contain SpaceXSI/SpaceXAI branding. Board attribution is not a corporate ownership finding.

## Interface and SEO

The explorer has a compact title/role/location bar with additional company, title-level, pay-definition and evergreen controls. Result views provide ranked company sample summaries, a six-role heatmap and paginated job evidence. Up to three companies can be selected for a side-by-side comparison. CSV exports include all matching jobs, sources, definitions and selected location tiers, rather than just the visible page. Source drawers retain employer links and limitations.

Filtered-view links use validated URL fragments. They do not create new indexable query/filter pages. The complete source ledger is server-rendered inside a native disclosure: it remains accessible without JavaScript while avoiding hundreds of permanently expanded rows. Methodology disclosures also work without JavaScript. Source evidence is not removed by client filters.

The existing `/ai-salaries/` route hosts the explorer in Preview. Existing `/anthropic-salary/`, `/xai-salary/` and `/cursor-salary/` CMS articles retain their original bodies and receive a jump link plus appended source module. Do not create competing company salary URLs. `/ai-product-manager-salary/` is the separate curated role view. Preserve canonical URLs, noindex review metadata and the original company article H1.

There is no new API, CMS write, database migration, recurring task, outreach or production sitemap integration. `payReviewEnabled` blocks this research when either Production environment indicator is set, regardless of demo/Preview flags. The publication validator refuses this review snapshot. A later deliberate Production integration must review current sources, original legacy salary copy, indexing, sitemap and internal linking together.

## Verification

Run validation, unit tests, TypeScript, build and the actual-page browser checks after substantive changes. From the repository root:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='C:/Users/Omer/AppData/Local/ms-playwright'
$env:PAY_PREVIEW_URL='http://127.0.0.1:3136'
node growth/salaries/check-pay-preview.cjs
```

The browser harness checks comparison limits, six-role heatmap drill-down, restored share filters, invalid share hashes, Cohere USD location resolution, pagination, CSV sources, all five page routes, 390px/320px layouts and complete no-JavaScript source access. Record actual source gaps and check outcomes in the review; passing structural checks cannot certify external facts.
