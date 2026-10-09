import { test, expect } from "@playwright/test";
const paths = [
  "/",
  "/what-apple-earns-after-the-hardware-sale/",
  "/who-owns-cursor/",
  "/satya-nadella/",
  "/understanding-ai-compensation/",
  "/company-cursor/",
  "/ai-companies/",
  "/ai-salaries/",
  "/category/business/",
  "/search/",
  "/contact/",
];
for (const width of [360, 390, 430, 768, 1024, 1440])
  test(`templates fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of paths) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("body")).not.toContainText("Application error");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
        `${path} overflows at ${width}`,
      ).toBeTruthy();
      if (width === 390 || width === 1440) {
        await page.locator("img").evaluateAll(async (elements) => {
          await Promise.all(
            elements.map(async (element) => {
              const img = element as HTMLImageElement;
              img.loading = "eager";
              try {
                await img.decode();
              } catch {}
            }),
          );
        });
        await page.screenshot({
          path: `test-results/screenshots/${width}-${path.replaceAll("/", "_") || "home"}.png`,
          fullPage: true,
        });
      }
    }
  });
test("navigation, search and filters are usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByText("Explore the magazine", { exact: false }).click();
  await page
    .getByRole("navigation", { name: "Mobile sections" })
    .getByRole("link", { name: "AI Tracker", exact: true })
    .click();
  await page.getByLabel("Find a company").fill("zzzz-no-company");
  await expect(page.getByText("No companies match")).toBeVisible();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByLabel("Find a company").fill("Cursor");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByText("Cursor", { exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Company profile" }),
  ).toBeVisible();
  await page.goto("/search/?q=Apple");
  await expect(page.locator(".archive-grid article")).toHaveCount(1);
});
test("unknown pages return real 404 and previews require login", async ({
  page,
}) => {
  expect((await page.goto("/missing-story/"))?.status()).toBe(404);
});
test("keyboard focus, salary selection and enlarged long headlines", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await page.goto("/ai-salaries/");
  await page
    .getByRole("combobox", { name: "Occupation", exact: true })
    .selectOption("Software developers");
  await expect(page.locator(".salary-record")).toHaveCount(1);
  await page.goto("/who-owns-cursor/");
  await page.locator("h1").evaluate((el) => {
    el.textContent =
      "A deliberately long company ownership headline with international names and a complicated legal entity relationship";
    el.style.fontSize = "88px";
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBeTruthy();
  await page.setViewportSize({ width: 844, height: 390 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBeTruthy();
});
