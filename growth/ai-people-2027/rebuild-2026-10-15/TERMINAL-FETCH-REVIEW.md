# Follow-up: non-browser and crawler-client responses

On October 15, 2026, at 08:32:51 to 08:33:00 UTC, `curl.exe` fetched all nine combinations of:

* `/ai-people-to-watch/`
* `/ai-people-to-watch`
* `/ai-people-to-watch/?ref=qa1015`

and default curl, the owner's exact Googlebot user-agent string, and `facebookexternalhit/1.1`. No browser or JavaScript renderer participated. Every response was HTTP 200, complete through `</html>`, contained 100 profile sections and `Frequently asked questions`, and contained none of `My 2027 test`, `The bets behind them.` or `Explore the bottlenecks`.

All nine responses reported `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` and `X-Vercel-Cache: MISS`. Raw HTML, headers and timestamped JSON are saved privately under `private/growth/ai-people-2027/curl-clients/`. Repeat with `./growth/ai-people-2027/check-curl-clients.ps1` from the repository root. The script fails if any required check regresses.

Vercel inspect and alias listing confirm that apex, www and the project's default domain all point to `visionarytalks-92oukeu43-omer-webielcoms-projects.vercel.app`, deployment `dpl_AKu6b1K8RGE9pS5xFfcdC5FxnXNy`. The older branch Preview alias is separate from those live domains. The article route is `force-dynamic`; the middleware forwards all user agents without crawler-specific rendering. No prerender/bot rewrite exists in the inspected route, middleware or Vercel configuration. DNS resolved to 216.198.79.65 and 64.29.17.65. Direct curl requests to each address using both crawler user agents also returned all 100 profiles and FAQ, with no old template text. Responses identify Vercel, with Age 0; no active Cloudflare HTML-cache path was observed.

The reported old HTML was not reproduced. No production routing or cache mutation was justified by these results. A stale third-party fetcher cache remains a possibility, not an established diagnosis. The external web-reading tool failed with a cache-miss/access error and did not provide old or new HTML; it cannot serve as independent confirmation.

Search Console Test live URL and Request indexing remain unperformed. Both browser-control and the computer-use fallback failed during runtime initialization with `failed to write kernel assets: The system cannot find the path specified. (os error 3)`. No Google account state or inspected HTML was accessible. Spoofing Googlebot's user agent in curl is not equivalent to Google's actual URL Inspection fetch. Do not report that Google's tested HTML or indexing request has been confirmed.
