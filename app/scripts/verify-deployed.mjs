import { chromium, request } from "@playwright/test";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const access = JSON.parse(
  await readFile("../private/preview-access.json", "utf8"),
);
const owner = JSON.parse(
  await readFile("../private/preview-owner.json", "utf8"),
);
const headers = { "x-vercel-protection-bypass": access.bypass };
const publicAPI = await request.newContext({
  baseURL: access.url,
  extraHTTPHeaders: headers,
  maxRedirects: 0,
});
const browser = await chromium.launch();
const context = await browser.newContext();
await context.route("**/*", async (route) => {
  if (new URL(route.request().url()).origin === access.url)
    await route.continue({
      headers: { ...route.request().headers(), ...headers },
    });
  else await route.continue();
});
const login = await context.request.post(`${access.url}/api/users/login`, {
  headers,
  data: { email: owner.email, password: owner.password },
  maxRedirects: 0,
});
assert.equal(login.status(), 200, "Owner login");
const all = await (
  await context.request.get(`${access.url}/api/stories?limit=200&depth=1`, {
    headers,
  })
).json();
const doc = all.docs.find((doc) => doc.featuredImage);
assert.ok(doc, "At least one cloud article has a featured image");
const mediaPath = `/api/media/file/${encodeURIComponent(doc.featuredImage.filename)}`;
const ownerImage = await context.request.get(access.url + mediaPath, {
  headers,
});
assert.equal(ownerImage.status(), 200, "Authenticated Blob image read");
assert.ok((await ownerImage.body()).length > 1000);
assert.equal(
  (await publicAPI.get("/api/content-jobs")).status(),
  403,
  "Jobs stay private",
);
const page = await context.newPage();
await mkdir("../private/deployed-review", { recursive: true });
const smokeOnly = process.argv.includes("--smoke");
if (smokeOnly) {
  assert.equal(
    (await page.goto(`${access.url}/preview/${doc.id}/`)).status(),
    200,
  );
  assert.equal(
    (await publicAPI.get(mediaPath)).status(),
    403,
    "Unapproved image remains private",
  );
} else {
  const visible = await (
    await publicAPI.get("/api/stories?limit=200&depth=0")
  ).json();
  assert.equal(
    visible.totalDocs,
    100,
    "Exactly the original 100 published articles are public inside protected staging",
  );
  let checked = 0;
  for (const story of visible.docs) {
    assert.equal(story.legacyStatus, "publish");
    assert.equal(
      (await publicAPI.get(story.path)).status(),
      200,
      `Article route ${story.path}`,
    );
    if (++checked % 25 === 0)
      console.log(`Verified ${checked}/100 original article paths`);
  }
  const hidden = all.docs.filter((story) => story.legacyStatus === "draft");
  assert.equal(hidden.length, 7);
  for (const story of hidden)
    assert.equal(
      (await publicAPI.get(`/api/stories/${story.id}`)).status(),
      404,
    );
  const story =
    visible.docs.find((story) => story.path.includes("who-owns")) ??
    visible.docs[0];
  for (const width of [360, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", story.path, "/search/"]) {
      assert.equal((await page.goto(access.url + route)).status(), 200);
      await page.locator("h1").first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() =>
        [...document.images]
          .filter((image) => {
            const rect = image.getBoundingClientRect();
            return (
              rect.width > 0 &&
              rect.height > 0 &&
              rect.top < innerHeight &&
              rect.bottom > 0
            );
          })
          .every((image) => image.complete && image.naturalWidth > 0),
      );
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      );
      await page.screenshot({
        path: `../private/deployed-review/${width}-${route.replaceAll("/", "_")}.png`,
        fullPage: true,
      });
    }
  }
}
await writeFile(
  "../private/deployed-review/result.json",
  JSON.stringify(
    {
      url: access.url,
      smokeOnly,
      cmsDocuments: all.totalDocs,
      status: "passed",
      at: new Date().toISOString(),
    },
    null,
    2,
  ),
);
console.log(
  smokeOnly
    ? "PASS: deployed owner login, private Blob image streaming and private jobs"
    : "PASS: all 100 article paths, seven private drafts, deployed responsive layouts and cloud media",
);
await browser.close();
await publicAPI.dispose();
