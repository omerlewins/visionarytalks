import { createSign } from "node:crypto";
export async function googleAccessToken(raw: string) {
  const key = JSON.parse(raw);
  if (
    typeof key.client_email !== "string" ||
    !key.client_email.endsWith(".gserviceaccount.com") ||
    typeof key.private_key !== "string"
  )
    throw Error("Invalid service-account configuration");
  const now = Math.floor(Date.now() / 1000),
    encode = (v: unknown) =>
      Buffer.from(JSON.stringify(v)).toString("base64url");
  const input =
    encode({ alg: "RS256", typ: "JWT" }) +
    "." +
    encode({
      iss: key.client_email,
      scope:
        "https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    });
  const signature = createSign("RSA-SHA256")
    .update(input)
    .sign(key.private_key, "base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: input + "." + signature,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) throw Error("Google credential authentication failed");
  const token = await r.json();
  if (!token.access_token) throw Error("Google returned no token");
  return {
    token: token.access_token as string,
    email: key.client_email as string,
  };
}
export async function googleReport(url: string, token: string, body: unknown) {
  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok)
    return {
      status: r.status === 403 ? "access-denied" : "request-failed",
      message:
        r.status === 403
          ? "Grant the service account property access and enable the Google API in its Cloud project."
          : "Google rejected the report request (HTTP " +
            r.status +
            "). Check the property ID and API configuration.",
    };
  return { status: "connected", data: await r.json() };
}
export function searchWindow(now = new Date()) {
  const end = new Date(now.getTime() - 3 * 86400000),
    start = new Date(end.getTime() - 27 * 86400000);
  const format = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  return { startDate: format(start), endDate: format(end) };
}
