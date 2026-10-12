import data from "../data/us-state-wealth.json";

// Apply the checked source correction to the legacy article and its generated charts.
// Keep the original CMS body available for audit; never apply this to other articles.
export function correctedStateWealthHTML(path: string, html: string) {
  if (path !== "/how-many-billionaires-by-state/") return html;
  let result = html.replace(
    /(<td>Mississippi<\/td><td>MS<\/td>)<td>8<\/td><td>2\.71<\/td>/g,
    "$1<td>2</td><td>0.68</td>",
  );
  result = result.replace(
    /<tr><td>10<\/td><td>Mississippi<\/td><td>8<\/td><td>2\.71<\/td><\/tr>/g,
    "<tr><td>10</td><td>Colorado</td><td>13</td><td>2.16</td></tr>",
  );
  result = result.replace(
    /<p>Mississippi is the unusual case\.[\s\S]*?<\/p>/,
    "<p>Mississippi has two resident billionaires in the July 24, 2025 source, not eight. Its approximate density is 0.68 per million residents using the article’s population denominator. The source count has been corrected here and in the map.</p>",
  );
  // Reorder and renumber the first table after correcting Mississippi’s count.
  result = result.replace(
    /<tbody>([\s\S]*?)<\/tbody>/,
    (full, body: string) => {
      const rows = [...body.matchAll(/<tr>([\s\S]*?)<\/tr>/g)];
      if (rows.length !== 51 || !body.includes("<td>MS</td>")) return full;
      rows.sort((a, b) => {
        const cells = (row: string) =>
          [...row.matchAll(/<td>(.*?)<\/td>/g)].map((x) => x[1]);
        const ac = cells(a[1]),
          bc = cells(b[1]);
        return Number(bc[3]) - Number(ac[3]) || ac[1].localeCompare(bc[1]);
      });
      return (
        "<tbody>" +
        rows
          .map(
            (r, i) =>
              "<tr>" +
              r[1].replace(/^<td>\d+<\/td>/, "<td>" + (i + 1) + "</td>") +
              "</tr>",
          )
          .join("") +
        "</tbody>"
      );
    },
  );
  return result;
}
export const stateWealthData = data;
