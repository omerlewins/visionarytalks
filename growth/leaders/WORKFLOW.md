# Leaders workflow

The flow is versioned as `leaders-v1` in `app/src/lib/leader-flow.ts`. Every profile uses the same renderer, shared tables, EditorialChart, author box and schema helper. The content data supplies facts and prose, not custom layout.

## Start a profile

From `app/`, run:

```powershell
npm run leaders:new -- "Full Name" "Company"
```

This creates `growth/leaders/drafts/first-last/profile.json` and `research.md`. It does not add placeholders to the website. The starter defaults to unknown wealth, pending review and an empty source registry. Fill it from verified research before adding the profile to `app/src/data/leader-profiles.json`.

## Research and write

1. Read [the playbook](PLAYBOOK.md), then complete [the research packet](RESEARCH_PACKET.md). Start with primary records and record what each source establishes.
2. Record legal entities, company relationships and existing ownership/salary URLs. Prepare a company brief when an ownership destination is missing; never invent a working URL.
3. Investigate the origin, founding team, product strategy and one useful documentary finding. Put sentences in sections with explicit `stage` values: `origin`, `company`, `strategy`, `finding`. Multiple sections of the same stage are allowed.
4. The renderer always orders origin → company → strategy → capital ledger → findings → wealth history → FAQ → methodology → sources → related leaders. Never rely on array positions.
5. Add every verified personal estimate to the historical registry, preserving actual estimator, date basis and source. Keep sworn/filing holding values separate from total net worth. Do not manufacture a third observation for a chart.
6. Use concise first-person analysis and explicit arithmetic. Put primary citations naturally in the sentence. Label company/investor statements as interested sources.
7. Add the dated short answer, quick facts, 4–6 verified reader questions, methodology and SEO fields. Unknown biographies are explicit; family details require public evidence and relevance.
8. Keep a review record: actual search-query evidence, findings reviewed, remaining unknowns and editorial status. Set `unknownsReviewed` only after explicitly reviewing the facts that remain unavailable; an unavailable birth date is not a reason to invent one. Do not claim live PAA or an archive-wide search unless performed.

## Validate and review

```powershell
npm run validate:leaders
npm run validate:leaders -- --profile=../growth/leaders/drafts/first-last/profile.json
npm run validate:leaders -- --publish
npm test
npm run build
```

Structural validation is mandatory in GitHub CI and before the Preview sync script can write. It checks template version, typed stages, date relationships, citations, source access dates, short answer, SEO and forbidden placeholders. The publish mode also checks the research gates. Structural success is not proof of factual accuracy or approval to publish.

Use the shared template for browser review, test mobile scrolling and HTML tables, and verify visible FAQs match schema. Add an illustration only after creating a suitable labeled asset; do not fabricate an image path. Verify company and co-founder links and reciprocal links in Preview.

## Save and deploy

Add verified sources to the registry and the completed profile to the batch. Extend company-link and portrait mappings only with existing destinations/assets. Keep Michael Truell's existing canonical URL. New profiles use `/leaders/first-last/`.

The Preview loader can read profiles from CMS research markers. Updating Git alone will not replace those stored records. The guarded sync script updates existing managed drafts only; registering a new profile requires a reviewed import that handles its sources, Story and marker together. It requires a matching managed draft and marker for every repository profile and refuses published records. Preserve a private backup and inspect a dry-run before applying.

Push to the existing review branch only within session authorization, check the Vercel deployment and report actual remaining research gaps. Refresh source values quarterly and after material events; append history and update checked dates only following real research. No scheduler is implied by this workflow.

For the approved launch batch, `growth/EDITORIAL_RELEASE_REVIEW.json` binds individual decisions to hashes of the reviewed content and source files. Run `npm run validate:release` before preparing its publication release. An edit invalidates those hashes; review the changed claims and update the review record deliberately. Do not refresh hashes or approval flags merely to pass validation.
