import { test } from "node:test";
import assert from "node:assert/strict";
import { initialAnalyticsChoice } from "../src/lib/analytics-preferences";
test("automatic measurement never invents cookie consent", () => {
  assert.equal(initialAnalyticsChoice(null, false), null);
  assert.equal(initialAnalyticsChoice("invalid", false), null);
  assert.equal(initialAnalyticsChoice("granted", false), "granted");
});
test("previous opt-outs and browser privacy signals override analytics", () => {
  assert.equal(initialAnalyticsChoice("denied", false), "denied");
  assert.equal(initialAnalyticsChoice("granted", true), "denied");
  assert.equal(initialAnalyticsChoice(null, true), "denied");
});
