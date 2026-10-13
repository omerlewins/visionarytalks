export type AnalyticsChoice = "granted" | "denied" | null;
export function initialAnalyticsChoice(
  saved: string | null,
  privacySignal: boolean,
): AnalyticsChoice {
  if (privacySignal) return "denied";
  if (saved === "denied" || saved === "granted") return saved;
  // No cookie consent is inferred. Null allows consent-denied cookieless
  // signals in every country, not cookie-based identification.
  return null;
}
