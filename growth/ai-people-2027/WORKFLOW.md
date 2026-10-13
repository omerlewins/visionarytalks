# Watchlist feature workflow

Use `ai-watchlist-v1` for this feature. It is one article with short research entries, not a batch of 100 full profiles. For separately created profiles, use `growth/leaders/WORKFLOW.md`, `PLAYBOOK.md` and `LeaderProfile`.

1. Read the research audit. Each retained factual sentence needs a retrieved primary record and an honest scope statement.
2. Preserve stable person IDs. Separate current biographies from dated historical contribution records. Do not infer employment, private stakes, degrees or personal wealth.
3. Edit `entries.tsv` and the reviewed source, expanded-copy and event definitions in `app/scripts/build-ai-watchlist.ts`. The generated JSON is the rendering contract. The generator preserves only unchanged retained-claim checks, sets changed entries pending and never grants publication approval. Verify the changed claims before deliberately recording a completed check in the data.
4. From `app/`, build with the original intake:

```powershell
./node_modules/.bin/tsx.cmd scripts/build-ai-watchlist.ts "E:/system/Downloads/ai-people-to-watch-2027.md"
npm run validate:watchlist
./node_modules/.bin/tsx.cmd scripts/render-ai-watchlist-preview.tsx
```

5. Record supported claims, access dates, effective dates when established and source limitations. A record may establish a financing without proving audited finances or current employment. Preserve relevant evidence privately when the page changes.
6. Deduplicate company events. Keep financing, employee share sales, acquisition consideration and operating metrics separate. Only documented founding/seed amounts enter the selected financing chart. Unknowns remain null.
7. Use the shared chart and styles. Cover and discovery counts describe this selection, not industry demographics, influence or rank.
8. Render with `AIWatchlist`. Search filters only the index; the complete narrative remains available. The browser receives index fields, not the full source registry as client JavaScript.
9. Run validation, unit tests, TypeScript, build and desktop/mobile interaction checks. From repository root:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='C:/Users/Omer/AppData/Local/ms-playwright'
$env:WATCHLIST_BASE_URL='http://127.0.0.1:3123'
node growth/ai-people-2027/check-full-preview.cjs
```

10. `npm run validate:watchlist -- --publish` requires the article to match `PUBLICATION_REVIEW.json`, including its canonical content hash. Structural success cannot establish factual truth. Review specific changed claims, not just approval flags. The retained-claim ledger documents the narrower research scope; the separate publication review records the owner-authorized release.
11. Preview may use the research file. Production requires a published CMS Story whose `watchlist` research artifact passes the exact release snapshot validation. Publish with `app/scripts/publish-watchlist.ts`: dry-run, rehearsal on the existing isolated Production branch, private backup, then authorized Production apply. The public loader controls the route, homepage and navigation together; the CMS Story supplies sitemap inclusion and its real publication date. Never expose review data via a production environment flag or overwrite a different published release without review.
12. Refresh after a material release, role change, financing or credible contrary record. Preserve earlier events. Update dates only following substantive reviewed work. No automation is scheduled.

Education, wealth, hiring and financing leads omitted from the original attachment require fresh evidence before being restored. This feature’s narrower claim review does not certify the original biographies.
