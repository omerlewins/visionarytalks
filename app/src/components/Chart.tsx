import { chartScale, type Metric } from "@/lib/domain";
import { EditorialChart } from "./EditorialChart";
export function Chart({ metrics }: { metrics: Metric[] }) {
  if (!metrics.length) return null;
  try {
    chartScale(metrics);
  } catch {
    return (
      <p className="notice">
        These observations have different definitions. Review them individually;
        a combined chart would be misleading.
      </p>
    );
  }
  return (
    <EditorialChart
      title={metrics[0].definition}
      subtitle={`${metrics[0].currency ?? ""} ${metrics[0].unit} · ${metrics[0].basis}`}
      series={[
        {
          name: metrics[0].definition,
          points: metrics.map((m) => ({
            label: m.period,
            value: m.value,
            display:
              m.value == null
                ? "Unknown"
                : `${m.value.toLocaleString("en-US")}${m.unit === "%" ? "%" : ""}`,
          })),
        },
      ]}
      source={
        <>
          Sources:{" "}
          {[...new Set(metrics.flatMap((m) => m.sourceIds))].map((id) => (
            <a key={id} href={`#source-${id}`}>
              [{id}]{" "}
            </a>
          ))}
        </>
      }
    >
      <details>
        <summary>View accessible data table</summary>
        <div
          className="table-scroll article-table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Chart data table"
        >
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>Value</th>
                <th>Definition</th>
                <th>Sources</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, i) => (
                <tr key={i}>
                  <th>{m.period}</th>
                  <td>
                    {m.value ?? "Unknown"} {m.currency} {m.unit}
                  </td>
                  <td>{m.definition}</td>
                  <td>
                    {m.sourceIds.map((id) => (
                      <a key={id} href={`#source-${id}`}>
                        [{id}]{" "}
                      </a>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </EditorialChart>
  );
}
