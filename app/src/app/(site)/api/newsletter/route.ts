import { getPayload } from "payload";
import config from "@/payload.config";
import { sql } from "@payloadcms/db-postgres";
import { createHmac } from "node:crypto";
import {
  newsletterInput,
  allowedNewsletterOrigin,
  NEWSLETTER_CONSENT_VERSION,
} from "@/lib/newsletter";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const response = (status: number, message: string) =>
  Response.json(
    { message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
export async function POST(request: Request) {
  if (!allowedNewsletterOrigin(request.headers.get("origin"), request.url, request.headers.get("host"), request.headers.get("x-forwarded-proto")))
    return response(403, "Please register using the form on this website.");
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return response(415, "Please use the newsletter form.");
  if (Number(request.headers.get("content-length")) > 4096)
    return response(413, "Registration is too large.");
  const raw = await request.text();
  if (raw.length > 4096) return response(413, "Registration is too large.");
  let parsed: ReturnType<typeof newsletterInput.safeParse>;
  try {
    parsed = newsletterInput.safeParse(JSON.parse(raw));
  } catch {
    return response(
      400,
      "Enter a valid email address and confirm your consent.",
    );
  }
  if (!parsed.success)
    return response(
      400,
      "Enter a valid email address and confirm your consent.",
    );
  const success =
    "Your registration is saved. Newsletter delivery hasn’t started, so no email has been sent.";
  if (parsed.data.website) return response(202, success);
  try {
    const payload = await getPayload({ config });
    const address =
      request.headers.get("x-real-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const window = Math.floor(Date.now() / 900000);
    const bucket = createHmac("sha256", payload.secret)
      .update(address + ":" + window)
      .digest("hex");
    const expires = new Date((window + 1) * 900000).toISOString();
    const limit = await payload.db.drizzle.execute(
      sql`INSERT INTO newsletter_rate_limits (bucket, attempts, expires_at) VALUES (${bucket},1,${expires}) ON CONFLICT (bucket) DO UPDATE SET attempts=newsletter_rate_limits.attempts+1 WHERE newsletter_rate_limits.attempts<10 RETURNING bucket`,
    );
    if (!limit.rows.length)
      return response(
        429,
        "Too many attempts. Please try again in 15 minutes.",
      );
    await payload.db.drizzle.execute(
      sql`DELETE FROM newsletter_rate_limits WHERE expires_at < now() - interval '1 hour'`,
    );
    const now = new Date().toISOString();
    await payload.db.drizzle.execute(
      sql`INSERT INTO newsletter_registrations (email,status,email_verified,consented_at,consent_version,source_path,created_at,updated_at) VALUES (${parsed.data.email},'registered',false,${now},${NEWSLETTER_CONSENT_VERSION},${parsed.data.sourcePath},${now},${now}) ON CONFLICT (email) DO NOTHING`,
    );
    return response(202, success);
  } catch {
    return response(
      503,
      "Registration couldn’t be saved. Please try again later.",
    );
  }
}
