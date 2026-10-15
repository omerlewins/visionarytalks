import type { OwnershipFile, OwnershipSource } from "./ownership-contract";

// Portable, readable CMS mirror. The versioned research record remains canonical.
export function ownershipHTML(
  file: OwnershipFile,
  sources: Record<string, OwnershipSource>,
) {
  const escape = (s: string) =>
    s.replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c]!,
    );
  const inline = (s: string) =>
    s
      .split(/(\[[^\]]+\]\([^)]+\))/g)
      .map((part) => {
        const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (!match) return escape(part);
        const href = match[2].startsWith("source:")
          ? sources[match[2].slice(7)]?.url
          : match[2];
        return href && /^(https:\/\/|\/(?!\/))/.test(href)
          ? `<a href="${escape(href)}">${escape(match[1])}</a>`
          : escape(match[1]);
      })
      .join("");
  const paragraphs = (values: string[]) =>
    values.map((s) => `<p>${inline(s)}</p>`).join("");
  const section = (heading: string, values: string[]) =>
    `<h2>${escape(heading)}</h2>${paragraphs(values)}`;
  const table = (headers: string[], rows: string[][]) =>
    `<table><thead><tr>${headers.map((s) => `<th scope="col">${escape(s)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((s, i) => (i === 0 ? `<th scope="row">${inline(s)}</th>` : `<td>${inline(s)}</td>`)).join("")}</tr>`).join("")}</tbody></table>`;
  return (
    section("Key takeaways", file.takeaways) +
    section("What changed in 2026", file.changed) +
    section(`Who owns ${file.company}?`, file.ownership) +
    table(
      ["Holder", "Type", "Stake", "Voting rights", "Source / date"],
      file.holders.map((h) => [
        h.holder,
        h.type,
        h.stake,
        h.votes,
        `[${sources[h.sourceId].publisher}](source:${h.sourceId}) ${h.date}`,
      ]),
    ) +
    file.extras.map((e) => section(e.heading, e.paragraphs)).join("") +
    section("How the founders built it", file.founderStory) +
    section("Funding and valuation history", file.funding) +
    table(
      ["Date / event", "Amount", "Valuation", "Lead", "Evidence"],
      file.rounds.map((r) => [
        `${r.date} ${r.event}`,
        r.amount,
        r.valuation,
        r.lead,
        `[${sources[r.sourceId].publisher}](source:${r.sourceId}) (${r.basis})`,
      ]),
    ) +
    paragraphs([file.chartRead]) +
    "<h2>Ownership timeline</h2>" +
    table(
      ["Date", "Event", "Ownership after event", "Money / basis", "Source"],
      file.timeline.map((t) => [
        t.date,
        t.event,
        t.ownerAfter,
        t.money,
        `[${sources[t.sourceId].publisher}](source:${t.sourceId})`,
      ]),
    ) +
    section(file.finding.heading, file.finding.paragraphs) +
    "<h2>Who runs it?</h2>" +
    table(
      ["Person", "Role", "As of / condition", "Source"],
      file.leadership.map((l) => [
        l.person,
        l.role,
        l.since,
        `[${sources[l.sourceId].publisher}](source:${l.sourceId})`,
      ]),
    ) +
    section("Stock and IPO questions", file.stock) +
    "<h2>Frequently asked questions</h2>" +
    file.faq
      .map((f) => `<h3>${escape(f.question)}</h3>${paragraphs([f.answer])}`)
      .join("") +
    section("What I am watching next", file.watching) +
    section("Our independent research methodology", [
      file.methodology,
      `Research checked ${file.checked}.`,
    ])
  );
}
