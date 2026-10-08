# Visionary Talks — Codex build and WordPress migration handoff

Prepared October 4, 2026. Updated October 8, 2026: GitHub development and AI-assisted content workflow. Owner: Omer Lewinsohn.

## 1. Objective and starting point

Build the production Visionary Talks publication and migrate the existing WordPress site off WordPress. Preserve the editorial design developed in the attached working prototype. This is a publication plus a structured business-data product, not only a blog.

Existing production domain: https://visionarytalks.com/
Approved visual prototype: https://visionary-talks-editorial-concept.omerlewins.chatgpt.site/
Source snapshot: f5f2a8b0a0ad05396230e911df862045e76fd263, published concept version 12.

The source archive contains static HTML, CSS, JavaScript, illustrations, JSON sample data, generation scripts, tests, and template documentation. It is not the source of the live WordPress site. No WordPress export, database, uploads archive, SEO plugin configuration, analytics, or production credentials have been supplied. Do not claim the migration inventory is complete.

## 2. Recommended production architecture

Use a TypeScript Next.js application with Payload CMS, PostgreSQL, and durable object storage for media. Payload supplies the editor/admin interface, relationships, access rules, drafts, and versions; Next.js supplies the public site. Use compatible supported versions checked against current official documentation, with a committed lockfile and migrations.

Keep the code in a GitHub repository owned by Omer. Use separate development, staging, and production environments. The owner has chosen GitHub for source control and Vercel for application hosting. Deploy the Next.js public site and Payload CMS to the owner-designated Vercel project, using compatible runtime settings. Use managed PostgreSQL (recommended default: Neon) and durable object storage (recommended default: Vercel Blob for appropriate media), with backups and access controls. Keep database/provider selection configurable until the actual accounts are confirmed. The current ChatGPT-hosted prototype remains a visual reference and is not the intended production host.

The migration should end with no dependency on WordPress for serving content, images, search, or the editorial admin. A temporary importer may read a secured WordPress copy. Do not build a new custom CMS from scratch when Payload provides the required editorial functions.

Official references:
- https://payloadcms.com/docs/getting-started/what-is-payload
- https://payloadcms.com/docs/getting-started/installation
- https://payloadcms.com/docs/database/postgres
- https://payloadcms.com/docs/versions/drafts
- https://payloadcms.com/docs/access-control/overview

## 3. Brand and design direction

Visionary Talks uncovers the stories behind the businesses, people, and industries shaping everyday life. Tagline: Companies. Money. Careers.

Audience: business-curious professionals, executives, entrepreneurs, and people considering career decisions.

Preserve white backgrounds, black typography, serif editorial headlines, readable supporting type, subtle rules, deliberate spacing, and the distinctive masthead. Keep the accepted hybrid human/AI/industry hero illustrations and illustrated leader portraits. The user explicitly removed generic newspaper/store/workplace photography. Use company-specific typography, meaningful diagrams, sourced charts, and purposeful illustrations.

Avoid gradients, rounded dashboard cards, decorative stock tickers, generic stock photos, invented data, fake testimonials, or fake interviews. Carry the current design through responsive layouts rather than replacing it with a generic component-library theme. Main body copy should remain comfortably readable; controls need keyboard/focus and mobile support. Respect reduced-motion settings.

## 4. Existing visual references and production scope

| Page / module | Prototype file | Production requirement |
| --- | --- | --- |
| Homepage | reference/dist/index.html | Editable featured stories, ownership company files, AI tracker preview, chart, careers, AI pay tracker, leaders, visual explainers, sponsorship, newsletter |
| Standard article | reference/dist/article.html | Rich content blocks, labels, byline, dates, share, TOC, charts, sources, writer box, related stories, SEO |
| Ownership article | reference/dist/who-owns-cursor.html | Short answer, legal ownership relationships, founders, dated timeline, financing chart, source evidence, FAQs |
| Leader profile | reference/dist/leader.html | Illustration, role, company links, sourced net-worth observations, pivotal moments, education, associations, interview/editorial sections |
| AI companies tracker | reference/dist/ai-companies.html | Search, primary-vertical and metric filters, sorting, sources, observation dates, expandable context, company-page links |
| Company profile | Data model / ownership and tracker references | New reusable page combining identity, products, vertical, ownership, leaders, dated metrics, funding/events, and related coverage |
| AI salaries tracker | Homepage + reference/dist/script.js | Structured sourced salary observations and working occupational controls; retain scope/period labels |
| Publication basics | Existing site inventory needed | Category/tag/author archives, search results, About, Editorial Standards, Contact, Corrections, Advertise, and existing legal pages |

Preserve the exact current paths for existing published content wherever possible. Prototype filenames are not the required production URL structure. The current public Cursor article path `/who-owns-cursor/` must remain available; replacing it with the prototype's `.html` path is not the migration plan.

The home tracker preview and tracker page must read the same records. Profile links must appear only when their destination exists. Preserve the current functional controls while replacing static JSON with CMS/database records.

## 5. Core data model

Use stable IDs and relationships instead of duplicating names and figures in multiple articles.

| Collection / relation | Required information |
| --- | --- |
| Articles | Legacy WordPress ID and URL, title, slug, article type, dek, body blocks, authors, taxonomy, company/person relationships, media, original publication/update dates, draft state, SEO, disclosures |
| Companies | Canonical name, aliases/brands, legal entity, slug, website, product/vertical, description, founding date where sourced, listing status with as-of date, associated people, profile state |
| Ownership relationships | Parent and child entities, relation type, disclosed stake/equity vs voting rights, effective dates, sources, unknown values as null |
| People | Canonical identity, aliases, slug, biography, portrait/credit, roles, company relationships, sourced milestones, publication state |
| Person-company roles | Person, company, role, start/end dates, current/historical flag, source; distinguish executive, founder, board, investor, partnership |
| Institutions and education | Institution ID, awarding institution if different, campus, program/degree, subject, start/end/graduation dates, date precision, sources |
| Metric observations | Entity ID, metric name, value/range, currency/unit, qualifier, period/as-of date and precision, reported/estimated/calculated basis, source IDs, review date, methodology, version |
| Sources | URL, title, publisher, publication date, accessed/reviewed date, evidence note |
| Events / funding rounds | Company, type, effective/announcement dates, amount raised, valuation and basis, investors, sources |
| Media | Stored asset, original URL/ID, alt text, caption, creator, license, crop/focal point, generated-illustration disclosure |
| Authors / editorial users | Public author bio separate from login identity, genuine credentials, roles, permissions |
| Site settings | Navigation, homepage selections, newsletter settings, footer, sponsor positions, global SEO defaults |
| Redirects | Old path, destination, reason, permanent status, validation result |

Education records must support later queries for attendance overlap at the same institution/program. Overlapping dates are not proof that people knew each other or were classmates. Missing attendance dates must remain unknown. Do not build the full cohort network now; implement the relationships so it can be added later.

ARR, annualized revenue, reported annual revenue, valuation, market capitalization, deal value, and net worth are different metrics. Preserve all qualifiers and source dates. Do not infer private-company stakes, interpolate missing net-worth years, sum incomparable run-rate observations, or present forecasts as current results. The existing tracker is a manually reviewed sample snapshot, not a live feed. Scheduled open-web data collection is a later scoped feature. The user-fed content workflow in Section 14 is part of the initial build.

## 6. Editorial admin

Implement authenticated roles for administrator, editor, and contributor with explicit publication permissions. Public queries must return only published content. Restrict drafts, preview tokens, versions, and administrative APIs.

Editors should be able to write and preview articles; add people/companies; enter financial observations with sources; upload media with attribution; curate the homepage; manage related content and redirects; and correct published information without a code change. Support revision history and genuine publication/update dates. Show clear validation for missing mandatory sources and inconsistent metric units.

Expose reusable content blocks for text, images, quotes, chart + accessible data table, company facts, ownership graph, timeline, FAQ, interview, and clearly labeled sponsorship. Distinguish attributed interview responses from proposed interview questions.

## 7. WordPress export package needed

Collect before full import:

1. WordPress Tools → Export → All content, in WXR/XML format.
2. A complete media/uploads archive. WXR includes attachment records/URLs, not the complete binary media library. Preserve the original files while migration runs.
3. SEO data from the actual plugin in use (for example Yoast or Rank Math): titles, descriptions, canonicals, index/noindex flags, schema overrides, social images, and redirects. Inspect custom fields rather than assuming the basic export contains everything required.
4. Existing sitemap(s), a crawl/URL list, permalink configuration, menus, author data, taxonomy, custom post types/fields, active plugin list, and representative page-builder/shortcode content.
5. A full restorable WordPress backup held securely by the owner/host. Use a scoped export or secured copy for development; do not commit a raw database dump, credentials, subscriber data, or password hashes to the application repository.
6. Analytics/Search Console URL-performance exports to prioritize migration checks. These are useful but do not block building the initial application.
7. Existing newsletter, forms, ad, analytics, and consent integrations; configure actual credentials privately when connecting them.

Reference: https://developer.wordpress.org/cli/commands/export/
Reference: https://learn.wordpress.org/tutorial/tools-import-and-export/

## 8. Migration implementation

First produce a discovery inventory: counts by content type/status, canonical public URLs, taxonomies, authors, assets, internal links, plugin-specific data, and unsupported blocks/shortcodes. Do not silently discard content that cannot be converted.

Build an idempotent importer with dry-run mode, legacy-ID mappings, resumability, logs, and reconciliation output. Re-running it must not duplicate articles, people, authors, or assets. Keep original raw content in a restricted migration archive so conversion issues can be repaired.

Import a representative batch first: a long article, an ownership article, author/category pages, a chart/table-heavy post, and any complex page-builder content. Review content and layout before importing the full corpus.

Convert content into supported structured blocks. Sanitize legacy HTML, preserve anchors and meaningful formatting, and repair internal links through a URL map. Copy media to durable storage with checksums and attribution. Preserve original media URLs via routing/redirects where feasible; do not leave images dependent on a WordPress host that will be shut down.

Produce a reconciliation report: source/target counts, imported/skipped/failed records, missing media, unconverted elements, duplicates, dates, slugs, and mismatched links. Flag uncertainty for review rather than filling gaps with generated facts.

## 9. SEO and domain transition

Keep `visionarytalks.com` and the current article paths where possible. A CMS replacement does not require a domain or URL redesign. For changed paths, implement direct permanent redirects to the corresponding relevant page. Avoid redirect chains and redirecting unrelated deleted pages to the homepage.

Preserve article titles, descriptions, canonicals, original author identities and dates, taxonomy, useful internal links, and existing indexing choices. Generate correct production canonicals, sitemaps, robots directives, social metadata, Article/Breadcrumb/Person/Organization structured data where appropriate, and real 404 responses. Avoid publishing the concept's placeholder bylines or claiming unsupported rich-result eligibility.

Protect staging from indexing. Before launch, remove preview-only noindex only from pages meant to be public; ensure neither staging URLs nor the `.chatgpt.site` prototype domain remain in production canonicals, share links, or structured data. Do not blanket-remove existing editorial noindex decisions.

Validate old URLs and important media against the new routes before cutover. Prioritize pages with organic traffic, links, or conversions. SEO continuity can be managed but no migration can promise zero ranking movement.

Official guidance: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes

## 10. Build phases and acceptance gates

### A. Foundation and representative slice

Create the production app, schema, editorial authentication, media storage, and one complete CMS-driven article. Port the masthead/design tokens. Prove published/draft access, editing, preview, and rendering before broadening the site.

### B. Complete the product

Port homepage, standard article, ownership article, leader profile, company profile, AI tracker, and salary tracker. Add the required archives, site pages, and working search. Connect the chosen newsletter/form providers when access is available. Keep provider-dependent features explicitly disabled until connected.

### B2. AI-assisted content workflow

Implement all four intake-to-draft workflows and the review/publish path specified in Sections 14–15, including illustrations or featured images when appropriate, source evidence, durable jobs, and duplicate protection.

### C. Import and reconcile

Inventory WordPress, implement and test the importer, review sample conversions, import all content, generate URL mappings, copy media, and resolve reconciliation issues. Content/data review must distinguish historical facts from outdated sample figures.

### D. Staging acceptance

Required checks:
- Visual review of all page types at desktop and mobile widths; no horizontal layout failures.
- Keyboard controls and visible focus, labels, alt text, readable tables and chart data, reduced motion.
- Search/filter/sort/empty/reset behavior, valid share URLs, working internal links, and no dead profile buttons.
- CMS publishing permissions, public draft exclusion, preview protection, version restoration, and schema migrations.
- Source/target content reconciliation, media integrity, SEO metadata parity, and permanent redirect checks.
- Meaningful automated tests for import idempotency, access control, metric selection/units, URL resolution, and tracker logic.
- Performance review with optimized images, bounded JavaScript, caching, and correct revalidation when editors publish.
- Restorable database/media backups, error reporting, and documented deployment/rollback commands.

### E. Cutover

Keep WordPress available until staging passes. Prepare an editorial freeze or final delta import, take a fresh backup, complete reconciliation, and prepare reversible domain/hosting changes. Request explicit approval for the production domain cutover when a concrete staging build and migration report are ready. After switching, verify key URLs, forms, media, sitemaps, analytics, errors, and crawl behavior. Retain the old system securely for rollback before decommissioning it.

## 11. Prototype limitations to resolve

The current build is an approved design reference, not a production application:
- Newsletter forms are unconnected previews; homepage search only lists sample story titles.
- Several footer destinations and editorial teasers are placeholders.
- Standard article, leader, and ownership copy includes sample editorial-team bylines and concept labels.
- Some company links go to the existing WordPress site; migrate and resolve these intentionally.
- Only one local leader profile and one local ownership template exist. Other leader cards are forthcoming.
- Python generators contain some company-specific prose and dates; replace these with CMS fields, not blind string substitutions.
- Financial and salary observations require source and period review before production. Do not treat a review date as the measurement date.
- The salary plot currently scales markers against 320,000 while its displayed ticks require alignment review. Use one shared scale for positions and labels.
- Illustrations are generated editorial artwork. Preserve provenance and avoid presenting them as real photographs. The Apple article still references a credited Wikimedia photograph; copy/store and honor its license before production.
- No production user system, import pipeline, scheduled data refresh, general company-profile engine, or real video library has been built.

## 12. Start prompt for Codex

> Read this handoff and inspect the attached reference source before editing. Build the production Visionary Talks publication using Next.js, Payload CMS, PostgreSQL, and durable media storage, preserving the approved design. Use a new production application directory and keep the reference snapshot intact. Implement reusable CMS-driven articles, ownership pages, leader and company profiles, homepage sections, the AI companies tracker, and the salary tracker. Start with the schema and one complete editable article, then progress through the phases and acceptance gates in this document. Build an idempotent WordPress importer and a migration reconciliation report; preserve production URLs and SEO. If WordPress exports or provider credentials are missing, complete the independent application work and specify the exact missing inputs without inventing content. Keep deployment instructions and environment-variable names documented, with no secrets committed. Do not change the live domain or delete WordPress until the staging build and migration report are approved. Report completed work, meaningful verification, and remaining blockers after each milestone.

## 13. Package usage

Unzip `Visionary_Talks_Source_Handoff.zip` into an empty working directory. Read `START_HERE.md` and this handoff. The `reference/` folder contains the source snapshot; build the production project separately.

To inspect the static reference locally: run `python -m http.server 8000 --directory reference/dist` and open `http://localhost:8000`. For the existing tracker logic check: `node --test reference/tests/ai-tracker.test.cjs`.

This delivery does not create a GitHub repository, migrate content, change DNS, or replace the live WordPress site. Those steps belong to the phased build above.


## 14. GitHub and AI-assisted content operations — added October 8, 2026

### Product decision

Omer will develop the project in GitHub and wants to feed content into agents that prepare and upload articles/profiles together with AI illustrations. Include this workflow in the initial schema, CMS, and application architecture. Implement all four requested content workflows in the initial product scope: leaders, salaries, ownership (“who owns”), and regular blog posts. Build and prove the shared pipeline with one leader first, then complete the other three before content-automation acceptance. Do not delay this foundation until after the CMS has been built.

GitHub holds application code, migrations, versioned prompts, schemas, tests, and deployment configuration. The running application still needs hosting, a database, media storage, and a background worker. Editorial records, source files, generated portraits, and job progress belong in the CMS/database and object storage. Publishing an article should not require a Git commit or a new application deployment; invalidate the appropriate page cache after publication.

No GitHub repository URL has been supplied yet. Do not create or select a repository or provision paid infrastructure without establishing the intended account/project. This handoff specifies the workflow; it has not deployed any content agents.

### What the editor should experience

1. Open a “Content inbox” in the CMS.
2. Select a content type (Leader, Salaries, Who Owns, or Blog Post) and provide a name plus pasted text, uploaded documents, URLs, or interview notes. Identify the intended person and company and optionally supply an approved portrait reference.
3. Choose “Prepare draft.” The UI shows progress and any missing information. Research beyond supplied material must be an explicit per-job option; never silently supplement a supplied interview with invented answers.
4. Receive a populated leader profile, source-linked facts, SEO draft, related company suggestions, and a matching monochrome editorial illustration in the media library.
5. Review the text, uncertain claims, proposed changes to existing records, and portrait together. Edit or regenerate a selected section or image without rerunning everything.
6. Publish or schedule through the CMS after editorial approval. The public page and eligible homepage selections refresh from the same record.

Default behavior is automatic preparation and CMS draft upload, followed by human publication approval. This is a recommended initial workflow, not an assertion that the user has requested unrestricted auto-publication. Add automatic publication only as a separately enabled policy with explicit content eligibility, permissions, and rollback rules.

### Agent responsibilities

These can be separate versioned task modules under one orchestrated workflow; they do not need independent services or a complex autonomous agent swarm.

| Stage | Responsibility | Output |
| --- | --- | --- |
| Intake and evidence | Parse supplied material, resolve person/company identity, identify existing records, extract claims and source locations, flag ambiguity or conflicts | Validated evidence packet and proposed entity matches |
| Editorial | Turn supported material into the selected template; prepare title, dek, body, quick facts, education, timeline, related entities, and SEO fields | Structured draft with claim-to-source links and unresolved-field flags |
| Illustration | Generate a portrait using the approved visual style and the resolved identity or supplied reference | Stored media asset, dimensions/crops, alt text, generation provenance, and review status |
| Validation and upload | Validate schema and sources, check units/dates/links, attach the image, and save a new CMS draft or proposed revision | Reviewable CMS record and a concise quality report |
| Publication | Enforce review and publication permissions, publish the approved version, refresh affected routes, and log the action | Published revision or a clear validation failure |

### Illustration requirements

Use the existing Satya Nadella, Jensen Huang, Melanie Perkins, and Patrick Collison portraits as visual-style references: black-and-white engraved editorial drawing, fine crosshatching, natural proportions, consistent head-and-shoulders framing, and transparent background where appropriate. Reuse approved assets when available rather than regenerating them for every update.

Identity and style references are separate. When the identity is ambiguous or the supplied person cannot be reliably depicted, request a reference image or identity clarification. Do not invent a generic face and label it as the person. The editor reviews likeness before publication. Never present the output as an actual photograph.

Store the generated master once; create responsive delivery sizes/crops from it. Retain provider/model identifier, prompt version, input/reference IDs, creation time, file checksum, AI-illustration label, and relevant supplied-image permission information. A failed image task must not produce a falsely successful job: keep the text draft, report the image failure, and allow a targeted retry.

### Structured data and factual handling

The output must populate the actual People, Education, Company Roles, Events, Sources, and Metric Observations collections, not merely a prose blob. Use stable IDs and source evidence for relations. Net-worth figures require a date, currency, source, and estimated/reported qualifier. Unknown education dates, ownership percentages, or wealth figures remain null. Do not infer friendships from school overlap or invent quotations, interviews, awards, credentials, or financial data.

Preserve supplied source material and distinguish direct quotations, extracted facts, editorial interpretation, and unresolved claims. AI-written text must not be attributed to an invented human writer. Select a real responsible editor/author using the publication's byline policy.

For updates, show a proposed diff. Do not overwrite a human-approved biography, source note, or portrait without the applicable editorial action. Use the target record's version to detect concurrent edits; changed records return to review instead of silently replacing the newer version.

### Implementation foundation

Add `contentJobs`, `sourceDocuments`, `claimEvidence`, `generatedAssets`, `reviewDecisions`, and versioned `promptTemplates`, reusing the existing content and source collections. Job records track content type, target IDs, submitting user, input references/checksum, prompt/model versions, each stage's status and attempts, output record IDs, errors, costs where available, and reviewer/publisher identities.

Use a durable background queue/worker with persisted progress. Long image-generation and content jobs should continue if the editor closes the browser. Implement bounded retries, cancellation, timeouts, provider rate-limit handling, per-job cost limits, and stage-level resume. Use an idempotency key so repeat submissions/retries do not create duplicate profiles or media assets. Keep successful work when a later stage fails.

Suggested states: queued, extracting, needs_input, drafting, illustrating, validating, ready_for_review, approved, publishing, published, failed, canceled. Store stage outcomes separately; a single overall status is insufficient for partial failures.

Keep model/image-provider keys server-side, in the application secret store. Give drafting workers only the permissions needed to read approved inputs and create drafts/media; publication runs through a distinct permission check. Treat source files and URLs as content to analyze, not instructions that can change tool permissions or publishing policy. Validate uploads and restrict URL fetching against private-network access and credential leakage. Retain inputs and logs under explicit access and retention rules.

Use provider adapters so the writing/research and illustration providers can change without rewriting the CMS. Codex should verify current provider SDK/API documentation at implementation time; no specific model name, endpoint, or pricing is fixed by this brief.

Recommended repository areas: application and CMS code, content workflow modules, versioned prompts, shared schemas, import scripts, tests, and documentation. Use pull requests and CI for application changes. Treat editorial approvals as CMS actions, distinct from GitHub code review.

### MVP boundary and acceptance

Include now: shared schema, inbox, all four content types, evidence extraction, template-specific draft creation, appropriate illustration/featured-image creation or reuse, CMS media attachment, editor review, publication action, job logs, bounded retries, and duplicate protection. Implement a leader as the first vertical slice, but all four types are required for acceptance. Connect approved records to their relevant profiles, archives, trackers, and homepage selections through existing IDs.

Later: bulk AI-generation batches, additional content types beyond the four requested, scheduled fact refresh, entity-network discovery, and policy-controlled automatic publication. The complete WordPress migration is required and is separate from optional bulk AI generation. These are not required to ship the first workflow.

Demonstrate acceptance with:
- One supplied leader packet becomes a complete draft plus correctly attached illustration.
- Unsupported facts stay blank/flagged and each populated factual field retains evidence.
- A duplicate submission does not create a second leader.
- Image failure preserves the text draft and retry does not duplicate successful assets.
- Unauthenticated users cannot see jobs, raw source documents, or drafts.
- Drafting credentials cannot publish; an authorized editor can approve and publish.
- A concurrent manual edit causes a review conflict rather than silent replacement.
- Publishing refreshes the leader page and selected homepage references without a code deployment.

### Addition to the Codex start prompt

> Use the owner-designated GitHub repository for code and implement the AI-assisted content workflow in Section 14 as part of the production architecture. Complete working Leader, Salaries, Who Owns, and Blog Post workflows from intake through evidence, structured draft, appropriate imagery, CMS review, and publication. Use Sections 15–16 as the acceptance specification, preserve all existing WordPress content and its access status, and retain existing production URL paths. Keep publication human-approved by default, persist jobs for safe retries, protect existing editorial changes, and separate GitHub code delivery from CMS content publication. Record actual missing provider credentials as blockers while completing the independent workflow and tests. Do not claim agents are operational until the end-to-end staging workflow has been demonstrated.


## 15. Required content agents and templates — confirmed by the owner

The user explicitly requested all four types below, not only a leader prototype. Use a shared job orchestrator and specialist instructions/output schemas per type. Each must create or propose an update to the correct CMS record, select its template, populate metadata, handle imagery, and return a reviewable preview. These are implementation requirements; this handoff does not mean running agents already exist.

| Agent / content type | Required structured output | Image behavior |
| --- | --- | --- |
| Leaders | Identity, biography, quick facts, source-linked net-worth observations, education, pivotal moments, company roles, interview/profile distinction, SEO and related entities | Reuse an approved portrait or generate a consistent monochrome editorial likeness; retain attribution/disclosure and require identity/likeness review |
| Salaries | Company/occupation/role, geography, currency, period, experience level when supplied, base vs total compensation, metric definition, range/percentiles/sample size where available, source/methodology, editorial explanation, SEO | Generate a relevant editorial featured illustration when needed; render actual salary charts and tables deterministically from validated numbers, never by image generation |
| Who Owns | Brand and legal entity, direct parent, ownership relationships and dated disclosed stakes, founders, deal/funding events, public/private status with date, direct answer, FAQs, sources, SEO | Reuse an approved company asset or generate a relevant company/industry editorial feature image; build ownership diagrams from verified relationships rather than drawing them into generated art |
| Regular Blog Posts | Title, slug proposal, dek, headings/body blocks, actual author/editor, taxonomy, linked entities, TOC, sources, relevant FAQs/related posts, SEO and disclosure | Use an existing appropriate image, generate a subject-specific featured image, or choose no image where the template does not need one |

“Upload” means save through the application's CMS service into the correct collection as a draft or proposed revision; attach the stored media to that record. It does not mean commit rendered article HTML or binary images to GitHub. Publication is the separate editorial action described above.

### Image selection and featured-image handling

Each intake includes an image mode: reuse supplied/approved media, generate, or none/automatic editorial choice. Reuse is preferred when the existing featured image is suitable. All applicable templates need a `featuredImage` relation plus alt text, caption, credit/provenance, crop/focal-point settings, and generated-illustration disclosure. A leader can use its portrait as the featured asset; do not generate a redundant second image automatically.

For regular posts and company stories, match the specific subject and the approved black-and-white editorial direction. Do not silently use unrelated generic office imagery. Do not invent or distort an official company logo. Keep the illustration separate from all factual numbers, names, quotations, and ownership diagrams. Include a preview for desktop and mobile crops. Allow targeted regeneration without rewriting approved text.

If an existing article is being migrated, preserve its original featured image and in-article media by default. Generating new images for the whole WordPress archive is not part of migration. Enrichment/regeneration is a later explicit editorial operation.

### Salary-specific validation

Require the exact metric and scope. Base salary is not total compensation; mean is not median; a percentile boundary is not an observed minimum or maximum. Do not combine currencies, locations, periods, seniority levels, or incompatible datasets into a single unsupported comparison. Explain when broad occupation statistics are being used as a benchmark rather than AI-only salary observations. Missing salary evidence produces a needs-input flag, not fabricated numbers. Store salary observations in a reusable collection feeding both articles and trackers.

### Acceptance across all four types

Run one representative input packet for each type end to end. Verify correct routing and schema, source retention, draft upload, image association or explicit no-image decision, metadata, preview, permissions, and publication. Verify that an update retains the existing live URL and proposes a revision rather than generating a duplicate page. Use real source packets supplied by the owner for editorial acceptance; test fixtures must remain clearly labeled and must not be published as reporting.

## 16. Design-first build and complete WordPress migration — confirmed by the owner

### Sequence

Start with the design and reusable page templates, using the current reference and clearly labeled fixtures. Build the CMS schemas and content-agent interfaces alongside those templates so content can be imported without redesigning every page. WordPress remains the live site during development.

The absence of exports does not block design implementation. It does block claiming that the existing content has been migrated or that the launch is ready. Do not replace the WordPress site with a small set of mockup articles.

### Owner's export checklist

1. In WordPress, use Tools → Export → All content and download every generated XML/WXR file. Include every relevant site if the installation is multisite.
2. Obtain the full `wp-content/uploads` media folder from the host, or a complete downloadable media backup. If a plugin stores media on an external CDN/bucket, include access/export for that origin as well.
3. Obtain a full database and site-files backup through the host or existing backup system, held securely. This is the recovery source and fallback for custom/plugin data absent from WXR. Do not place this private backup in a public GitHub repository.
4. Identify the SEO plugin and export available SEO settings/metadata and redirects. Include the redirect plugin's export separately if redirects are managed there. Preserve custom SEO metadata from the database if plugin exports are incomplete.
5. Capture Settings → Permalinks, including any custom pattern and category/tag bases; collect current XML sitemaps and a full crawl/URL inventory. Include old redirect rules from the host/CDN and links to important high-traffic pages.
6. Provide the active plugin and theme list, custom post types/fields, menus, author profiles, and representative page-builder/shortcode pages. Identify special integrations such as forms, newsletter, ads, and embedded media.

A basic WordPress XML export alone is not a complete site backup or a guarantee that plugin-dependent content will be reproduced. Use the inventory and backup to reconcile any omissions. Raw exports may contain drafts, private content, email addresses, and other restricted information; process them through a secured import environment.

### What “all content migrates” means

Inventory and reconcile every article/post, page, custom post type, taxonomy, author profile, featured image, in-body asset, caption/alt/credit, meaningful internal anchor/link, SEO field, and publication date/status. Include comments and special content types if they exist; decide how to preserve them rather than silently dropping them. Retain drafts, scheduled and private records with equivalent access controls; importing is not permission to make them public.

Account for historical revisions and trashed content explicitly. Preserve them in the secured original backup at minimum; document whether the owner needs them available inside the new CMS. User login/password migration, subscriber lists, paid memberships, and plugin-specific records require a separate inventory and handling decision if present. Do not assume they exist or erase them because the new design does not show them.

### URL preservation contract

Use the original public URL path as an authoritative field (`legacyPath`/route mapping), alongside the new entity ID and any proposed slug. Do not regenerate slugs from rewritten titles. The original article at `/who-owns-cursor/` must still resolve at `/who-owns-cursor/` after the rebuild. A new content type or CMS collection does not justify adding `/blog/` or `/companies/` to an existing path.

Audit trailing slashes, encoded characters, dated permalink structures, taxonomy/author archives, pagination, and collisions with new application routes. Preserve established canonical host/path behavior. For unavoidable changes, create a reviewed, direct permanent redirect to the equivalent destination; never route all old posts to the homepage. Preserve media URLs where feasible or redirect them to the migrated asset rather than relying on a retired WordPress host.

### Required migration report before launch

Deliver a machine-readable inventory and URL manifest with: WordPress ID, content type/status, old URL/path, target record ID/path, imported title/dates, media count, SEO fields, migration outcome, and validation results. Every discovered public URL must have a recorded disposition: same-path page, equivalent redirect, or explicitly approved retirement. No URL may disappear merely because it was not included in a template demo.

Reconcile source and destination counts by type/status; compare normalized article text, headings, links and assets; list unresolved shortcodes/blocks, missing images, duplicate paths, metadata losses, and failed records. A successful bulk-import job alone is not proof of completeness. Review representative pages from every legacy content format plus the highest-value organic landing pages.

Launch gates: no unexplained missing content, no unresolved public URL collisions, no unintended draft exposure, no broken required media, and no unapproved URL changes. Keep a final delta-import plan for edits made in WordPress during development, and keep rollback available at cutover.


## 17. Confirmed GitHub + Vercel delivery and responsive acceptance

Confirmed by the owner on October 8, 2026. This section supersedes any earlier provider-neutral hosting language. No GitHub repository or Vercel project has been connected or created as part of this handoff update.

### Where the project is built and runs

- GitHub: owner-controlled application repository, version history, pull requests, prompts, schemas, tests, and migrations.
- Codex development environment: checks out that GitHub repository and implements the application; the resulting code is committed and reviewed through GitHub.
- Vercel: builds and deploys the Next.js application and Payload editorial interface from the connected repository. Use preview deployments for review; configure the designated production branch intentionally.
- Managed PostgreSQL: stores articles, people, companies, observations, sources, jobs, users, and reviews. Recommended default is Neon; confirm the selected account and connection method when implementing.
- Durable media storage: stores imported WordPress media and generated illustrations. Recommended default is Vercel Blob with an appropriate Payload adapter and access policy. Do not rely on temporary function filesystems for persistence. Restricted source documents and unapproved/private assets must not become publicly accessible merely because they were uploaded.
- AI workflow execution: use a durable queue and execution mechanism compatible with the selected Vercel runtime and plan. Validate provider duration, upload, memory, and concurrency limits. Long jobs need persisted checkpoints and retries; do not run the entire content/image workflow as an unbounded browser request. If a separate worker service is required, document it and establish the owner-designated service before provisioning.

GitHub holds code; it is not the content database. Vercel deployments deliver application changes. Editors and agents create CMS records without rebuilding the application for each article. Publishing must revalidate affected public pages.

Use distinct development/preview and production secrets and databases or isolated database branches. Preview deployments must never mutate production content or expose drafts. Commit environment-variable names and setup instructions, not tokens. Sequence database migrations explicitly and make deploy rollback compatibility part of review.

The live domain remains on WordPress until the final migration gate. Connecting `visionarytalks.com` to Vercel and switching DNS happen only after the complete content/URL reconciliation and agreed cutover approval. Preserve all established production URL paths as specified in Section 16.

Official implementation references, checked October 8, 2026:
- https://vercel.com/docs/git/vercel-for-github
- https://vercel.com/docs/marketplace-storage
- https://payloadcms.com/docs/production/deployment
- https://payloadcms.com/docs/upload/storage-adapters

### Mobile responsiveness is a release requirement

Implement responsive layouts from the first component, not as a final optional polish pass. Test homepage, article, ownership article, leader profile, company profile, AI companies tracker, salary tracker, archives, search, contact/newsletter forms, and CMS content-inbox/review flows.

Required behavior:
- Mobile navigation exposes every section and has a usable menu control; no clipped masthead or inaccessible links.
- Hero illustrations resize/crop deliberately and must not obscure headings or controls.
- Multi-column editorial layouts stack in a considered reading order; sticky sidebars become compact expandable sections when needed.
- Trackers provide labeled mobile records or explicitly contained horizontal table scrolling, while keeping company names, metrics, dates, and sources understandable. The page itself must not overflow horizontally.
- Search, filters, sorting, source notes, reset states, and pagination (where present) remain fully usable by touch and keyboard.
- Charts retain readable labels and units and expose an accessible data table; no unreadable screenshot scaling.
- Portraits and featured images use responsive sizes and meaningful focal-point crops with intrinsic dimensions to avoid layout shifts.
- Forms, sharing controls, image-review controls, and generation progress do not depend on hover. Use approximately 44px minimum touch targets where practicable, visible focus, and readable input text.
- Text remains usable with 200% enlargement; long names, headlines, company labels, and error messages wrap without collision.
- Reduced-motion preferences are respected; mobile performance is checked under constrained network conditions.

Acceptance viewport widths: 360, 390, and 430px phones; 768px tablet; 1024 and 1440px desktop. Include portrait/landscape spot checks and Chromium/WebKit coverage. Verify intermediate widths rather than only those exact breakpoints.

Add automated browser checks for the core mobile navigation and tracker flows, plus overflow checks on the principal templates. Capture and review representative desktop/mobile screenshots in staging. Real content imported from WordPress must be included in the final checks, especially long tables, embeds, large images, and unusually long headings.

Passing a CSS breakpoint check alone is not proof of responsiveness. Record which pages/viewports were actually reviewed, issues resolved, and remaining limitations. The current prototype's responsive CSS is a design starting point, not a claim that the future production app has passed these tests.

### Final addition to the Codex start prompt

> Use the owner's GitHub repository and deploy the application to their Vercel project, as specified in Section 17. Make every public template and the editorial intake/review experience mobile responsive. Demonstrate the required phone/tablet/desktop checks before acceptance. Use isolated preview environments, durable database/media storage, and reliable background execution for content agents. Keep the existing WordPress domain live until the migration report and domain cutover are approved.
