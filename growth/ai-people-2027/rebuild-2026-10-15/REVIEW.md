# October 15 corrections and completeness investigation

The owner requested a deliberate reviewed correction and publication of the existing article. This is not approval of the unreconciled original intake.

## Completeness and cache evidence before editing

The plain production URL and both `?v=reviewed-20261014` and `?v=complete-20261015` returned complete HTML (about 1.09 MB), all 100 numbered DOM entries, seven FAQs and methodology in that order. Anton Osika's entry included its complete path, outlook, read and sources. JavaScript was disabled in these comparisons. All responses had `age: 0`, `x-vercel-cache: MISS`, and `private, no-cache, no-store, max-age=0, must-revalidate`.

No live truncation or query-dependent stale response was reproduced. There is therefore no evidence of a CMS length cap, broken markdown token or failing build step. A reader-side or extraction cutoff remains possible but unproven; do not describe that as an established cause. A fresh deployment and repeat plain-URL checks are required for the corrected release.

The expanded renderer did pass full profile objects into the client index, unlike the older concise layout. Corrected that boundary to send only the eight discovery fields. This removes redundant biography and source data from the client payload; it is a payload reduction, not proof of the reported truncation's cause.

## Changed claim scope

All 100 retained October 14 entries were checked for the five required fields and reviewed for public drafting language and repeated outlook/risk openings. New outlook openings use work or events already established in that entry, not newly inferred funding or appointments. Unsupported education remains unknown. Removal of internal omission explanations does not restore the omitted claims. Earlier retained claims retain the scope and limitations of the October 14 field ledger; they were not all independently researched again on October 15.

New primary records opened October 15:

* https://reiner.org/ identifies Reiner Pope as MatX co-founder and CEO and describes earlier Google work on model efficiency, compilers and chip architecture. Replaced the jobs-page biography and removed narrower PaLM/TPU claims not established by this replacement. Degree and delivery dates remain unknown. Its dated technical-writing list establishes writing topics, not chip performance.
* https://www.linkedin.com/posts/amd_welcome-to-team-amd-sharon-activity-7338587807789002754-hLsk is AMD's own welcome post reproducing Zhou's announcement that she and several Lamini colleagues are joining AMD. It describes research, teaching, Andrew Ng and developer feedback. It does not establish purchase terms or acquisition of all Lamini. Replaced the combined-news Le Monde link, removed the unsupported comparison that most competing startups used Nvidia, and removed the specific MI400 responsibility assertion not established by this record.
* https://www.amd.com/en/blogs/by-author/sharon-zhou.html independently names Zhou on AMD's author page; it does not provide a complete biography.

Yahoo Finance destination labels replace SCMP and TechCrunch labels in entries 14 and 32; no new underlying funding claim is inferred. Adaption is the consistent displayed company name. Erik Bernhardsson's duplicated attribution is removed. All public mentions of the supplied brief and opened records are removed. Source limitations remain explicit where relevant to interpretation.

Beth Barnes remains one entry with no duplicated time-horizon passage. Kai Zenner's OECD biography is labelled OECD, with parliamentary employment separate. The expanded layout omits the optional company-funding table entirely; it cannot render its old merged or truncated rows. Wonderful links carry no junk query parameters.

Release approval is limited to this reviewed correction. Preserve the exact October 14 snapshot and ledger for safe rollout and rollback.
