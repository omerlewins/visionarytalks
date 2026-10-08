import { chromium } from "@playwright/test";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const deployed = process.argv.includes("--deployed");
const access = deployed
  ? JSON.parse(await readFile("../private/preview-access.json", "utf8"))
  : { url: "http://localhost:3000" };
const auth = JSON.parse(
  await readFile(
    deployed ? "../private/preview-owner.json" : "../private/browser-auth.json",
    "utf8",
  ),
);
const browser = await chromium.launch();
const context = await browser.newContext();
const headers = deployed ? { "x-vercel-protection-bypass": access.bypass } : {};
await context.route("**/*", async (route) =>
  route.continue({
    headers: {
      ...route.request().headers(),
      ...(new URL(route.request().url()).origin === access.url ? headers : {}),
    },
  }),
);
assert.equal(
  (
    await context.request.post(access.url + "/api/users/login", {
      headers,
      data: auth,
    })
  ).status(),
  200,
);
const response = await context.request.get(
  access.url + "/api/stories?limit=200&depth=0",
  { headers },
);
const docs = (await response.json()).docs.filter((doc) =>
  doc.legacyHTML?.includes("<table"),
);
assert.ok(docs.length > 0);
const example =
  docs.find((doc) => doc.legacyHTML.includes("US wealth ladder")) ?? docs[0];
const page = await context.newPage();
const output = "../private/table-review" + (deployed ? "-deployed" : "");
await mkdir(output, { recursive: true });
for (const width of [360, 390, 430, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  assert.equal(
    (
      await page.goto(
        access.url +
          (deployed && example._status === "published"
            ? example.path
            : `/preview/${example.id}/`),
      )
    ).status(),
    200,
  );
  const region = page.locator(".article-table-scroll").first();
  await region.waitFor();
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await region.getAttribute("tabindex"), "0");
  assert.equal(await region.getAttribute("role"), "region");
  const layout = await region.evaluate((el) => ({
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    width: el.clientWidth,
    tableWidth: el.querySelector("table").getBoundingClientRect().width,
    display: getComputedStyle(el.querySelector("table")).display,
  }));
  assert.equal(layout.overflow, false, `Page overflow at ${width}`);
  assert.equal(layout.display, "table");
  assert.ok(layout.tableWidth >= layout.width - 1);
  await region.focus();
  assert.equal(
    await region.evaluate((el) => el === document.activeElement),
    true,
  );
  if (layout.tableWidth > layout.width + 1) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(200);
    assert.ok(
      await region.evaluate((el) => el.scrollLeft > 0),
      "Keyboard scroll",
    );
    await region.evaluate((el) => (el.scrollLeft = 0));
  }
  await region.screenshot({ path: `${output}/${width}-table.png` });
}
await page.setViewportSize({ width: 390, height: 900 });
let tables = 0;
for (const doc of docs) {
  await page.goto(
    access.url +
      (deployed && doc._status === "published"
        ? doc.path
        : `/preview/${doc.id}/`),
  );
  const count = await page.locator(".legacy-content table").count();
  assert.equal(await page.locator(".article-table-scroll").count(), count);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
    doc.path,
  );
  tables += count;
}
const result = {
  status: "passed",
  deployed,
  articles: docs.length,
  tables,
  examplePath: example.path,
  widths: [360, 390, 430, 768, 1024, 1440],
};
await writeFile(`${output}/result.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
await browser.close();
