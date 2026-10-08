# The Leaders — profile template

Route: `dist/leader.html`. Styling: `dist/leader.css`, shared `article.css` and `styles.css`. Reuses `article.js` for sharing, mobile contents, reading progress, and active contents links. Linked from the homepage People section.

The page includes a large illustrated portrait, leader name/role, topic labels, editorial byline, publication date, sharing, four quick stats, a career timeline, source-attributed public quote, company revenue chart, proposed interview questions, author box, related reading, and newsletter preview. Mobile uses a stacked hero, two-column quick stats, and collapsible contents.

Sample: Satya Nadella. Role and background verified against Microsoft's executive biography on October 4, 2026. CEO appointment verified against Microsoft's February 4, 2014 announcement. Financial and workforce figures deliberately use a labeled FY2025 snapshot from Microsoft's FY2025 Annual Report. The interview agenda is proposed editorial material; no interview has been invented.

The profile has canonical/social metadata and Article, Person-subject and BreadcrumbList JSON-LD. The design remains noindex until editorial launch. Replace draft copy and URLs, verify final data and byline, and connect the newsletter before launch.

Portrait: original built-in imagegen illustration at `dist/assets/satya-nadella-illustration.png`; 1122 × 1402 RGBA. Prompt: recognizable respectful Satya Nadella likeness, monochrome engraving and halftone portrait, looking left, dark knit clothing, subtle circuit/server motifs around the shoulders, transparent background, no logos or text.

Checks: HTML nesting, unique IDs, local links/assets, share target URLs, structured-data parsing, JavaScript hooks, revenue chart scale, and image dimensions. Browser rendering was not tested because the buildless static project has no compatible managed preview server.

## Expanded people record — October 4, 2026

`dist/data/satya-nadella.json` stores normalized public profile data with stable person, institution, school, program, company and source IDs. It includes education, typed company relationships, pivotal events and dated net-worth observations. This is a portable data record, not a deployed multi-person database or alumni search service.

Education dates distinguish verified attendance from graduation-only evidence. MIT/Manipal and Mangalore University are retained separately as college and awarding university. UWM has verified year-level attendance, 1988–1990. MIT/Manipal graduation is 1988, and Chicago Booth's Weekend MBA graduation is 1997; unknown start years are null. Do not fill them by assuming standard program duration.

Future cohort queries should distinguish:
- same graduating class: matching institution/school, program, and graduation year;
- potentially overlapping attendance: verified start/end years overlap (year granularity cannot establish exact-term overlap);
- confirmed classmates or acquaintances: separate explicit evidence required.

The current page displays no invented classmates. Corporate relationships distinguish employment, board membership, acquisitions by the employer and partnerships through the employer. Historical board departures are dated; corporate ties are not represented as personal ownership or employment.

Wealth coverage: no verified observations for 2023 or 2024; late-2025 ~$1.1B is a secondary Financial Express report citing Forbes/Bloomberg; October 4, 2026 ~$1.4B is a direct Forbes estimate. These sources are labeled separately on the page and stored with date precision and provenance. Missing values stay null, not zero; the chart does not interpolate or calculate growth. Salary and cumulative compensation are not substituted for net worth.
