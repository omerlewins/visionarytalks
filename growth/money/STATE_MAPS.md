# State wealth maps

The shared `StateWealthMap` renders the Census-derived geographic paths in `app/src/data/us-state-wealth.json`. All 50 states and Washington, DC are included, with Alaska and Hawaii in Albers USA insets. A state picker and small-state buttons complement pointer and keyboard interaction. The full source table remains accessible.

## Data contract

- Billionaires: Visual Capitalist / Voronoi’s Forbes residence dataset, accessed July 24, 2025. https://www.voronoiapp.com/wealth/Where-Americas-Billionaires-Live-Mapped-by-State-6072
- Total: 871 across the 50 states plus DC. Exclude the source’s 26 citizens abroad and its Puerto Rico and US Virgin Islands entries. Mississippi is 2, correcting the legacy article’s unsupported 8. Zero counts are observations, not missing values.
- Millionaires: Windfall’s April 2026 estimates, published April 29, 2026. https://www.windfall.com/blog/what-it-takes-to-be-in-the-top-1-of-every-state
- All 51 counts and household denominators were checked against the primary Windfall HTML. The total is approximately 21.79 million households. Net worth includes home equity and subtracts liabilities. It does not measure individuals or solely investable assets. Shares are calculated from rounded inputs and displayed to one decimal.
- Research checked October 11, 2026. Never relabel these snapshots as current 2026 billionaire counts or live data. Update dates, source records and the entire dataset together.

## Geometry

US Atlas v3 `states-albers-10m.json`, derived from US Census Bureau 2017 cartographic boundaries. https://github.com/topojson/us-atlas

Decoded shared TopoJSON arcs into SVG paths, retaining the 975×610 equal-area projection. Geometry is bundled, so the interactive map makes no external requests or exposes credentials. License is retained beside the data.

## Legacy correction

`correctedStateWealthHTML` corrects Mississippi’s source count, count-table ordering, density top-ten row and explanatory paragraph before the legacy table/chart renderer runs. The original CMS HTML is preserved for audit. This correction applies only to the billionaire article path.
