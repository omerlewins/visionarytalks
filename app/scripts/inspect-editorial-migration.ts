import { readFile, writeFile } from "node:fs/promises";
import { inspectWXR } from "../src/migration/wordpress";
const source = inspectWXR(
  await readFile("../private/wordpress-2026-10-08.xml", "utf8"),
);
const posts = source.items.filter((item) => item.type === "post");
const owns = posts.filter(
  (item) => /\bwho\s+owns\b/i.test(item.title) || /\/who-owns-/.test(item.path),
);
const charts = posts.filter((item) =>
  /<(?:canvas|svg)\b|new Chart\s*\(|chartjs|data-chart/i.test(item.rawHTML),
);
await writeFile(
  "../private/editorial-inventory.json",
  JSON.stringify({ owns, charts }, null, 2),
);
console.log(
  JSON.stringify(
    {
      ownership: owns.map(({ id, title, path }) => ({ id, title, path })),
      charts: charts.map(({ id, title, rawHTML }) => ({
        id,
        title,
        canvas: (rawHTML.match(/<canvas\b/gi) || []).length,
        svg: (rawHTML.match(/<svg\b/gi) || []).length,
        scripts: (rawHTML.match(/<script\b/gi) || []).length,
      })),
    },
    null,
    2,
  ),
);
