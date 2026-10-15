# Bounded DataForSEO request

Prepared October 9, 2026. Status: waiting for provider OAuth and exposed tools. No current DataForSEO metric has been retrieved in this cycle. The server returned 401 on initialization; this is an authentication gate, not evidence of no rankings.

Default research scope: `visionarytalks.com`, Google, United States, English, desktop. Include mobile SERPs only for a material difference or a mismatch with the GSC device breakdown. Report returned collection dates and metric periods; “live” requests may still return older indexed metrics.

## Initial batch

1. Domain ranked-keyword summary and up to 50 leading ranked keywords with URL, position, demand and estimated traffic. Compare with the actual September report if recovered, not with memory. Keep provider estimated traffic separate from GSC clicks.
2. Keyword metrics for: who owns mcdonalds; who owns fiji water; who owns 7up; millionaires by state; leopold aschenbrenner net worth; who owns costco; who owns aldi; who owns the lakers; who owns temu; ai engineer salary; jane street salary; youngest billionaires. Save demand period, trend and KD where available; missing data stays null.
3. Five SERPs: McDonald's, Fiji, millionaires by state, Costco and Aldi. Save top ten organic results and features, including ads, PAA, knowledge panels and AI features when actually returned. Note the dominant intent and content format. Capture exact competing URLs before assigning competitors.
4. One domain backlink summary: referring domains, new/lost domains and quality context if available. No invented authority cutoff and no bulk crawl initially.

Start with the smallest supported calls. Inspect returned costs/credit policy and scope before expanding to large histories, competitor databases or crawls. Use the installed SEO skill's date/scope/estimate requirements. Do not embed credentials in scripts, prompts or tracked files.

## Output

Store sanitized raw responses in ignored `private/growth/<cycle>/dataforseo/` and a source manifest recording task IDs, timestamps, request scope and returned costs when present. The resulting table needs query, canonical URL, current observed/sample position, volume period, KD, SERP features, intent, source/evidence status and action.

Match query/page data to an exact-date GSC export. Identify queries in positions 4–15 with real impressions; check intent and existing URL overlap before creating pages. Treat differing tool and GSC positions as different measurements rather than a contradiction to hide.

Promote Costco/Aldi from historical opportunities only after the live batch and a full published-content duplicate check. If simple lookup queries have strong zero-click features, favor the existing source-backed table and deeper related question rather than inflate a traffic forecast. The outcome may change the backlog order.
