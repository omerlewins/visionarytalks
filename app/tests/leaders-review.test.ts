import { test } from "node:test";
import assert from "node:assert/strict";
import { isLeadersReview } from "../src/lib/leaders-review";

test("isolated Vercel Preview exposes research drafts without replacing CMS mode", () => {
  assert.equal(
    isLeadersReview({
      APP_ENV: "preview",
      VERCEL_ENV: "preview",
      DEMO_MODE: "false",
    }),
    true,
  );
  assert.equal(
    isLeadersReview({ APP_ENV: "development", DEMO_MODE: "true" }),
    true,
  );
  assert.equal(
    isLeadersReview({ APP_ENV: "development", DEMO_MODE: "false" }),
    false,
  );
});
test("production blocks leader drafts even with fixture flags", () => {
  for (const env of [
    { APP_ENV: "production", VERCEL_ENV: "preview", DEMO_MODE: "true" },
    { APP_ENV: "preview", VERCEL_ENV: "production", DEMO_MODE: "true" },
    { APP_ENV: "production", VERCEL_ENV: "production", DEMO_MODE: "false" },
    { VERCEL_ENV: "production", DEMO_MODE: "true" },
  ])
    assert.equal(isLeadersReview(env), false);
  assert.equal(
    isLeadersReview({ APP_ENV: "preview", DEMO_MODE: "false" }),
    false,
  );
});
