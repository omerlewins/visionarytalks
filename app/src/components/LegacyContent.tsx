import sanitize from "sanitize-html";
import { editorialTables, ownershipOpening } from "@/migration/render";
import { extractLegacyChart } from "@/migration/charts";
import { EditorialChart } from "./EditorialChart";
export function LegacyContent({
  html,
  ownership,
}: {
  html: string;
  ownership: boolean;
}) {
  const clean = sanitize(html, {
    allowedTags: sanitize.defaults.allowedTags.concat([
      "img",
      "figure",
      "figcaption",
    ]),
    allowedAttributes: {
      ...sanitize.defaults.allowedAttributes,
      "*": ["id"],
      img: ["src", "srcset", "alt", "width", "height", "loading"],
    },
  });
  const chart = extractLegacyChart(clean);
  const opening = (value: string) =>
    editorialTables(ownership ? ownershipOpening(value) : value);
  return (
    <div className="legacy-content">
      {chart ? (
        <>
          <div dangerouslySetInnerHTML={{ __html: opening(chart.before) }} />
          <EditorialChart
            title="Median and average net worth by age"
            subtitle="US households · USD · 2022 dollars"
            series={chart.series}
            source={chart.caption}
          >
            <p className="chart-method">
              Exact values are retained in the source table immediately above.
              The two series use the same dollar scale.
            </p>
          </EditorialChart>
          <div
            dangerouslySetInnerHTML={{ __html: editorialTables(chart.after) }}
          />
        </>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: opening(clean) }} />
      )}
    </div>
  );
}
