# Watchlist publication — October 13, 2026

The owner explicitly requested Production deployment after inspecting the complete feature, portraits and homepage design. The retained 100 concise claims were already checked against 108 cited primary records. `PUBLICATION_REVIEW.json` binds the precise validated article snapshot and historical claim ledger to this release. It preserves the recorded limits: independent desk research, historical role records where appropriate, attributed company statements, no interviews, no financial audit and no industry-representative ranking.

The release extends the existing private CMS `publishedResearch` JSON contract with a `watchlist` artifact; no database schema migration or new privileges are needed. Its content and review hash must match the release snapshot. Unreviewed changes, wrong paths, draft state and wrong review hashes are rejected by tests. The public loader reads only published, validated CMS records. Public API responses still hide the research JSON.

The dedicated route uses the shared article renderer, removes review wording for published content, emits indexable metadata only in Production and includes the CMS publication timestamp in Article structured data. The same public record controls homepage and Leaders navigation placement. Sitemap inclusion uses the normal published Story loader and the editorial cover asset.

Publication is idempotent and refuses to replace an unrelated existing article. The guarded script backs up stories and sources privately before writes. It reuses already-published source records by URL and creates only the additional cited sources required by this feature. It never republishes the other Leaders or Ownership batches.

Verification before deployment: 67 unit tests, TypeScript, publication validation and a Production-environment build passed. The existing Production rehearsal branch accepted the CMS publication, and its article, home-page feature and sitemap returned 200 with the correct metadata and no pending-review banner. Deployment and main-domain verification are recorded below when complete.

Previous public deployment for rollback: `dpl_2n7ZHdTM4VPEdPoR9epuC4gp5Zkr` (`visionarytalks-q2yoosaj8-omer-webielcoms-projects.vercel.app`).
