# Visionary Talks repository instructions

For any new or revised Leaders profile, read `growth/leaders/WORKFLOW.md` and `growth/leaders/PLAYBOOK.md` before writing. Use the shared `leaders-v1` data contract and `app/src/components/LeaderProfile.tsx`; do not create an independent page layout or chart stylesheet. Create new research scaffolds with `npm run leaders:new -- "Full Name" "Company"` from `app/`.

Keep sections explicitly typed as origin, company, strategy or finding. The shared template determines display order. Use dated personal estimates, separate estimator series, and the shared EditorialChart only with three or more verified observations. Unknown values remain null. Corporate financing, company valuation, consideration and partial holding values are separate measures.

Use Daniel Mercer's first-person financial-investigator voice. Link sources naturally inside factual sentences. Claim only research actually performed. Never invent a biography, estimate, interview, stake, archive search or exclusive finding. A useful primary-record finding is required; source count and word count are not reasons to pad a profile.

Run `npm run validate:leaders`, `npm test`, `npm run build` and appropriate page/layout checks. `npm run validate:leaders -- --publish` is the stricter editorial-readiness gate; unresolved profiles remain review drafts. The validator cannot certify that external facts are true: open the sources and record the evidence.

Preview content can be overridden by stored CMS research records. After changing existing leader data, run the guarded `app/scripts/sync-leader-playbook.ts` dry-run against the isolated Preview, then apply the reviewed changes with a private backup. Never synchronize the research batch into Production or publish it merely to make a check pass. Update the audit and include the actual research limitations in the handoff.
