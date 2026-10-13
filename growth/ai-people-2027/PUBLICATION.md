# Watchlist publication — October 13, 2026

The owner explicitly requested Production deployment after inspecting the complete feature, portraits and homepage design. The retained 100 concise claims were already checked against 108 cited primary records. `PUBLICATION_REVIEW.json` binds the precise validated article snapshot and historical claim ledger to this release. It preserves the recorded limits: independent desk research, historical role records where appropriate, attributed company statements, no interviews, no financial audit and no industry-representative ranking.

The release extends the existing private CMS `publishedResearch` JSON contract with a `watchlist` artifact; no database schema migration or new privileges are needed. Its content and review hash must match the release snapshot. Unreviewed changes, wrong paths, draft state and wrong review hashes are rejected by tests. The public loader reads only published, validated CMS records. Public API responses still hide the research JSON.

The dedicated route uses the shared article renderer, removes review wording for published content, emits indexable metadata only in Production and includes the CMS publication timestamp in Article structured data. The same public record controls homepage and Leaders navigation placement. Sitemap inclusion uses the normal published Story loader and the editorial cover asset.

Publication is idempotent and refuses to replace an unrelated existing article. The guarded script backs up stories and sources privately before writes. It reuses already-published source records by URL and creates only the additional cited sources required by this feature. It never republishes the other Leaders or Ownership batches.

Verification before deployment: 67 unit tests, TypeScript, publication validation and a Production-environment build passed. The existing Production rehearsal branch accepted the CMS publication, and its article, home-page feature and sitemap returned 200 with the correct metadata and no pending-review banner. Deployment and main-domain verification are recorded below when complete.

Previous public deployment for rollback: `dpl_2n7ZHdTM4VPEdPoR9epuC4gp5Zkr` (`visionarytalks-q2yoosaj8-omer-webielcoms-projects.vercel.app`).

## Public deployment — October 14, 2026, Jerusalem time

Application commit `8391ca8` deployed as `dpl_GvNGazemhWj3L7FMuwF2Dqz8n5ki`, initially with main-domain assignment skipped. The candidate URL is `https://visionarytalks-he5rkikmu-omer-webielcoms-projects.vercel.app`. Production CMS Story 146 was published at `2026-10-13T21:01:23.220Z` (October 14 locally), after the dry-run and a private backup. The public database now contains the original 133 published records plus this new feature. Other profile and investigation releases were not rewritten.

Candidate and public-domain checks passed: article, homepage, sitemap, Leaders, Ownership archive, Leopold, the top-1-percent article and newsletter all return 200. The watchlist has 100 entries, 12 loaded AI portraits, 100 role badge groups, 200 research panels, one H1, the intended canonical and index/follow metadata. Its published renderer has no editorial-preview banner. Public CMS responses hide the research JSON. Desktop and mobile layouts have no page overflow or broken images. No-JavaScript article and directory checks passed in the Production rehearsal. The main domain was promoted only after candidate verification.

One initially selected smoke-test URL, `/what-apple-earns-after-the-hardware-sale/`, proved to be a local design fixture: it returned 404 on both the previous public deployment and the candidate. It was replaced in the deployment checks by Leopold's existing public URL; no fixture was published to make the test pass. A transient rehearsal database reconnection interrupted the first browser run; it recovered and the repeated full check passed before deployment.

Private evidence and rollback references are retained in `private/growth/ai-people-2027/`, including candidate/live verification JSON, screenshots, CMS backups and the deployment release record. Vercel's existing dependency/build warnings are retained in the build output; this release did not change dependencies, authentication, DNS or analytics behavior. Future edits still require a new reviewed snapshot and deliberate CMS publication.
