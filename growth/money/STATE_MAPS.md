# State wealth maps

The shared `StateWealthMap` renders the Census-derived geographic paths in `app/src/data/us-state-wealth.json`. All 50 states and Washington, DC are included, with Alaska and Hawaii in Albers USA insets. A state picker and small-state buttons complement pointer and keyboard interaction. The full source table remains accessible.

## Data contract

- Billionaires: Visual Capitalist / Voronoi’s Forbes residence dataset, accessed July 24, 2025. https://www.voronoiapp.com/wealth/Where-Americas-Billionaires-Live-Mapped-by-State-6072
- Total: 871 across the 50 states plus DC. Exclude the source’s 26 citizens abroad and its Puerto Rico and US Virgin Islands entries. Mississippi is 2, correcting the legacy article’s unsupported 8. Zero counts are observations, not missing values.
- Millionaires: Windfall’s April 2026 estimates, published April 29, 2026. https://www.windfall.com/blog/what-it-takes-to-be-in-the-top-1-of-every-state
- All 51 counts and household denominators were checked against the primary Windfall HTML. The total is approximately 21.79 million households. Net worth includes home equity and subtracts liabilities. It does not measure individuals or solely investable assets. Shares are calculated from rounded inputs and displayed to one decimal.
- Research checked October 11, 2026. Never relabel these snapshots as current 2026 billionaire counts or live data. Update dates, source records and the entire dataset together.

## Top 1% household thresholds

`/top-1-percent-net-worth/` uses the same geographic component in `topOnePercent` mode, plus the shared `EditorialChart` for the three highest and three lowest states. All 51 published minimum household net worth figures were extracted from Windfall's primary state sections; the source was reopened October 12, 2026. Snapshot: April 2026, published April 29. Exact source dollar values are retained in the expandable map table; chart labels round to $0.01 million. Hawaii is $21,518,000; Mississippi is $2,940,000, a 7.3× ratio. DC is present on the map and excluded from the comparison of 50 states.

These are Windfall proprietary model estimates, not official thresholds or an individual percentile calculator. Their sample excludes certain groups, including students, ADU residents, transient residents and unhoused people. Net worth includes home equity less liabilities. Do not blend this state dataset with the article's Federal Reserve national household estimates or Knight Frank adult estimates. Existing CMS article text and tables are preserved; this work verifies the new visual dataset, not every inherited article claim. No CMS write or Production publication was performed.

## Geometry

US Atlas v3 `states-albers-10m.json`, derived from US Census Bureau 2017 cartographic boundaries. https://github.com/topojson/us-atlas

Decoded shared TopoJSON arcs into SVG paths, retaining the 975×610 equal-area projection. Geometry is bundled, so the interactive map makes no external requests or exposes credentials. License is retained beside the data.

## Legacy correction

`correctedStateWealthHTML` corrects Mississippi’s source count, count-table ordering, density top-ten row and explanatory paragraph before the legacy table/chart renderer runs. The original CMS HTML is preserved for audit. This correction applies only to the billionaire article path.
