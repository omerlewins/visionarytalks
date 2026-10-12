# Pre-launch URL migration audit

Checked October 12, 2026 against the live site’s five XML sitemaps and public WordPress posts/pages API. The review uses the isolated Preview content database. No domain or Production content changes were made.

## Content inventory

- 129 unique live sitemap URLs: 100 articles, 8 pages, 21 category/tag/author archive URLs.
- All 100 articles have matching original paths and migrated CMS records.
- Two editorial pages have migrated CMS records. Homepage and Hot Posts use their replacement site routes.
- Article/page source-word coverage against migrated legacy HTML was at least 99.56%; no record fell below the audit’s 97% discrepancy threshold. This is a migration completeness check, not a fact-check of the reporting.
- The four retired WordPress utility paths now permanently redirect to the homepage: `/coming-soon/`, `/redirect-page-2/`, `/sample-page/`, `/my-account/`. The first two contain no public editorial body, Sample Page contains WordPress installation boilerplate, and My Account contains an inactive WooCommerce shortcode. The live account page showed no login or registration form. These are intentional redirects, not migrated editorial pages or a new reader-account system.
- A live article links to `/how-many-millionaires-in-the-us/`, outside the sitemap inventory. Preserve that link with a permanent redirect to the existing `/millionaires-by-state/` investigation.

## Verification

The corrected local build resolved all 129 sitemap URLs with no failures. All 171 referenced image URLs returned valid image responses, and none depended on the old `visionarytalks.com` image host. Desktop/tablet/mobile checks passed at 360, 390, 768 and 1440 pixels; all 46 tests and the production build passed.

The private audit contains per-URL status, final path, heading, canonical, matching CMS ID and source-word coverage. It also checks image URLs actually referenced by rendered pages, rejecting broken responses, non-image content and continued dependence on the old domain. Media API HEAD responses may be unsupported, so an image GET is used before classifying failures.

Private evidence: `private/growth/live-url-audit.json`. Responsive screenshots: `private/growth/launch-qa/`. Re-run the audit against the final deployed Preview after pushing, then again before the domain cutover if WordPress content changes.

## UI changes

Homepage careers now presents three salary investigations and a compact cash/equity/benefits graphic instead of stretching alongside the full salary archive. Muted gold, blue and sage accents follow the Who Owns palette. Duplicate title-as-description copy is omitted from story cards.

Who Owns includes an accessible company suggestion form. It composes an email to the owner-provided `daniel@visionarytalks.com`; the reader must send it from their mail application. It does not claim to save a server-side submission or verify mailbox delivery.

## Limits before launch

URL parity and content preservation do not constitute editorial approval or a Production cutover. Research profiles and investigations continue to obey their publication gates. This audit does not migrate a WooCommerce store or user accounts. Vercel domain configuration and Production indexing settings remain unchanged.
