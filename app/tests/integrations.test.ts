import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validMeasurementId,
  validPropertyId,
  validSearchProperty,
  validVerification,
  trackingAllowed,
} from "../src/lib/integration-validation";
import { searchWindow } from "../src/lib/google-reporting";
test("Google settings reject scripts, credentials and mixed identifier types", () => {
  assert.equal(validMeasurementId("G-ABC1234567"), true);
  assert.equal(validMeasurementId("G-X</script>"), false);
  assert.equal(validPropertyId("123456789"), true);
  assert.equal(validPropertyId("G-ABC123"), false);
  assert.equal(validSearchProperty("sc-domain:visionarytalks.com"), true);
  assert.equal(validSearchProperty("https://visionarytalks.com/"), true);
  for (const p of [
    "javascript:alert(1)",
    "https://user:pass@example.com/",
    "https://example.com/?token=x",
    "sc-domain:bad..com",
  ])
    assert.equal(validSearchProperty(p), false);
  assert.equal(
    validVerification('<meta name="google-site-verification">'),
    false,
  );
});
test("GA4 cannot track fixtures or staging, even when enabled", () => {
  assert.equal(
    trackingAllowed(true, "G-ABC1234567", {
      APP_ENV: "production",
      VERCEL_ENV: "production",
    }),
    true,
  );
  assert.equal(
    trackingAllowed(true, "G-ABC1234567", {
      APP_ENV: "production",
      VERCEL_ENV: "preview",
    }),
    false,
  );
  assert.equal(
    trackingAllowed(true, "G-ABC1234567", { APP_ENV: "preview" }),
    false,
  );
  assert.equal(
    trackingAllowed(false, "G-ABC1234567", { APP_ENV: "production" }),
    false,
  );
});
test("Search Console window preserves 28 Pacific calendar days over a year boundary", () => {
  assert.deepEqual(searchWindow(new Date("2026-01-04T12:00:00Z")), {
    startDate: "2025-12-05",
    endDate: "2026-01-01",
  });
});
