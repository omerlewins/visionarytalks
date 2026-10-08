# Visionary Talks article template

Entry: `dist/article.html`. Shared brand styles: `dist/styles.css`. Article-specific layout: `dist/article.css`. Sharing, contents tracking and reading progress: `dist/article.js`.

The template includes linked category labels, format label, reading time, breadcrumb navigation, one H1, standfirst, editorial-team byline, published/updated dates, share links, copy-link feedback, desktop sticky TOC, collapsible mobile TOC, key takeaway, sequential H2 sections, charts, accessible chart data, source notes, an advertisement placement, common questions, topic links, author box, related reading, and the existing newsletter preview.

Metadata includes title, description, canonical, Open Graph, Twitter card fields, Article JSON-LD, Organization identities and BreadcrumbList JSON-LD. Visible dates, author and headline agree with structured data. The current editorial-team author is deliberately an Organization; replace with a Person and a real author profile URL if an individual takes the byline.

The article remains a sample concept and is `noindex, follow`. Before editorial launch, replace sample copy/byline, confirm image rights, use the production article and author URLs consistently in canonical/social/schema/share links, set accurate publication dates, remove noindex and add the production URL to the site's sitemap. Related story examples currently link to existing homepage sections. The newsletter is not connected. No ranking or rich-result outcome is implied.

Chart values use Apple FY2023 and FY2025 Forms 10-K already linked on the page. Sources, rounding and the gross-profit calculation are visible. The five-year line chart has a zero baseline and an accessible HTML table. No chart image generation was used.

References consulted:
- https://developers.google.com/search/docs/appearance/structured-data/article
- https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- https://developers.google.com/search/docs/appearance/publication-dates

Validation: checked HTML nesting, IDs and internal targets, referenced local assets, JavaScript syntax, JSON-LD parseability, metadata/date consistency, share URL encoding and chart arithmetic. Browser rendering was not tested: the current buildless static project does not have a compatible managed preview server.
