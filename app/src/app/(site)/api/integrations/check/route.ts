import { cms } from "@/lib/content";
import {
  googleAccessToken,
  googleReport,
  searchWindow,
} from "@/lib/google-reporting";
import {
  validPropertyId,
  validSearchProperty,
} from "@/lib/integration-validation";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const payload = await cms(),
    { user } = await payload.auth({ headers: request.headers });
  if (!user || !["admin", "editor"].includes(user.role))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const settings = await payload.findGlobal({
    slug: "integrations",
    overrideAccess: false,
    user,
  });
  const empty = {
    searchConsole: {
      status: "not-configured",
      message: "Save a Search Console property.",
    },
    analytics: {
      status: "not-configured",
      message: "Save a numeric GA4 property ID.",
    },
  };
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
    return Response.json(
      {
        ...empty,
        error:
          "Reporting credentials are not configured. Set GOOGLE_SERVICE_ACCOUNT_JSON in Vercel and grant its service account access to your properties.",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  try {
    const { token, email } = await googleAccessToken(
        process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
      ),
      dates = searchWindow();
    const [sc, ga] = await Promise.all([
      validSearchProperty(settings.searchConsoleProperty)
        ? googleReport(
            "https://www.googleapis.com/webmasters/v3/sites/" +
              encodeURIComponent(settings.searchConsoleProperty!) +
              "/searchAnalytics/query",
            token,
            { ...dates, type: "web", dataState: "final", rowLimit: 1 },
          )
        : Promise.resolve(empty.searchConsole),
      validPropertyId(settings.ga4PropertyId)
        ? googleReport(
            "https://analyticsdata.googleapis.com/v1beta/properties/" +
              settings.ga4PropertyId +
              ":runReport",
            token,
            {
              dateRanges: [{ startDate: "28daysAgo", endDate: "yesterday" }],
              metrics: [
                { name: "totalUsers" },
                { name: "sessions" },
                { name: "screenPageViews" },
              ],
            },
          )
        : Promise.resolve(empty.analytics),
    ]);
    const searchConsole =
      "data" in sc
        ? {
            status: sc.status,
            message:
              "Search performance for the 28-day window below, ending three days ago. Dates follow Search Console’s Pacific time zone.",
            report: { ...dates, totals: sc.data.rows?.[0] ?? null },
          }
        : sc;
    const analytics =
      "data" in ga
        ? {
            status: ga.status,
            message:
              "Last 28 days through yesterday in the GA4 property’s time zone.",
            report: {
              metrics: ga.data.metricHeaders,
              rows: ga.data.rows ?? [],
            },
          }
        : ga;
    return Response.json(
      { serviceAccountEmail: email, searchConsole, analytics },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      {
        error:
          "Unable to authenticate or reach Google. Check the service-account credential and API setup; no connection has been confirmed.",
      },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
