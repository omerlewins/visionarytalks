# Leaders template: implementation specification

Pilot: Michael Truell. Extend the approved editorial style rather than introduce a new visual system.

Review artifact: `preview.html` is a standalone local HTML prototype with the generated portrait, company links and evidence card. It is not integrated into the production Next.js/Payload renderer. Chromium checks passed at 360, 390, 430, 768, 1024 and 1440 pixels: portrait loaded and no page overflow. Desktop/mobile screenshots were visually inspected. Full keyboard/200% zoom and real CMS data checks remain part of implementation acceptance.

## Desktop reading order

1. Leaders breadcrumb and **THE LEADERS / AI COMPANIES** label.
2. Split hero: question-led headline, one-sentence role/context, real byline and publication/update dates on the left; large monochrome AI portrait on the right. Figure caption always says **AI-generated editorial illustration**.
3. Direct-answer card answering both identity and wealth; estimate carries provider and observation date in the same card. Do not call the full biography verified when only a wealth observation was checked.
4. Four facts: company/role; company relationship; estimated net worth with date; wealth basis. Do not fill an age, degree or exact stake from inference.
5. Linked company card: **The company behind the profile → Who owns Cursor?** Do not render a founder→company chain that falsely implies current sole ownership.
6. Contents and reading column: who is the person; company/role; pivotal career moments; how the wealth estimate works; personal stake/control limits; sources. Keep existing typography and restrained rules.
7. Wealth evidence table: observation date, value, basis, source and interpretation. A single dated observation gets a table/card, not a growth chart. Missing years stay absent. Historical financing values are company observations, not points on a personal-wealth graph.
8. Sourced career timeline and company relationships. Every event/role needs source IDs; visible dates have precision matching the evidence. Source links on timeline rows are necessary—the current generic timeline renders no source links.
9. Related reading: company ownership, relevant money story and salary dataset. A salary card is about company pay evidence, not the leader's compensation.
10. Sources/methods, approved update history, author/corrections information. Show quote/interview modules only when supported; omit empty charts and imaginary interviews.

## Mobile

Stack hero and portrait; use a two-column facts grid and collapsible contents. Keep the identity/wealth answer and source date near the headline rather than buried after a long image. Preserve complete head outline; crop shoulder collage rather than face. Portrait needs natural aspect ratio and no page overflow. Tables scroll within a labeled keyboard-accessible region. Test at 360, 390, 430, 768, 1024 and 1440 pixels and with 200% text zoom.

## Data and CMS gaps

Use existing Story `kind=leader`, `shortAnswer`, `facts`, `sources`, `metrics`, `timeline`, `relatedStories`, and people/company-role collections. Add a typed leader presentation module when implementing: subject/person relation, approved role summary, linked company-file path, portrait/credit, net-worth observation reference, source-check date/reviewer and update-history entries. Dates of an observation, source publication and editorial review must stay distinct.

Do not use a `relations` ownership chain to encode employment: the generic renderer currently labels these as ownership and displays a stake. Model cofounder/CEO as typed company roles; exact equity stays unknown unless sourced. A source-linked net-worth observation should display `basis=estimated`, USD, date and source. The general section text renderer does not parse inline Markdown links; use CMS rich-text links, explicit related-story relationships or a dedicated company card rather than insert raw Markdown into paragraph strings.

Structured data: Article describes the authored reporting; `about` references a Person subject with supported name/company relationship and source identities. Article author is the real reporter, not Michael Truell. BreadcrumbList matches live routes. Person schema must not invent a private wealth field or unsupported education/employment dates.

## Acceptance gate

- Portrait likeness reviewed and correctly credited; original photo is a private identity reference only, not an asset to republish.
- Both headline questions answered; estimate source/date/basis visible; no fabricated numerical stake.
- Real byline, canonical, dates and approved sources; correct Person-subject versus Article-author distinction.
- Contextual link and company card reach the real Cursor URL; reciprocal link releases with the profile.
- No raw Markdown strings, empty fabricated data modules, unsourced quotes or zero-filled wealth chart.
- Mobile/keyboard/crop checks; current review record retained; existing company article path and dates preserved.

## Research and narrative standard

The Michael Truell pilot now establishes the minimum reporting depth: sourced early-life records; credited projects and collaborators; contemporary evidence of product decisions; dated business milestones; and current personal wealth with its source and date. Follow michael-truell-evidence.md.

Visibly distinguish documentary facts, founder/company claims, investor retrospectives and our analysis. Explain what our synthesis adds. Public-source archival research must not be labeled an original interview. No generic leadership filler or causal claims about personality unsupported by reporting. Keep financial definitions separate.


## Financial investigator voice and contextual links

Follow the money and distinguish company capital, valuation, personal assets and transaction consideration. Each profile needs a distinctive supported finding: archival evidence, disclosed transaction terms, a meaningful comparison or a reproducible calculation. Do not claim exclusive discovery or independent audit when working from public announcements.

Use natural descriptive links within sentences. Source lists belong in the evidence ledger; public prose should read as reporting. Tables and related-reading cards may use structured links. Keep estimate labels, observation dates, calculation scopes and material unknowns visible.


## Concise net-worth requirement

Every leader gets the module specified in NET_WORTH_MODULE.md: one answer paragraph, a sourced event timeline, an evidence-appropriate graphic and a short methodology note. Michael's snapshot and event timeline are implemented in the private preview. Historical personal-wealth points need comparable dated evidence; company financing and deal consideration stay off that axis.

All leader graphs follow the homepage EditorialChart design and shared tokens. Their methodology explains our independent public-record research, cross-checks, calculations and source limitations; personal wealth estimates retain their actual provider and date.
