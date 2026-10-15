import { writeFileSync } from "node:fs";
import { previewWatchlist } from "../src/lib/watchlist-preview";
const article = previewWatchlist();
const plain = (s: string) =>
  s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`]/g, "");
const openings = new Map<string, number[]>();
const rows = article.people.map((p) => {
  const profile = p.profile!;
  const fields = [
    profile.hook,
    profile.education,
    profile.career,
    profile.outlook,
    profile.read,
  ];
  const prose = fields.map((s) => plain(s!)).join(" ");
  const words = prose.trim().split(/\s+/).length;
  const opening = plain(profile.outlook)
    .toLowerCase()
    .split(/\s+/)
    .slice(0, 4)
    .join(" ");
  openings.set(opening, [...(openings.get(opening) || []), p.number]);
  return {
    number: p.number,
    name: p.name,
    words,
    fields: fields.every(Boolean),
    noDrafting:
      !/(?:\bsupplied\b|\bbrief\b|opened biography|before print|\bI omit\b|out of this entry)/i.test(
        prose,
      ),
    noLongDashes: !/[\u2013\u2014]/.test(prose),
    noOldLabels: !/(?:My 2027 test|What would weaken the case)/.test(prose),
    financialDates: fields.every(
      (s) =>
        !/(?:\$\d|\d[.,\d]* (?:million|billion))/.test(plain(s!)) ||
        /(?:19|20)\d{2}/.test(plain(s!)),
    ),
    sourceLabels: profile.sources.every(
      (s) =>
        !(
          /SCMP/i.test(s.title) && !new URL(s.url).hostname.endsWith("scmp.com")
        ) &&
        !(
          /TechCrunch/i.test(s.title) &&
          !new URL(s.url).hostname.endsWith("techcrunch.com")
        ),
    ),
  };
});
const repeatedOpenings = [...openings].filter(
  ([, numbers]) => numbers.length > 3,
);
const report = {
  checkedAt: new Date().toISOString(),
  mode: "isolated Preview copy review",
  entries: rows.length,
  rows,
  repeatedOpenings,
};
writeFileSync(
  "../private/home-consolidated/watchlist-quality.json",
  JSON.stringify(report, null, 2),
);
const issues = rows.filter(
  (r) =>
    r.words < 150 ||
    r.words > 220 ||
    !r.fields ||
    !r.noDrafting ||
    !r.noLongDashes ||
    !r.noOldLabels ||
    !r.sourceLabels ||
    !r.financialDates,
);
console.log(
  JSON.stringify(
    {
      entries: rows.length,
      wordRange: [
        Math.min(...rows.map((r) => r.words)),
        Math.max(...rows.map((r) => r.words)),
      ],
      issues,
      repeatedOpenings,
    },
    null,
    2,
  ),
);
if (issues.length || repeatedOpenings.length) process.exitCode = 1;
