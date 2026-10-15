import { mkdir, writeFile, readFile } from "node:fs/promises";
const company = (process.argv[2] ?? "").trim();
if (!company) throw Error('Usage: npm run ownership:new -- "Company Name"');
const slug = (process.argv[3] ?? company)
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");
if (!slug) throw Error("A usable company slug is required");
const template = JSON.parse(
  await readFile("../growth/ownership/TEMPLATE.json", "utf8"),
);
await mkdir("../growth/ownership/drafts", { recursive: true });
const file = `../growth/ownership/drafts/${slug}.json`;
await writeFile(
  file,
  JSON.stringify(
    {
      ...template,
      slug,
      company,
      title: `Who Owns ${company}? (2026)`,
      answer: `${company} is owned by [VERIFY legal shareholders].`,
      gaps: [
        "Scaffold only. No research performed. Complete the playbook before adding to the batch.",
      ],
    },
    null,
    2,
  ) + "\n",
  { flag: "wx" },
);
console.log(
  `Created ${file}. Read growth/ownership/WORKFLOW.md; this scaffold is not a publishable article.`,
);
