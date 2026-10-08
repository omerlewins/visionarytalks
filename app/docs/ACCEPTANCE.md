# Acceptance record — October 8, 2026

## Implemented and locally verified

- Approved source preserved under `design-reference/`; separate application under `app/`.
- Next.js 16.4.0, Payload 3.90.2 packages aligned, TypeScript and committed npm lockfile.
- Shared masthead, black/white editorial typography, original hero and portrait assets,
  company graphics, accessible navigation, TOC, sharing, source notes, charts/tables,
  related reading, newsletter and advertising positions.
- Homepage; article, ownership, leader, salary and company templates; company tracker
  search/filter/sort/reset; salary observations/occupation control; archives/search;
  publication-page draft placements. All fixtures are explicitly marked and blocked
  from production mode. Publication prose/forms need owner-approved content/providers.
- Payload/PostgreSQL collections, draft/version permissions, protected previews,
  private document/media configuration, sourced structured entities and site settings.
- Durable four-workflow queue: content inbox, validation, template-specific draft
  creation, stage checkpoints, retries, concurrency/duplicate protection and review.
  All four were exercised with synthetic provider responses through the real queue;
  none were published. This does **not** constitute live-model acceptance.
- WXR inventory/import foundation, private raw preservation, authoritative paths,
  source/target checksums and editorial conflicts, status mapping, reconciliation
  manifests, bounded local uploads-copy tool. Unsupported formats are reported.
- All three database migrations applied to a fresh PostgreSQL database.
- A synthetic WXR was applied twice: both original paths and public/private states
  were retained, and the second run reported both records unchanged.
- Meaningful unit tests: paths, publication roles, status preservation, idempotency,
  concurrent-edit protection, XML/HTML handling, URL accounting, null metrics,
  incompatible chart scopes and source validation.
- Real CMS integration test: create draft, anonymous exclusion, contributor denied
  publication, editor publication, jobs/documents private. Test record returned to draft.
- Production compilation succeeded locally. CI repeats type/unit/build/browser checks.

## Browser evidence

Chromium and WebKit exercised homepage, article, ownership, leader, salary article,
company profile, AI companies, AI salaries, category archive, search and contact at
360, 390, 430, 768, 1024 and 1440 pixels. Navigation, filter/reset/empty state, search
and real 404 behavior were exercised. Full-page desktop/mobile screenshots were
captured and reviewed for the main editorial templates. Lazy images are awaited
before final captures. Contained table scrolling is intentional; page overflow is not.
Keyboard skip navigation, salary selection, enlarged long headlines and landscape
overflow checks also passed in both engines. The suite contains 20 browser cases,
including two authenticated CMS cases that require the local integration database.

Authenticated CMS intake/review is checked at the same six widths. A PostgreSQL-backed
article is rendered through authenticated preview, and its anonymous preview returns
404. CMS navigation transitions required waiting for the layout to settle; the test
uses a bounded layout assertion. Screenshot/report files remain local and in CI
artifacts, not in source control.

## Still required before production acceptance

1. Protected Hobby staging now has isolated Neon PostgreSQL and private Vercel Blob.
   Upgrade the owner's workspace before commercial launch; production credentials,
   backup/restore and error-monitoring tests are still required.
2. Model credentials and explicit model choices, four real editorial input packets,
   source/citation accuracy review, generated portrait likeness/crop approval, deployed
   scheduler and long-running failure/retry tests. Token usage is retained; per-job
   dollar-cost enforcement and operational alerts need selected-provider configuration.
3. Structured-entity identity proposals, existing-story revision approval and targeted
   section regeneration need further editorial UX polish; job state is currently exposed
   through Payload's standard record screens. No automatic publishing is implemented.
4. The supplied WordPress WXR and uploads are accounted for. Obtain the remaining
   SEO/plugin/permalink/crawl inventory and resolve unsupported plugin content.
   Complete real-format adapters, internal/srcset/featured-image rewriting, legacy
   media routing, metadata parity and every-public-URL reconciliation against that corpus.
   Scheduled/private/member/plugin-dependent behavior must be reviewed from real data.
5. Owner-approved publication/legal/contact copy and real newsletter/contact/email,
   advertising, analytics and consent integrations. Unconnected placements clearly
   remain inactive. No fake submission success is shown.
6. Actual migrated-content mobile checks, keyboard audit, 200% text zoom, landscape,
   constrained-network performance, large archives/pagination and production load tests.
   Local fixture viewport checks are not a claim that the complete migrated site passed.
7. Final delta import, rollback rehearsal, launch reconciliation and explicit domain
   cutover approval. WordPress and DNS have not been changed.

The deliverable is a working design/CMS foundation and tested local workflow path,
not a claim that the entire migration or production launch is complete.

## Subsequent real-content migration

The WXR and uploads have now been received. All 107 post records are in the isolated
local CMS as private review drafts with original paths/status metadata and linked
images. Reimport is unchanged for all 107. Source-format conversion warnings remain;
public production release has not occurred. Cloud transfer is recorded below. See MIGRATION.md for the corpus
audit, original-status distinction and review import command.

Dependency audit: direct sharp was updated to 0.35.5. npm still reports transitive
advisories involving Payload's undici and build tooling (including braces/esbuild),
plus DOMPurify. Do not blindly apply the suggested Payload downgrade or incompatible
major overrides; resolve compatibility and exposure before public production release.

## Protected Hobby staging deployment

The owner-designated `omer-webielcoms-projects/visionarytalks` project is connected
to GitHub, with root directory `app`. A Vercel preview build passed TypeScript and
production compilation. Preview-only Neon and private Blob credentials are configured;
all three PostgreSQL migrations have been applied. No production credentials or DNS
changes were made, and Vercel Authentication remains enabled.

All 107 source posts imported successfully: 100 originally published articles are
readable inside protected staging, and seven original drafts retain CMS access
controls. Five legacy pages remain review drafts. All 449 source records are
accounted for in `private/cloud-migration/reconciliation.json`; this is not a claim
that plugin records, all pages, media aliases or conversion issues are resolved.
The report still has 42 pending source URL dispositions. Article images referenced
by the imported rendering copies are stored in private Blob with approved-image
access through Payload. Full source archives and sensitive reports remain ignored.

The importer recovered a network-interrupted record by comparing every imported
field to its source. Different media binaries with the same basename now receive
checksum-prefixed filenames; concurrent identical binaries share a single upload.
The final recovery pass imported four outstanding posts and retained 103 unchanged.
All 15 unit tests and the local TypeScript check passed after these repairs.

Deployed verification passed for all 100 original article routes (HTTP 200), exactly
100 CMS-readable published articles and seven original drafts hidden from anonymous
CMS access (HTTP 404). Owner login, private Blob streaming and private jobs access
were checked. Homepage, ownership article and search rendered at 360, 390, 430, 768,
1024 and 1440 pixels without page overflow; visible images loaded. Desktop/mobile
homepage and desktop article screenshots were inspected. Evidence is in the ignored
`private/deployed-review/` directory. This complements the local Chromium/WebKit
corpus checks; it does not replace production load or a full manual content review.

Visual review also confirms remaining editorial setup: non-ownership imports retain
their regular legacy article template until classified; homepage section curation and structured
company/compensation tracker data are still needed. Empty trackers do not contain
invented sample financial figures. Newsletter and other unconfigured integrations
remain clearly inactive.

Do not rerun review-draft import against the promoted staging records: it intentionally
refuses to unpublish them. Review mode is intended for a fresh isolated import or
existing private drafts. Publishing to the live domain remains a separate approved
release after dependency, content-conversion, operational and URL reconciliation gates.

## Editorial tables, charts and ownership files

Imported tables now share the editorial rules, headers and spacing, fill the reading
column on desktop and scroll inside a keyboard-accessible region on small screens.
Local and deployed checks passed for 294 tables across 99 imported articles. The
wealth-percentile example was rendered at all six required widths.

The source inventory identifies 61 ownership records: 54 published articles and seven
refresh drafts. `scripts/classify-ownership.ts` changes only their CMS template kind
and modification timestamp, stores private before-snapshots, and verifies hashes of
all remaining fields. Original article paths, titles, text, dates, authors, imagery,
SEO metadata and publication status are preserved. Query-style draft paths remain
private. New imports also recognize ownership titles and paths.

Ownership pages use the approved split typographic cover, four-column summary,
contents navigation, boxed original opening paragraph, numbered editorial sections
and company sidebar. Original featured images remain inside the article. Summary
fields use existing structured facts when supplied; imported entries otherwise show
company identity and article metadata. Parent, stake, founder and transaction facts
are not inferred merely to fill design modules.

The shared chart renderer uses the homepage's wash, serif labels, monochrome bars,
fine gridlines, zero baseline and source notes. The one embedded SVG found in the
export (net worth by age) is rebuilt from its exact accompanying source-table values,
with median and average kept distinct on a shared USD scale. The original table and
caption remain. Uncertain strings fail parsing rather than being converted to exact
figures. This is source-preserving visualization, not renewed factual verification.
Local checks compare the complete rendered legacy text of all 61 ownership records
and render the ownership/chart examples at 360, 390, 430, 768, 1024 and 1440 pixels.
