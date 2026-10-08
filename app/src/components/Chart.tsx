import { chartScale, type Metric } from "@/lib/domain";
export function Chart({ metrics }: { metrics: Metric[] }) {
  if (!metrics.length) return null;
  let max: number;
  try {
    max = chartScale(metrics);
  } catch {
    return (
      <p className="notice">
        These observations have different definitions. Review them individually;
        a combined chart would be misleading.
      </p>
    );
  }
  return (
    <figure className="data-chart">
      <figcaption>
        {metrics[0].definition} · {metrics[0].currency} {metrics[0].unit}
      </figcaption>
      <div className="chart-bars" aria-hidden="true">
        {metrics.map((m, i) => (
          <div key={i}>
            <span>{m.value ?? "Unknown"}</span>
            <i
              style={{
                height: `${m.value == null ? 0 : Math.max(0, m.value / max) * 100}%`,
              }}
            />
            <b>{m.period}</b>
          </div>
        ))}
      </div>
      <p className="source">
        Zero baseline · {metrics[0].basis}. Missing observations are not
        interpolated.
      </p>
      <details>
        <summary>View accessible data table</summary>
        <div className="table-scroll">
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
    </figure>
  );
}
