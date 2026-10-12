import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { storySEO, productionIndexing } from "../src/lib/seo";
import { storyFeaturedImage } from "../src/lib/story-image";
import { leaderMetadata } from "../src/lib/leader-schema";
import { leaderProfiles } from "../src/lib/leaders";
import { fixtures } from "../src/data/fixtures";
import robots from "../src/app/robots";
const base = {
  ...fixtures[0],
  title: "Who Owns Example? A Very Long Story",
  path: "/who-owns-example/",
  seo: {},
  dek: "Who Owns Example? A Very Long Story",
};
test("production robots explicitly allow public CMS images while staging stays blocked", () => {
  const previous = {
    APP_ENV: process.env.APP_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
  };
  try {
    process.env.APP_ENV = "production";
    process.env.VERCEL_ENV = "production";
    const live = robots();
    assert.deepEqual((live.rules as any).allow, ["/", "/api/media/file/"]);
    assert.match(String(live.sitemap), /^https:\/\/visionarytalks.com/);
    process.env.VERCEL_ENV = "preview";
    assert.equal((robots().rules as any).disallow, "/");
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
test("SEO fallback descriptions answer the topic without repeating the headline; CMS overrides take priority", () => {
  const seo = storySEO(base);
  assert.equal(seo.title, "Who Owns Example? Ownership & Investors");
  assert.notEqual(seo.description, base.title);
  assert.match(seo.description, /Example/);
  assert.equal(
    storySEO({
      ...base,
      seo: { title: "Custom title", description: "Custom description" },
    }).description,
    "Custom description",
  );
  assert.equal(
    storySEO({ ...base, seo: { title: "%title% %sep% %sitename%" } }).title,
    seo.title,
  );
  assert.ok(
    storySEO({ ...base, seo: { description: "Long sentence ".repeat(100) } })
      .description.length <= 160,
  );
});
test("canonicals reject preview hosts and tracking queries while keeping the existing public route", () => {
  assert.equal(
    storySEO({
      ...base,
      seo: { canonical: "https://example.vercel.app/wrong/" },
    }).canonical,
    "https://visionarytalks.com/who-owns-example/",
  );
  assert.equal(
    storySEO({
      ...base,
      seo: { canonical: "/who-owns-example/?utm_source=test#section" },
    }).canonical,
    "https://visionarytalks.com/who-owns-example/",
  );
  assert.equal(
    productionIndexing({ APP_ENV: "production", VERCEL_ENV: "preview" }),
    false,
  );
  assert.equal(
    productionIndexing({ APP_ENV: "production", VERCEL_ENV: "production" }),
    true,
  );
});
test("leader portraits override legacy thumbnails and all profiles have social-image metadata without inventing portraits", () => {
  const leopold = leaderProfiles.find(
    (p) => p.slug === "leopold-aschenbrenner",
  )!;
  const image = storyFeaturedImage({
    ...base,
    path: leopold.path,
    image: "/legacy.jpg",
  });
  assert.equal(image.url, "/reference/leopold-aschenbrenner-editorial-v1.png");
  assert.match(image.alt, /AI-generated/);
  assert.ok(existsSync("public" + image.url));
  for (const leader of leaderProfiles) {
    const metadata = leaderMetadata(leader);
    assert.equal(metadata.twitter.card, "summary_large_image");
    assert.equal(metadata.openGraph.images.length, 1);
    assert.equal(metadata.robots.index, false);
  }
  assert.match(
    storyFeaturedImage({ ...base, image: undefined }).url,
    /^\/social-image\/\?path=/,
  );
});
