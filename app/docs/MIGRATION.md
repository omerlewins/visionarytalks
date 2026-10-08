# WordPress migration

No WordPress export or live-site crawl has been supplied. The reference archive is
not WordPress content and is never used to claim migration completeness.

Put source exports in the ignored `private/` directory, outside application assets.
Retain the owner's full restorable WordPress backup separately. From `app/`:

```
npm run import:wordpress -- ../private/export.xml --urls ../private/urls.txt
node --env-file=.env.local --import tsx scripts/import-media.ts ../private/export.xml ../private/uploads
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
