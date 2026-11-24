import sanitize from "sanitize-html";
import { editorialTables, ownershipOpening } from "@/migration/render";
import { extractLegacyChart, extractTableChart } from "@/migration/charts";
import { EditorialChart } from "./EditorialChart";
import {
  YoungestBillionairesEmbed,
  youngestBillionairesMarker,
} from "./YoungestBillionairesEmbed";
import { MoneyWorldMap } from "./MoneyWorldMap";
import { MiddleEastPrMap } from "./MiddleEastPrMap";
import { AtcPayEmbed, atcPayMarker } from "./AtcPayEmbed";
import { publicationText } from "@/lib/editorial-punctuation";
import { ownershipTimelines } from "@/migration/timeline";

// Article HTML places the money map with <div id="vt-money-map"></div>.
const moneyMapMarker = '<div id="vt-money-map"></div>';
function WithMoneyMap({ html }: { html: string }) {
  const [before, after] = html.split(moneyMapMarker);
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: before }} />
      {after !== undefined && (
        <>
          <MoneyWorldMap />
          <div dangerouslySetInnerHTML={{ __html: after }} />
        </>
      )}
    </>
  );
}
// /pr-agencies-in-dubai/ places its agency map with <div id="vt-pr-map"></div>.
const prMapMarker = '<div id="vt-pr-map"></div>';
export function LegacyContent({
  html,
  ownership,
}: {
  html: string;
  ownership: boolean;
}) {
  const sanitized = sanitize(html, {
    textFilter: publicationText,
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
  const clean = ownershipTimelines(sanitized);
  const chart = extractLegacyChart(clean);
  const opening = (value: string) =>
    editorialTables(ownership ? ownershipOpening(value) : value);
  const tableChart = extractTableChart(clean);
  if (tableChart)
    return (
      <div className="legacy-content">
        <div dangerouslySetInnerHTML={{ __html: opening(tableChart.before) }} />
        <EditorialChart
          title={tableChart.config.title}
          subtitle={tableChart.config.subtitle}
          series={tableChart.series}
          scale={tableChart.config.scale}
          source="Source: the dated figures and sources in the table above."
        />
        <WithMoneyMap html={editorialTables(tableChart.after)} />
      </div>
    );
  if (atcPayMarker.test(clean)) {
    const parts = clean.split(new RegExp(atcPayMarker, "g"));
    return (
      <div className="legacy-content">
        {parts.map((part, i) =>
          i % 2 ? (
            <AtcPayEmbed key={i} kind={part} />
          ) : (
            <div
              key={i}
              dangerouslySetInnerHTML={{ __html: editorialTables(part) }}
            />
          ),
        )}
      </div>
    );
  }
  if (youngestBillionairesMarker.test(clean)) {
    // split() with one capture group alternates HTML and marker kinds.
    const parts = clean.split(new RegExp(youngestBillionairesMarker, "g"));
    return (
      <div className="legacy-content">
        {parts.map((part, i) =>
          i % 2 ? (
            <YoungestBillionairesEmbed key={i} kind={part} />
          ) : (
            <div
              key={i}
              dangerouslySetInnerHTML={{ __html: editorialTables(part) }}
            />
          ),
        )}
      </div>
    );
  }
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
        <WithPrMap html={clean} opening={opening} />
      )}
    </div>
  );
}

function WithPrMap({
  html,
  opening,
}: {
  html: string;
  opening: (value: string) => string;
}) {
  const [before, after] = html.split(prMapMarker);
  if (after === undefined)
    return <div dangerouslySetInnerHTML={{ __html: opening(html) }} />;
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: opening(before) }} />
      <MiddleEastPrMap />
      <div dangerouslySetInnerHTML={{ __html: editorialTables(after) }} />
    </>
  );
}
