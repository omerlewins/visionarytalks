import "server-only";
import { cache } from "react";
import { cms, isDemo } from "./content";
import { trackingAllowed, validVerification } from "./integration-validation";
export const publicIntegrationSettings = cache(async () => {
  if (isDemo()) return { measurementId: null, verification: null };
  const s = await (
    await cms()
  ).findGlobal({ slug: "integrations", overrideAccess: true, depth: 0 });
  return {
    measurementId: trackingAllowed(
      Boolean(s.trackingEnabled),
      s.ga4MeasurementId,
      process.env,
    )
      ? s.ga4MeasurementId
      : null,
    verification:
      process.env.APP_ENV === "production" &&
      validVerification(s.googleVerificationToken)
        ? s.googleVerificationToken
        : null,
  };
});
