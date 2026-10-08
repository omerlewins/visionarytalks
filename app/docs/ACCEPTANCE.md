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

1. Owner-designated eligible Vercel project, isolated PostgreSQL and private object
   storage; live upload/download/authorization, backup/restore and error-monitoring tests.
2. Model credentials and explicit model choices, four real editorial input packets,
   source/citation accuracy review, generated portrait likeness/crop approval, deployed
   scheduler and long-running failure/retry tests. Token usage is retained; per-job
   dollar-cost enforcement and operational alerts need selected-provider configuration.
3. Structured-entity identity proposals, existing-story revision approval and targeted
   section regeneration need further editorial UX polish; job state is currently exposed
   through Payload's standard record screens. No automatic publishing is implemented.
4. Full WordPress exports, uploads/CDN assets, SEO/plugin/permalink/crawl inventory.
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
public release and cloud transfer have not occurred. See MIGRATION.md for the corpus
audit, original-status distinction and review import command.

Dependency audit: direct sharp was updated to 0.35.5. npm still reports transitive
advisories involving Payload's undici and build tooling (including braces/esbuild),
plus DOMPurify. Do not blindly apply the suggested Payload downgrade or incompatible
major overrides; resolve compatibility and exposure before public production release.
