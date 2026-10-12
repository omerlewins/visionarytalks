# AI company tracker: first sourced dataset

Checked October 12, 2026. The tracker was empty because the CMS had zero public companies and observations, not because its filters hid existing data.

Five records now have descriptions, verticals and company-reported financing valuation observations:

| Company | Observation date | Valuation | Primary record |
|---|---|---|---|
| Anthropic | 2026-02-12 | $380B | [Series G announcement](https://www.anthropic.com/news/anthropic-raises-30-billion-series-g-funding-380-billion-post-money-valuation) |
| Cursor | 2025-11-13 | $29.3B | [Series D announcement](https://cursor.com/blog/series-d) |
| ElevenLabs | 2026-02-04 | $11B | [Series D announcement](https://elevenlabs.io/blog/series-d) |
| Glean | 2025-06-10 | $7.2B | [Series F announcement](https://www.glean.com/press/glean-raises-150m-series-f-at-7-2b-valuation-to-accelerate-enterprise-ai-agent-innovation-globally) |
| Harvey | 2026-09-09 | $15.5B | [September financing](https://www.harvey.ai/blog/harvey-raises-dollar550m-at-a-dollar155b-valuation-to-help-legal-teams-own-their-intelligence) |

Sources were opened and checked. These are historical financing observations, not a claim to have found every company’s latest valuation. They do not establish public share prices, founder wealth or available investment opportunities. The seed preserves USD units, ISO dates, source notes and the difference between cash raised and valuation. Cursor’s funding-round valuation must not be relabeled as later acquisition consideration.

## CMS and environments

Data lives in the existing **Companies**, **Observations** and **Sources** collections. `app/scripts/sync-company-tracker.ts` dry-runs by default, refuses conflicting unmanaged companies, and saves a private backup before `--apply`. It is guarded to the existing isolated Preview project. Production is unchanged.

Production must receive reviewed records during the authorised launch migration; do not silently substitute fixture values or expose draft investigations there. The homepage block and navigation link hide when no company records are available. The saved direct tracker URL still explains that research is being prepared instead of claiming filters caused the empty dataset.

Company rows retain a published CMS profile link where available. In isolated Preview, a known ownership review file can also be linked; unavailable profiles are not invented. The default table shows the most recent dated observation for each company, while expanded rows retain the observation notes.

Validation: 53 tests and the full build passed. Real Preview CMS browser checks confirmed five tracker rows, four homepage rows, all five source links, descriptions and ownership links, search, vertical filters, date/value sorting and layouts at 390, 768 and 1440 pixels. Mobile tables retain horizontal scrolling with an explicit hint.
