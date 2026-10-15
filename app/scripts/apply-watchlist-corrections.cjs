const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "../..");
const folder = path.join(root, "growth/ai-people-2027/rebuild-2026-10-14");
const destination = path.join(root, "app/src/data/ai-watchlist.json");
const article = JSON.parse(fs.readFileSync(destination, "utf8"));
if (article.layout !== "profiles")
  throw new Error("Expected the isolated profile revision.");
const corrections = require(path.join(folder, "corrections.cjs"));
for (const [number, value] of [
  require(path.join(folder, "financial-corrections.cjs")),
  require(path.join(folder, "additional-education.cjs")),
  require(path.join(folder, "copy-trims.cjs")),
].flatMap((set) => Object.entries(set))) {
  corrections[number] = {
    ...corrections[number],
    ...value,
    evidence: [
      ...new Set([
        ...(corrections[number]?.evidence || []),
        ...(value.evidence || []),
      ]),
    ],
  };
}
const intake = JSON.parse(
  fs.readFileSync(path.join(folder, "intake.json"), "utf8"),
);
const fields = {
  hook: "hook",
  education: "Education",
  career: "The path",
  outlook: "Why I'm watching in 2027",
  read: "My read",
};
const ledger = [];
for (const person of article.people) {
  const correction = corrections[person.number];
  const original = intake.find((row) => row.number === person.number);
  if (!correction?.read) {
    const risk = person.risk.replace(/[.!?]+$/, "");
    person.profile.read =
      "My concern is " + risk[0].toLowerCase() + risk.slice(1) + ".";
  }
  if (correction) {
    for (const [key, value] of Object.entries(correction)) {
      if (key === "evidence") continue;
      if (fields[key]) {
        ledger.push({
          number: person.number,
          name: person.name,
          field: key,
          old: original[fields[key]],
          revised: value,
          evidence: correction.evidence,
          checked: "2026-10-14",
          scope: "Specific correction; not approval of all expanded claims.",
        });
        person.profile[key] = value;
      } else if (["role", "organization"].includes(key)) {
        person[key] = value;
      }
    }
    for (const url of correction.evidence || [])
      if (!person.profile.sources.some((source) => source.url === url))
        person.profile.sources.push({
          title: new URL(url).hostname.replace(/^www\./, ""),
          url,
        });
  }
  // A retrieval is not a completed claim check. Preserve the pending editorial gate.
  person.reviewState = "pending";
  for (const key of Object.keys(fields))
    person.profile[key] = person.profile[key]
      .replace(/[\u2013\u2014]/g, ", ")
      .replace(/\s+/g, " ")
      .replace(/[,;]\s*$/, ".");
  person.profile.sources = person.profile.sources.filter(
    (source) =>
      !/wikipedia\.org|grokipedia|aiwiki\.ai|iq\.wiki/.test(source.url),
  );
  if (!person.profile.sources.length)
    person.profile.sources.push({
      title: article.sources[person.sourceId].title,
      url: article.sources[person.sourceId].url,
    });
}
article.introduction = [
  "The 100 people below aren't the ones you already know. They contributed research, maintain open-source projects, build companies or shape the rules around AI. I selected them for a documented contribution and a concrete question to follow into 2027, rather than for a follower count or a presumed personal fortune.",
  "I start with records: university biographies, papers, company filings and funding announcements. I distinguish what a source establishes from what it merely suggests. A company valuation is never a person's wealth, a fundraising discussion is never a closed round, and a historical credit is never automatic proof of a current job. This expanded Preview remains under review where the restored biography needs further evidence.",
  "The list has five sections: frontier researchers, infrastructure engineers, founders, applied AI by industry, and people in safety, policy, investing and media. Numbering follows section order. It is not a ranking, and the section counts describe this editorial selection rather than the demographics or importance of the industry.",
];
article.patterns = [
  {
    title: "Research careers can become financing stories.",
    text: "Periodic Labs links two research careers to a documented $300 million founding round in September 2025. Reflection names a later, closed round at a $25 billion pre-money valuation in its April 2026 newsroom. Those records establish company events; they do not disclose the founders' private stakes or personal wealth.",
  },
  {
    title: "An open project and a company are different assets.",
    text: "vLLM, SGLang and llama.cpp make the distinction visible. A repository can remain open while its maintainers build a paid business or join another organization. I follow what happens to access, licensing and governance alongside the financing, rather than treating a star count as revenue.",
  },
  {
    title: "Growth figures need their denominators.",
    text: "Fireworks reports annualized revenue run rate, Modal reports a run rate and growth since September, and Mercor's gross contractor billings need separating from revenue it retains. I compare a figure only after identifying its date, definition and source; these are not interchangeable measures of commercial success.",
  },
  {
    title: "A technical record survives a changing job title.",
    text: "Papers, code releases and institutional biographies let me follow researchers across labs without assigning every later employer claim the same confidence. Tri Dao's updated Princeton title differs from his older CV; Jason Wei's homepage names a later affiliation than his CV. The dates and provenance matter.",
  },
  {
    title: "Physical results are a different test from software benchmarks.",
    text: "Robotics, materials and drug-discovery entries need evidence beyond a model leaderboard. A robot must work in unfamiliar surroundings, a proposed material must be made and tested, and a designed molecule must survive development. Financing pays for those attempts; it does not prove their outcomes.",
  },
];
article.faq = article.faq.map((item) =>
  item.question.startsWith("Why aren't")
    ? {
        ...item,
        answer:
          "This is an editorial selection of contributors and builders with specific work to follow. Better-known subjects also have separate profiles in the [Leaders index](https://visionarytalks.com/leaders/). A watchlist entry is not a substitute for a full financial biography.",
      }
    : item,
);
article.methodology = article.methodology.filter(
  (item) => item.label !== "Record distinctions",
);
article.methodology.splice(3, 0, {
  label: "Record distinctions",
  text: "The ggml team joining Hugging Face does not disclose acquisition terms. Gamma's funding includes a secondary component, so funding-to-ARR is not a clean operating-efficiency ratio. Wix's Base44 consideration is not the founder's net worth. Reflection announcing Beam does not establish that promised weights have shipped.",
});
article.editorialReview.limitations = [
  "The expanded biographies are awaiting claim-level editorial review. Specific verified corrections are documented separately; the original concise claim checks do not certify these expanded entries.",
  "No publication or Production synchronization is authorized. Unknown degrees, role dates, fundraising outcomes and private stakes must not be inferred from blocked or secondary pages.",
];
fs.writeFileSync(destination, JSON.stringify(article, null, 2) + "\n");
fs.writeFileSync(
  path.join(folder, "fact-changes.json"),
  JSON.stringify(ledger, null, 2) + "\n",
);
const audit = {
  checked: "2026-10-14",
  status: "awaiting-expanded-claim-review",
  release: "Preview only",
  retrievalIsVerification: false,
  correctionCount: ledger.length,
  people: article.people.map((person) => ({
    number: person.number,
    name: person.name,
    stableId: person.id,
    verification: "pending-expanded-claims",
    specificCorrections: ledger
      .filter((row) => row.number === person.number)
      .map((row) => row.field),
    words: Object.keys(fields)
      .map((key) => person.profile[key])
      .join(" ")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .split(/\s+/).length,
    contentHash: crypto
      .createHash("sha256")
      .update(JSON.stringify(person.profile))
      .digest("hex"),
    sources: person.profile.sources,
    limitation:
      "Restored biography and current financial leads require sentence-level evidence before publication; a successful fetch or an existing concise claim check cannot approve them.",
  })),
};
fs.writeFileSync(
  path.join(folder, "expanded-review.json"),
  JSON.stringify(audit, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    entries: article.people.length,
    specificCorrections: ledger.length,
    completedExpandedReviews: 0,
    previewOnly: true,
  }),
);
