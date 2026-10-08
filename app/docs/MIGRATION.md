# WordPress migration

The October 8 WordPress WXR export has been supplied and inventoried privately:
449 records, including 100 published posts, 7 draft posts, 8 published pages,
295 attachment records and 39 menu/template/plugin records. The supplied uploads ZIP
contains all 295 attachment files; an independent public URL crawl is still needed.
The reference archive is not WordPress
content and is never used to claim migration completeness.

Put source exports in the ignored `private/` directory, outside application assets.
Retain the owner's full restorable WordPress backup separately. From `app/`:

```
npm run import:wordpress -- ../private/export.xml --urls ../private/urls.txt
node --env-file=.env.local --import tsx scripts/import-media.ts ../private/export.xml ../private/uploads
npx tsx scripts/audit-uploads.ts ../private/export.xml ../private/uploads
```

Both default to inspection only. Add `--apply` to copy supported records/assets into
isolated staging. Raw source records and machine-readable reports are written under
`private/migration/`. This includes private/draft/custom records and comments so no
source record disappears silently. Do not commit these reports or original exports.

The importer preserves original paths, title, original slug in its source archive,
dates/status, raw HTML, sanitized rendering HTML, recognized Yoast/Rank Math fields,
authors and taxonomy. Only `publish` maps to public status; private, draft, pending,
scheduled and trashed items stay restricted. Original statuses remain recorded.
Scheduled publishing and historical revision availability need owner policy review.

Reimports use source checksums and stored target fingerprints. Unchanged records are
skipped; manual edits become conflicts instead of being overwritten. Every discovered
URL has a pending, same-path or unaccounted disposition. Application-route collisions,
query-string permalinks, shortcodes, unsupported blocks/custom types, comments,
missing assets and embeds require explicit resolution. Sanitization never replaces
the private original. AI enrichment is a separate inbox operation.

Media copying resolves paths only inside the supplied uploads archive, checks file
type, records SHA-256 and deduplicates. Imported assets remain private until attribution
and access review. External CDN origins and non-image formats require mapping/adapters.
The article importer deliberately blocks media-bearing records until binary/path
reconciliation is complete: it must not claim a migrated page still relying on a
retired WordPress host. Final HTML/srcset rewriting, featured-image association and
legacy media URL serving are pending the actual export's URL/origin inventory.

## Remaining migration gates

Provide all WXR files, complete uploads/CDN export, active plugin/theme/custom-field
inventory, SEO/schema/redirect exports, permalink/category/tag bases, sitemap and a
full crawl. Check menus, author archives, pagination, comments, protected content,
embeds and page-builder formats against real samples. Basic WXR is insufficient for
plugin-dependent content or historical revisions.

Before cutover: reconcile every record and public URL, compare normalized text,
headings, links, media, dates and SEO; resolve unexplained differences; approve any
direct redirects/retirements; test high-traffic URLs; take a final backup and delta
import; verify restore/rollback; obtain explicit domain-cutover approval.

The current report always sets `complete: false`. No successful command is treated
as proof that the existing site has been completely migrated.

## Received uploads: local verification

The archive contains 1,589 files: 1,585 fully decoded images and four preserved text
logs. All 295 WXR attachment paths exist. The 291 image attachment records map to
285 checksum-deduplicated private local CMS assets; a repeated import retained every
target ID and checksum. The four text logs are preserved outside public media.
None of this provisions durable cloud storage or approves public access.

The HTML/featured-image audit identifies 599 media references, including responsive
srcset candidates. Twenty-three missing local variants occur in the Elementor
`Business Demo` template. External theme-demo origins in the old Home page/template
still need explicit mapping or an approved template replacement; a matching local
filename alone is not proof of external asset identity. All originals remain intact.
The machine-readable inventory and image checksums are in ignored private reports.

## Full article review import

All 107 supplied post records (100 formerly published, seven original drafts) can
be imported as authenticated review drafts with linked private images:

```
node --env-file=.env.local --import tsx scripts/import-wordpress.ts ../private/wordpress-2026-10-08.xml --apply --review-drafts --uploads ../private/uploads-2026-10-08/uploads
```

This mode retains original paths, source publication status, dates and text; it does
not publish records or resolve flagged embeds/comments/scripts. Original draft query
permalinks are stored only for private review; publication still validates public paths.
Inline image URLs/srcsets and internal links are rewritten in the rendering copy;
archived source HTML remains unchanged. Repeated real-corpus import reported all 107
posts unchanged. The prior strict publishing import remains blocked by unresolved
conversion issues: review readiness is not launch readiness.

Local Windows PostgreSQL must use UTF-8. New local clusters explicitly select UTF-8;
`scripts/upgrade-local-utf8.mjs` copies only the isolated local test server into a new
UTF-8 database using a private data snapshot and versioned migrations. It retains
the original database and updates only ignored local configuration after success.

Run the private corpus browser checks with `TEST_MIGRATION=true` and
`npx playwright test tests/browser/migration.spec.ts --workers=1`. They require the
local authenticated fixture account, private reconciliation report and running app.

Cloud review uses `MIGRATION_REPORT_DIR=../private/cloud-migration` so local and
cloud target IDs remain separate. The bounded media transfer queue shares in-flight
checksums to prevent duplicate uploads. `scripts/enable-staging-articles.ts` restores
only the 100 originally published posts to readable status in the isolated protected
Neon preview. Seven original drafts remain private. It is not a production cutover
command, and conversion issues remain recorded for release review.
