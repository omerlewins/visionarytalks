# Launch candidate — October 12, 2026

The editorial release is integrated into the separate Production CMS: **133 published articles**, including **22 Leaders profiles and 10 Who Owns investigations**. There are 31 new URLs and one conversion of the existing Leopold article. All 102 original article paths remain. The other 101 original article records were compared against the immutable baseline and remain unchanged; Leopold retains his legacy identifier, original URL and first-publication date.

The additive `publishedResearch` migration passed rehearsal, Production and isolated Preview. The guarded release validated the individually reviewed content hashes, inspected a dry-run and saved private backups before publishing. Sources are published CMS relationships. No Preview research markers, proposals or users were transferred. Production public rendering uses the published Story artifact through the shared templates. Private workflow pages return 404 and anonymous CMS responses omit the research JSON. A rehearsal CMS draft edit was saved, confirmed invisible publicly and restored. All 32 Production artifacts and their latest CMS versions match the approved release.

Verification completed:

- Final Production build and TypeScript checks passed; all 61 unit tests passed.
- Rehearsal: 158 original/service URL checks passed, plus 32 articles at desktop/mobile widths (64 checks) and 47 internal destinations. Metadata, single H1, portraits, dated tables, shared charts, visible FAQ/schema agreement and page overflow were checked.
- The Production baseline has 102 preserved paths, 133 published articles, 32 matching release artifacts and zero private research records. Original media transfer and all 439 object hashes remain verified in the earlier preparation audit.
- GA4 `G-1YPKS2X7JE` and domain Search Console settings are configured in Production. Consent checks use stubbed Google requests; real traffic and indexing can only be confirmed after launch. Reporting service credentials remain optional and unconfigured.

Newsletter registrations are collected with consent in the CMS; email delivery is not connected. The Who Owns archive accepts company suggestions through its publication contact. Research limitations remain visible: unknown private ownership and personal wealth are not fabricated. See `EDITORIAL_RELEASE_REVIEW.md` and `DEPENDENCY_LAUNCH_REVIEW.md` for the review scope and bounded dependency findings; these checks do not guarantee legal protection or zero vulnerabilities.

A Vercel Production candidate was submitted with `--skip-domain`: `https://visionarytalks-1kilx5iwo-omer-webielcoms-projects.vercel.app`. It is Ready. All 32 deployed articles have their reviewed descriptions, one H1, public indexing metadata, visible FAQs and sitemap entries; private review routes return 404. The first CLI upload from the app subdirectory failed the project's Root Directory check and was replaced by this successful repository-root deployment. Domain assignments and DNS are unchanged. Before cutover, preserve existing Google verification TXT and mail records. After cutover, verify a consented visit in GA4 Realtime, submit `https://visionarytalks.com/sitemap.xml` to the existing domain property and inspect representative URLs. No domain move is implied by editorial publication or this candidate deployment.

Ignored evidence and credentials remain under `private/`; they must never be committed. `verify-production-baseline.ts` is the historical **102-only** pre-release check. Use `verify-published-release.ts` after this release; the original baseline must not be rewritten to disguise the new inventory.

Production owner sign-in and opening the article editor passed. Homepage, Leaders, ownership archive, tracker and newsletter passed ten desktop/mobile page checks. Four homepage leader illustrations were scrolled into view and decoded successfully; lazy loading must finish before taking a screenshot.
