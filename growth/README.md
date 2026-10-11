# Visionary Talks growth desk

Prepared October 9, 2026. Scope: US, English, Google organic search. Owner requested the first cycle only; no recurring automation is scheduled.

Visionary Talks answers three connected questions: **who owns it, how it makes money, and what it pays**. Leaders explains the people whose ownership and decisions connect those answers. Every answer has a source, a period and an honest statement of uncertainty.

## Read and execute

1. [Growth plan](PLAN.md): positioning, four hubs, priorities and launch-relative milestones.
2. [Editorial guidelines](EDITORIAL_GUIDELINES.md): evidence, writing, financial definitions and refresh rules.
3. [First-cycle desk](cycles/2026-10-09/REVIEW.md): five assignments, proposed copy, source checks and remaining decisions.
4. [DataForSEO research request](DATAFORSEO_REQUEST.md): the bounded live research batch to run when OAuth is restored.
5. [AI company / Leaders plan](leaders/PLAN.md): Michael Truell pilot, linked profile backlog and dedicated template specification.

Run the local first-cycle preparation from `app/`:

```powershell
npx tsx scripts/prepare-content-cycle.ts
```

The command reads the supplied Search Console export, validates all five intake packets against the existing workflow contract, checks proposed paths against the migration inventory, calculates the small wealth-data verification sample, and writes a dated report and ranked refresh queue into `private/growth/2026-10-09/`. It does not contact a model or write to the CMS. These outputs are a completed research/preparation pass, not a claim of published articles or measured growth.

The plan uses the actual Next.js/Payload application. The September briefing's Astro/MDX migration instructions have been superseded by the October build handoff. Existing story URLs stay unchanged.

## Evidence status

- Search Console: supplied `private/search-console-pages.json`, 206 page rows, filter **Web / Last 3 months**. Exact dates, country/device filters and export timestamp are absent. Do not infer them from the file's modification time.
- September 25 briefing: historical third-party estimates and keyword suggestions; not freshly verified metrics.
- October 9 local audit: existing migration source comparison and HTTP audit, plus public-page/source inspection.
- DataForSEO: installed plugin points to `https://mcp.dataforseo.com/v3/mcp`; read-only initialization returned HTTP 401. Its tools are absent from this session and plugin discovery returned no matching directory result. Restore the plugin's provider OAuth connection and recheck tool availability. Never paste API credentials into chat.

Live rankings, current volume/KD, competitor shares and backlink growth remain unknown. The public website is still WordPress; protected staging is the new application. Its 100 imported public articles are not 100 newly indexed production articles.
