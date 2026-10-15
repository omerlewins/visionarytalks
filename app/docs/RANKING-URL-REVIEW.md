# Ranking URL and editorial category review — October 9, 2026

The source is the owner's Search Console Pages export for the last three months,
checked against the supplied WXR, uploads archive, current WordPress responses,
and the isolated Vercel preview. Analytics, source snapshots, before-images and
per-URL results remain in ignored `private/ranking-audit` and `private/ranking-release`.

## Route preservation

- Existing article paths and slugs remain unchanged. No content-type prefixes are added.
- Ten explicit, observed WordPress permanent redirects are reproduced as direct 301s.
  The registry is `src/data/legacy-redirects.json`; there is no guessed catch-all redirect.
- The existing uppercase lifetime-spending URL still renders the same article with
  its canonical lowercase URL, without introducing a redirect.
- Nineteen ranked upload paths resolve through Payload's approved-media access checks
  and durable storage, using a checksum manifest independent of database IDs.
  A source-exact repair restores one WebP that Payload recompressed on initial upload.
- Original published privacy and contact pages are restored at their original paths.
  Privacy collided with a WordPress navigation record; the published page was selected.
- Category, tag, author and hot-posts archives retain their paths and use the observed
  ten-story page size. Author URLs come from the exported WordPress login identifiers.
- Canonical page URLs no longer fall back to localhost. Existing explicit SEO
  descriptions, canonical URLs and literal titles are used when supplied.

## Editorial classification

The 100 imported public articles now comprise 58 ownership articles (including four
historical “Who owned” articles), 13 salary articles, 10 reviewed person profiles,
and 19 regular articles. Seven original refresh drafts remain private.
Classification preserves article fields and verifies a hash excluding only the
template kind and operational update timestamp. Original taxonomy is retained.

The Who owns archive includes ownership records independently of their old WordPress
category. Careers includes salary stories; People includes leader profiles and the
original Leaders taxonomy. Existing category and tag membership remains available.
Future imports use the same conservative classifier.

## Scope and unresolved migration details

- The owner explicitly excluded `/aya-new-york-and-valuebase-head-to-court/`; it remains 404.
- Other URLs already returning 404 on WordPress are accounted for rather than given
  invented replacement articles. The new draft About publication route is an intentional
  difference from WordPress's missing `/about` URL.
- Three www-host URLs fail to fetch on the existing site. Their article paths resolve;
  www/apex domain behavior still needs verification during approved cutover.
- The literal `/visionarytalks.com/...` URL returns 403 on WordPress and has no supplied
  article. No replacement is invented.
- Live/source article comparison accounts for WordPress smart typography. The remaining
  platform differences are two YouTube embeds rendered as retained source URLs,
  Cloudflare's email-obfuscation placeholder versus the original email, and the legacy
  wealth calculator's form/options/scripts. The calculator still requires a reviewed
  implementation; source scripts are archived and are not executed in the new site.
- This review covers ranked URLs and classification, not every launch prerequisite.
  Full migration exceptions and deployment prerequisites in ACCEPTANCE.md still apply.

## Verification

`audit-ranking-urls.ts` checks original text and import checksums against CMS records.
`compare-live-content.ts` compares the original article body with saved live responses.
`verify-ranking-release.mjs` checks every exported path, image bytes, CMS type counts,
private drafts, canonicals, pagination, and actual layouts at 360, 390, 430, 768, 1024
and 1440 pixels. Source data and credentials must be supplied privately to these tools.

No DNS, live WordPress content, production credentials, or billing plan was changed.

