# Expanded watchlist revision, October 14, 2026

The initial rebuild was Preview only. The owner subsequently requested completion of the factual review and deployment. `publication-claim-review.json` records the retained expanded claims and current hashes; `PUBLICATION_REVIEW.json` records that deliberate release. The earlier concise release is preserved in `../publication-reviews/2026-10-13.json`.

The requested structure is implemented for all 100 stable entries: education, career path, 2027 outlook, one-sentence risk, natural inline citations, source links and existing related destinations. It retains role badges, the searchable directory and nomination form, with an illustration for all 100 entries. Five section counts describe this selection; they are not industry demographics. The optional company comparison was omitted because its mixed metrics would invite misleading comparisons.

Reproduce from repository root:

```powershell
node app/scripts/rebuild-watchlist-profiles.cjs
cd app
./node_modules/.bin/tsx.cmd scripts/render-ai-watchlist-preview.tsx
npm run validate:watchlist
npm test
npm run typecheck
npm run build
```

Use `growth/ai-people-2027/check-profile-preview.cjs` for this layout, with `WATCHLIST_BASE_URL` when checking the local app. The earlier checker still targets the published layout.

## Research status

`fact-changes.json` records 83 specific field corrections, including old text, revised text, source URLs, access date and scope. `expanded-review.json` inventories all 100 profiles and hashes their expanded copy. Every expanded profile remains pending holistic claim review: checked corrections are not approval of the remaining prose. The earlier concise `claim-review.json` cannot certify the restored biography.

Private retrieval evidence contains 370 URL attempts, 312 readable responses and 58 unavailable or blocked responses. Those numbers describe retrieval, not verified sources. Cached university pages can have stale job titles, a successful response can contain only navigation, and an aggregator can repeat an incorrect date. Do not equate any of these with fact verification.

Verified corrections include Jason Wei's current self-described Meta affiliation, Tri Dao's updated Princeton title and precise Stanford degrees, Helen Toner's CSET title, Grant Lee's Stanford degrees and earlier operating roles, and Kristen DiCerbo's education and earlier career. Baseten's June financing is company-confirmed rather than still just talks; Etched's later financing belongs to August, not September; Fireworks' original statement is dated July 15. Reflection's company newsroom distinguishes a closed financing from its promised model-weight release.

Remaining work: verify each expanded narrative sentence, resolve unconfirmed academic credentials and early-career timelines, open original records behind later funding/revenue leads, and recheck the seven role-sensitive entries identified in the brief. Unsupported claims must be removed or qualified. Do not infer a completed degree, no PhD, a private stake, sole research authorship or a closed financing. No publication gate should be weakened to avoid that work.

The preceding retrieval and pending-review notes describe the initial rebuild. The later publication review revises 98 entries, reviews the retained copy across all 100, and removes unsupported supplied details. It does not certify the discarded biography. Current fields and citations are recorded in `publication-claim-review.json`; the old `expanded-review.json` preserves the original pending snapshot. Intake geography is retained only as research metadata and is not displayed as a current residence. Unknown education and private holdings remain unknown, and attributed company claims are not audited financial statements.

Reproduce the reviewed copy with `apply-watchlist-publication-review.cjs` and `finalize-watchlist-publication-copy.cjs` after rebuilding. These scripts leave or retain a pending release until a completed manual review is deliberately recorded. Never rerun `record-watchlist-expanded-release.ts --record-completed-review` to approve changed facts merely because validation passes.
