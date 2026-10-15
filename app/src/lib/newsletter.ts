import { z } from "zod";
export const NEWSLETTER_CONSENT_VERSION = "newsletter-2026-10-12";
export const newsletterInput = z
  .object({
    email: z
      .string()
      .trim()
      .max(254)
      .email()
      .transform((v) => v.toLowerCase()),
    consent: z.literal(true),
    sourcePath: z
      .string()
      .max(300)
      .regex(/^\/(?!\/)[a-zA-Z0-9/_-]*$/)
      .default("/"),
    website: z.string().max(500).default(""),
  })
  .strict();
export function allowedNewsletterOrigin(
  origin: string | null,
  requestURL: string,
  host?: string | null,
  forwardedProtocol?: string | null,
) {
  if (!origin) return false;
  try {
    const internal = new URL(requestURL);
    const protocol = forwardedProtocol?.split(",")[0]?.trim() ?? internal.protocol.replace(":", "");
    if (!["http", "https"].includes(protocol)) return false;
    const expected = host ? new URL(`${protocol}://${host}`).origin : internal.origin;
    return origin === expected;
  } catch {return false;}
}
