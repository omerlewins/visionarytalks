import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";
const auth = JSON.parse(await readFile("../private/browser-auth.json", "utf8"));
const browser = await chromium.launch();
const context = await browser.newContext();
await context.request.post("http://localhost:3000/api/users/login", {
  data: auth,
});
const page = await context.newPage();
for (const width of [360, 390, 430, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  for (const route of [
    "/admin/collections/content-inbox/create",
    "/admin/collections/content-jobs",
  ]) {
    await page.goto(`http://localhost:3000${route}`);
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(() =>
      [...document.querySelectorAll("body *")]
        .filter((el) => el.getBoundingClientRect().right > innerWidth + 1)
        .map((el) => ({
          tag: el.tagName,
          class: el.className,
          right: el.getBoundingClientRect().right,
        }))
        .slice(0, 8),
    );
    console.log(JSON.stringify({ width, route, overflow }));
    await page.screenshot({
      path: `test-results/screenshots/admin-${width}-${route.includes("inbox") ? "inbox" : "jobs"}.png`,
      fullPage: true,
    });
  }
}
await browser.close();
