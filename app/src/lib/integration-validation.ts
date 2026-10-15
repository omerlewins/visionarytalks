export const validMeasurementId = (v: unknown) =>
  typeof v === "string" && /^G-[A-Z0-9]{4,20}$/.test(v);
export const validPropertyId = (v: unknown) =>
  typeof v === "string" && /^[1-9][0-9]{0,19}$/.test(v);
export function validSearchProperty(v: unknown) {
  if (typeof v !== "string") return false;
  if (/^sc-domain:[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/i.test(v))
    return !v.includes("..");
  try {
    const u = new URL(v);
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      !u.search &&
      !u.hash
    );
  } catch {
    return false;
  }
}
export const validVerification = (v: unknown) =>
  typeof v === "string" && /^[a-zA-Z0-9_-]{10,200}$/.test(v);
export function trackingAllowed(
  enabled: boolean,
  id: unknown,
  env: Record<string, string | undefined>,
) {
  return (
    enabled &&
    validMeasurementId(id) &&
    env.APP_ENV === "production" &&
    (env.VERCEL_ENV === undefined || env.VERCEL_ENV === "production")
  );
}
