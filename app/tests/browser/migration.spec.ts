import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { decodeHTML } from "entities";

test("all imported articles have private previews with original paths and linked media", async ({
  page,
  request,
}) => {
  test.skip(
    process.env.TEST_MIGRATION !== "true",
    "Requires the privately supplied WordPress corpus and local CMS",
  );
  test.setTimeout(240000);
  const auth = JSON.parse(
    await readFile("../private/browser-auth.json", "utf8"),
  );
  const login = await page.request.post("/api/users/login", {
    data: { email: auth.email, password: auth.password },
  });
  expect(login.ok()).toBeTruthy();
  const report = JSON.parse(
    await readFile("../private/migration/reconciliation.json", "utf8"),
  );
  const posts = report.records.filter((record: any) => record.type === "post");
  expect(posts).toHaveLength(107);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const post of posts) {
    expect(
      post.targetID,
      `Missing target for source ${post.sourceID}`,
    ).toBeTruthy();
    const doc = await (
      await page.request.get(`/api/stories/${post.targetID}?depth=1&draft=true`)
    ).json();
    expect(doc._status).toBe("draft");
    expect(doc.path).toBe(post.path);
    expect(doc.legacyStatus).toBe(post.status);
    expect((await page.goto(`/preview/${post.targetID}/`))?.status()).toBe(200);
    await expect(page.locator(".story-hero h1")).toHaveText(
      decodeHTML(doc.title),
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `Overflow for ${post.sourceID}`,
    ).toBeTruthy();
    if (doc.featuredImage) {
      const picture = page.locator(".profile-image img");
      await expect(picture).toBeVisible();
      await expect
        .poll(() =>
          picture.evaluate(
            (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
          ),
        )
        .toBeTruthy();
    }
  }
  for (const post of [
    posts[0],
    posts[Math.floor(posts.length / 2)],
    posts.at(-1),
  ]) {
    for (const width of [360, 390, 430, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect((await page.goto(`/preview/${post.targetID}/`))?.status()).toBe(200);
      await expect(page.locator(".story-hero h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBeTruthy();
      if (width === 390 || width === 1440)
        await page.screenshot({
          path: `../private/review/migration-${post.sourceID}-${width}.png`,
          fullPage: true,
        });
    }
  }
  expect((await request.get(`/preview/${posts[0].targetID}/`)).status()).toBe(
    404,
  );
});
