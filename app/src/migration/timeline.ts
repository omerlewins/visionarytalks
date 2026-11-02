// Article markdown opts a table into the visual timeline by placing
// <div id="vt-timeline"></div> directly before it. The first column is the
// date, the second the event; columns headed "Source" or "Price"/"Value"/"Deal"
// become the source line and the value chip. Call after sanitizing.
const timelineTable =
  /<div id="vt-timeline"><\/div>\s*<table\b[^>]*>([\s\S]*?)<\/table\s*>/gi;

const cells = (row: string) =>
  [...row.matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]\s*>/gi)].map((m) =>
    m[1].trim(),
  );
const plain = (html: string) => html.replace(/<[^>]+>/g, "").trim();

export function ownershipTimelines(html: string) {
  return html.replace(timelineTable, (_match, body: string) => {
    const rows = [...body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr\s*>/gi)].map(
      (m) => cells(m[1]),
    );
    const [head, ...items] = rows;
    if (!head || !items.length) return _match;
    const labels = head.map((label) => plain(label).toLowerCase());
    const source = labels.findIndex((label) => label.includes("source"));
    const value = labels.findIndex((label) =>
      /price|value|deal|paid/.test(label),
    );
    const list = items
      .map((row, i) => {
        const chip =
          value > 1 && row[value] && plain(row[value]) !== "-"
            ? `<span class="vt-timeline-value">${row[value]}</span>`
            : "";
        const cite =
          source > 1 && row[source]
            ? `<span class="vt-timeline-source">Source: ${row[source]}</span>`
            : "";
        const meta =
          chip || cite ? `<p class="vt-timeline-meta">${chip}${cite}</p>` : "";
        const latest = i === items.length - 1 ? " is-latest" : "";
        return `<li class="vt-timeline-item${latest}"><span class="vt-timeline-date">${row[0] ?? ""}</span><div class="vt-timeline-body"><p>${row[1] ?? ""}</p>${meta}</div></li>`;
      })
      .join("");
    return `<ol class="vt-timeline">${list}</ol>`;
  });
}
