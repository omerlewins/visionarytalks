import fs from "node:fs";
import path from "node:path";
const [name, company] = process.argv.slice(2);
if (!name?.trim() || !company?.trim())
  throw Error('Usage: npm run leaders:new -- "Full Name" "Company"');
const slug = name
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z]+/g, "-")
  .replace(/^-|-$/g, "");
if (!/^[a-z]+(?:-[a-z]+)+$/.test(slug))
  throw Error("Use the full first and last name");
const root = path.resolve("../growth/leaders/drafts"),
  target = path.resolve(root, slug);
if (!target.startsWith(root + path.sep)) throw Error("Invalid draft path");
if (fs.existsSync(target)) throw Error("Draft exists; refusing to overwrite");
const profile = JSON.parse(
  fs.readFileSync("../growth/leaders/PROFILE_STARTER.json", "utf8"),
);
profile.name = name;
profile.slug = slug;
profile.path = "/leaders/" + slug + "/";
profile.company = company;
profile.seo.title = name + " Net Worth: [RESEARCH]";
profile.answer = name + " net worth: [RESEARCH]";
fs.mkdirSync(target, { recursive: true });
fs.writeFileSync(
  path.join(target, "profile.json"),
  JSON.stringify(profile, null, 2) + "\n",
);
fs.copyFileSync(
  "../growth/leaders/RESEARCH_PACKET.md",
  path.join(target, "research.md"),
);
console.log(
  "Created research scaffold: " +
    target +
    "\nThis file is not imported by the website. Verify the evidence and validate it before adding it to the dataset.",
);
