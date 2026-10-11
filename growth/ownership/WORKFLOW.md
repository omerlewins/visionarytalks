# Who Owns investigation workflow

Read [the playbook](PLAYBOOK.md) before researching or revising an investigation. Repository instructions in AGENTS.md require this flow for future work.

## Create and research

From `app/`, run `npm run ownership:new -- "Company Name" "company-slug"`. The scaffold in `growth/ownership/TEMPLATE.json` contains placeholders, not publishable facts. Research against the `ownership-v1` contract in `app/src/lib/ownership-contract.ts`.

1. Open dated primary records: issuer announcements, investor disclosures, legal terms, regulatory filings and applicable corporate records. Record actual evidence, publisher, publication date and access date in the source registry. Label reporting separately. Do not claim an archive search or interview unless performed.
2. Establish the legal entity, current company status, documented holders, stake denominator/date and voting information. Unknown private percentages remain unknown. An investor announcement establishes participation, not the current cap table. A leadership title does not establish control.
3. Write the first-sentence answer and the fixed sections: takeaways; 2026 changes; ownership and holder table; relevant control/entity explanations; founder story; funding table and chart; timeline; primary-record finding; leadership; stock/IPO; FAQs; watch list; methodology. Use Daniel Mercer's first-person investigator voice. Link sources naturally in sentences with `[description](source:source-id)`.
4. Charts use `EditorialChart`, the existing post design. Only exact comparable priced equity observations qualify. Never plot debt, employee tenders, deal consideration, proposed rounds, unknown values or lower bounds as exact prices. Keep currencies separate; use log scale for a 10x or greater range. No invented intermediate values. Fewer than two comparable points means a table with an explicit explanation.
5. Capture relevant live Google questions and distinguish search intent from verified answers. Keep SEO provider metrics separate. Check all internal destinations; link each target once contextually. Add at least three incoming links on publication, including a researched founder profile when available. Do not create links to profiles that do not exist.

## Integrate and validate

Add the researched file and its source registry entries to `app/src/data/ownership-investigations.json`. Do not create another layout. `OwnershipInvestigation` renders the fixed flow and shared tables/charts; `ownershipSchema` emits only sourced history and no invented publication date. SVG data cards live in `app/public/ownership-cards/`.

Run `npm run validate:ownership`, `npm run typecheck`, `npm test` and `npm run build`. CI enforces review validation. Check desktop/mobile tables, chart labels, dates, FAQ/schema consistency, source links, internal links and page overflow. Contract validation checks structure and provenance references; it cannot certify external facts. Update AUDIT.md with real gaps and actual checks.

## CMS and Preview

Use the existing isolated Neon Preview, following the repository's Neon instructions. `npm run sync:ownership` is a dry-run; `-- --apply` saves with a private backup. It requires APP_ENV=preview, a Neon project identifier and a non-production VERCEL_ENV. Never point it at Production.

Each draft has a Stories record with a complete readable HTML mirror, a Content Inbox research proposal and a Claim Evidence record keyed `ownership-file:/who-owns-company/`. The **Claim Evidence data.file JSON is the canonical structured Preview article**, including tables and chart observations. Edit it in `/admin/collections/claim-evidence`; it is validated on read. The Stories mirror is for CMS draft review; changing its text alone does not override the structured article. New source IDs also require a registry change in Git. Synchronizing the batch updates structured records, so export deliberate CMS edits to Git before another sync.

`/category/ownership/` and `/content-review/` expose the batch only in development/Preview. It is noindex and excluded from Production routes and the public sitemap. Existing articles receive the planned contextual backlinks only in Preview.

## Publication and refresh

Run `npm run validate:ownership -- --publish` as a separate editorial gate. Resolve or explicitly assess each research gap, refresh current transaction/IPO status, check private access restrictions, confirm all source claims and set the true first-publication date only when published. Publication requires a deliberate production integration; pushing review files does not publish them. Never publish merely to make a validator pass.

After publication, review monthly and after funding, closing, corporate conversion or IPO news. Compare issuer/regulator records first, reconcile changed share denominators and preserve historical evidence. Refresh both article text and schema dates. This document defines the cycle; it does not schedule an automation.
