const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "../..");
process.chdir(root);
const a = require("../src/data/ai-watchlist-published-2026-10-13.json");
const rows = require("../../growth/ai-people-2027/rebuild-2026-10-14/intake.json");
const m = fs.readFileSync(
  "growth/ai-people-2027/rebuild-2026-10-14/supplied-article.md",
  "utf8",
);
const clean = (t) =>
  t
    .replace(/[\u2013\u2014]/g, ", ")
    .replace(/\s*(?:so )?recheck it before print\.?/gi, "")
    .replace(/,?\s*so his title needs a check before print\.?/gi, ".")
    .replace(/\s+/g, " ")
    .trim();
a.layout = "profiles";
a.checked = "2026-10-14";
a.editionChecked = "2026-10-13";
a.title =
  "100 AI People to Watch in 2027: The Engineers, Researchers and Founders Building What Comes Next";
a.seo = {
  title: "100 AI People to Watch in 2027: Engineers, Researchers and Founders",
  description:
    "100 AI researchers, engineers, founders and innovators to watch in 2027, with their education, career history, dated funding figures and sources.",
};
a.editorialReview.status = "awaiting-editorial-review";
a.editorialReview.limitations = [
  "Revised source material is under independent verification. Publication is not authorized by this Preview build.",
  "Blocked sources and unsupported education, role and financial claims are recorded in the rebuild audit.",
];
a.introduction = m
  .split("## The 100 at a glance")[0]
  .split(/\r?\n\r?\n/)
  .filter((p) => p && !/^#|^\*Suggested/.test(p))
  .map(clean)
  .slice(0, 3);
const patternText = m
  .split("## What the 100 tell me")[1]
  .split("## Frontier AI researchers")[0];
a.patterns = [
  ...patternText.matchAll(/\*\*(\d)\. ([^*]+)\*\* ([\s\S]*?)(?=\r?\n\r?\n|$)/g),
].map((x) => ({ title: clean(x[2]), text: clean(x[3]) }));
const faqText = m
  .split("## Frequently asked questions")[1]
  .split("## How I built this list")[0];
a.faq = [
  ...faqText.matchAll(/\*\*([^*]+)\*\*\r?\n([\s\S]*?)(?=\r?\n\r?\n|$)/g),
].map((x) => ({ question: clean(x[1]), answer: clean(x[2]) }));
a.methodology = [
  {
    label: "Selection",
    text: "I chose people with a documented paper, codebase, product, company, policy contribution or investment record, and a concrete question to follow into 2027. Numbering follows section order.",
  },
  {
    label: "Sources",
    text: "I consulted university and lab pages, papers, company announcements and filings first. Reputable reporting fills some gaps. Source access failures and unresolved claims remain in the research audit.",
  },
  {
    label: "Figures",
    text: "A dated company valuation is separate from personal wealth. Company-reported revenue, funding announcements, employee tenders and acquisition consideration are different measures. Reported fundraising talks are not confirmed closed rounds.",
  },
  {
    label: "Limits",
    text: "I did not interview these people or audit their finances. Unknown education, graduation dates, current employment and private holdings stay unknown.",
  },
  {
    label: "Corrections",
    text: "If a record is outdated, use the [corrections page](https://visionarytalks.com/corrections/).",
  },
];
for (const p of a.people) {
  const r = rows.find((x) => x.number === p.number);
  p.profile = {
    hook: clean(r.hook),
    education: clean(r.Education),
    career: clean(r["The path"]),
    outlook: clean(r["Why I'm watching in 2027"]),
    read: clean(r["My read"]),
    location: r.header.split(" · ")[2],
    sources: r.links,
  };
  p.checked = "2026-10-14";
  p.reviewState = "pending";
}
fs.writeFileSync(
  "app/src/data/ai-watchlist.json",
  JSON.stringify(a, null, 2) + "\n",
);
console.log({
  intro: a.introduction.length,
  patterns: a.patterns.length,
  faq: a.faq.length,
  entries: a.people.length,
  words: a.people
    .map((p) => ({
      number: p.number,
      words: ["hook", "education", "career", "outlook", "read"]
        .map((k) => p.profile[k])
        .join(" ")
        .split(/\s+/).length,
    }))
    .filter((p) => p.words > 220 || p.words < 150),
});

require("./apply-watchlist-corrections.cjs");
