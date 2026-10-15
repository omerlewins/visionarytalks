import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
test("CMS intake and review remain private and fit mobile/desktop", async ({
  page,
  request,
}) => {
  test.skip(
    process.env.TEST_CMS !== "true",
    "Requires local PostgreSQL and verify-workflows fixture setup",
  );
  const auth = JSON.parse(
    await readFile("../private/browser-auth.json", "utf8"),
  );
  expect((await request.get("/api/content-jobs/")).status()).toBe(403);
  await page.goto("/admin/login/");
  await page.getByLabel("Email").fill(auth.email);
  await page.getByLabel("Password", { exact: true }).fill(auth.password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await page.waitForURL(/\/admin\/?$/);
  for (const width of [360, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/admin/collections/content-inbox/create/",
      "/admin/collections/content-jobs/",
    ]) {
      await page.goto(path);
      await expect(page.getByText("Application error")).toHaveCount(0);
      await expect
        .poll(
          () =>
            page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
          { message: `${path} overflows at ${width}` },
        )
        .toBeTruthy();
      if (width === 390 || width === 1440)
        await page.screenshot({
          path: `test-results/screenshots/cms-${width}-${path.includes("inbox") ? "inbox" : "review"}.png`,
          fullPage: true,
        });
    }
  }
  const stories = await (
    await page.request.get(
      "http://localhost:3000/api/stories?limit=1&sort=-createdAt",
    )
  ).json();
  const story = stories.docs[0];
  await page.goto(`/preview/${story.id}/`);
  await expect(page.locator("h1")).toHaveText(story.title);
  await expect(
    page.getByText(story.sections[0].text, { exact: true }).first(),
  ).toBeVisible();
  expect((await request.get(`/preview/${story.id}/`)).status()).toBe(404);
});
