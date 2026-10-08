# Company ownership article template

Example route: `/who-owns-cursor.html`.
Homepage entry: `index.html#ownership`.

## Reusable page design

Use this template for “Who owns [company]?” articles. Keep the answer near the top and distinguish the product, legal entity, parent, investors, and people. The Cursor page is the first populated example, not a blank placeholder.

1. Breadcrumbs, ownership category, format label, H1, dek, writer, update date, reading time, share controls.
2. Company identity panel using typeset brand names, plus four quick facts.
3. Direct ownership answer with a source and an as-of date.
4. Responsive ownership diagram with relationship labels.
5. Founders or relevant leaders, separate from an ownership table.
6. Dated acquisition/funding timeline.
7. Clearly labeled advertisement slot after the timeline.
8. Sourced financial chart, units, zero baseline, interpretation, and accessible data table.
9. Historical investors; use precise percentages only when disclosed. Never infer control from an investor list.
10. FAQs, source list and methodology, topic links, writer box, repeated share controls, related company stories, newsletter.

## Files and editing

- `dist/who-owns-cursor.html`: generated, self-contained static page.
- `dist/ownership.css`: reusable page modules and responsive rules.
- `dist/data/cursor-ownership.json`: entity IDs, relationships, dated figures, source records, founder names, and milestones.
- `scripts/build-ownership.py`: builds the populated Cursor example and reuses the article masthead, writer box, and newsletter.
- `dist/ownership-home.css`: homepage company-file cards and typographic career feature.

Rebuild with `python scripts/build-ownership.py dist/data/cursor-ownership.json` from the repository root. For a different company, duplicate the JSON record and adapt the editorial prose in the generator as well: the example's acquisition date, short-answer heading, FAQs, source anchors, related links, and chart interpretation are intentionally company-specific. Changing the name alone does not produce a publication-ready story. When integrating a CMS, expose these narrative sections and metadata as per-entry fields and keep the visual modules shared.

## Suggested CMS fields

| Group | Fields |
| --- | --- |
| Identity | companyId, brand, legalEntity, parent, ownershipStatus, sector, founded |
| SEO | slug, title, description, canonical, publishedAt, updatedAt, authorId |
| Answer | shortAnswer, ownershipAsOf, sourceIds |
| Ownership | entities, relationships, relationshipType, disclosedStake, stakeAsOf, sourceIds |
| People | personId, name, historicalOrCurrentRole, profileUrl |
| Financials | metricName, units, period, value, sourceId, reportedOrCalculated |
| Editorial | dek, bodySections, timeline, FAQ, methodology, relatedCompanyIds |
| Evidence | sourceId, URL, publisher, publicationDate, reviewedAt |

Unknown stakes stay null, never zero. Private-company funding valuation, public market capitalization, deal value, revenue, and ARR are separate metrics.

## Current sample and evidence

- Ownership completion: Cursor's August 14, 2026 company announcement.
- Legal entity and founding team: the user-supplied Visionary Talks reference article.
- June 2025 valuation $9.9B and funding $0.9B: Cursor's June 6 announcement.
- November 2025 post-money valuation $29.3B and funding $2.3B: Cursor's November 13 announcement.
- $60B all-stock deal: Reuters, June 16, 2026. Kept separate from the financing chart.
- Chart bars use a shared $0–30B scale. Dates are snapshots, not an interpolated trading history.
- Text and editorial-team byline are sample copy. The page is `noindex,follow`; no unverified personal author biography is used.
- Article and BreadcrumbList structured data, social text metadata, canonical, and accessible source links are included. Remove preview status and set real publication metadata only on editorial publication. No social-preview image was generated.

## Homepage and imagery

Cursor links to the local new template. Lovable and Base44 link to their existing Visionary Talks reports. Apple links to the existing local business-model sample. Labels identify these destinations.

The homepage no longer uses Apple-store or workplace photography. It retains the previously approved illustrated hero and four illustrated leaders. Ownership graphics and the career equation are HTML/CSS typography and functional diagrams. Company names are editorial references; these panels do not claim to reproduce official logos.

## Layout and advertising

Desktop: split headline/company cover, four-column facts strip, left TOC, main article, right company facts. Tablet/mobile: stacked cover, two-column facts strip at narrow widths, expandable TOC, single reading column, single-column related stories.

Advertisement: one clearly labeled in-article placement after the timeline. Keep any sponsorship outside the direct answer, ownership graph, chart, and sources. Newsletter remains a disclosed, unconnected design preview.
