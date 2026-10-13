# Home-page and navigation placement

Added 2026-10-13 following the user's request to feature the watchlist beneath Leaders.

- A warm editorial feature in the home-page Leaders section uses six existing AI portraits, stable person anchors, an article CTA and a nomination link.
- Desktop Leaders navigation has a native details submenu; mobile navigation has an indented watchlist item and retains the Leaders index.
- Both placements use the article's existing Preview eligibility guard. This change does not approve or publish the article, add it to the Production CMS or create a public sitemap entry.
- The shared footer links to the official LinkedIn URL supplied by the user. Pinterest, Facebook, Instagram and X/Twitter are labelled Coming soon and have no invented links.
- Official account URLs are configured in `app/src/lib/publication-socials.ts`; replacing a null with a verified URL makes the platform clickable.

Watchlist validation, TypeScript, the 66-test suite and optimized build passed. Actual Next.js browser checks at 1440px and 390px confirmed the home feature, six loaded portraits, desktop/mobile child navigation, article destination, LinkedIn URL, four forthcoming platforms and no page overflow. Screenshots were inspected and are kept privately in `private/growth/ai-people-2027/`.
