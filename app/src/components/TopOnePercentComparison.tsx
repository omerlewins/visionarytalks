import data from "@/data/us-state-wealth.json";
import { EditorialChart } from "./EditorialChart";

export function TopOnePercentComparison() {
  const states = data.states
    .filter((s) => s.code !== "DC")
    .sort((a, b) => b.topOnePercent - a.topOnePercent);
  const highest = states[0];
  const lowest = states.at(-1)!;
  const selected = [...states.slice(0, 3), ...states.slice(-3)];
  return (
    <section id="state-threshold-gap" aria-labelledby="threshold-gap-title">
      <h2 id="threshold-gap-title">
        The same percentile. A different price of entry.
      </h2>
      <p>
        I compared all 50 state thresholds in{" "}
        <a href={data.topOnePercent.source}>
          Windfall’s April 2026 household estimates
        </a>
        . {highest.name}’s threshold is{" "}
        {(highest.topOnePercent / lowest.topOnePercent).toFixed(1)} times{" "}
        {lowest.name}’s. This compares the same measure and snapshot; it is not
        a cost-of-living adjustment.
      </p>
      <EditorialChart
        title="Three highest and three lowest state thresholds"
        subtitle="Top 1% household net worth · USD · April 2026 estimates"
        series={[
          {
            name: "Estimated threshold",
            points: selected.map((s) => ({
              label: s.name,
              value: s.topOnePercent,
              display: `$${(s.topOnePercent / 1000000).toFixed(2)}M`,
            })),
          },
        ]}
        source={
          <p>
            Calculated from{" "}
            <a href={data.topOnePercent.source}>
              Windfall Data, Inc.’s published state thresholds
            </a>
            . Values plotted in dollars; labels rounded to $0.01 million. The
            full precision supplied by the source appears in the map’s table.
          </p>
        }
      >
        <p className="chart-method">
          Selected from 50 states; DC is included in the map but excluded from
          this state comparison. Estimated net worth includes home equity and
          subtracts liabilities. Source precision is not a guarantee of
          accuracy.
        </p>
      </EditorialChart>
    </section>
  );
}
