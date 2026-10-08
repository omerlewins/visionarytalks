import type { ReactNode } from "react";
export type ChartSeries = {
  name: string;
  points: { label: string; value: number | null; display: string }[];
};
export function EditorialChart({
  title,
  subtitle,
  series,
  source,
  children,
}: {
  title: string;
  subtitle: string;
  series: ChartSeries[];
  source: ReactNode;
  children?: ReactNode;
}) {
  const values = series.flatMap((s) => s.points.map((p) => p.value));
  const valid = values.every(
    (v) => v == null || (Number.isFinite(v) && v >= 0),
  );
  const max = Math.max(1, ...values.filter((v): v is number => v != null));
  const labels = series[0]?.points.map((p) => p.label) ?? [];
  const aligned = series.every(
    (s) =>
      s.points.length === labels.length &&
      s.points.every((p, i) => p.label === labels[i]),
  );
  return (
    <figure className="data-chart editorial-chart">
      <figcaption>
        <span className="eyebrow">BUSINESS IN NUMBERS</span>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </figcaption>
      {valid && aligned ? (
        <>
          {series.length > 1 && (
            <ul className="chart-legend">
              {series.map((s, i) => (
                <li key={s.name}>
                  <i className={i === series.length - 1 ? "ink" : ""} />
                  {s.name}
                </li>
              ))}
            </ul>
          )}
          <div
            className="chart-scroll"
            tabIndex={0}
            role="region"
            aria-label={`${title}, chart. Scroll horizontally for all labels.`}
          >
            <div
              className="editorial-plot"
              style={{ minWidth: Math.max(400, labels.length * 110) }}
              aria-hidden="true"
            >
              <span className="zero-label">0</span>
              {labels.map((label, i) => (
                <div className="plot-group" key={`${label}-${i}`}>
                  <div className="plot-columns">
                    {series.map((s, j) => {
                      const point = s.points[i];
                      return (
                        <div className="plot-column" key={s.name}>
                          <div
                            className={`plot-bar ${series.length > 1 ? (j === series.length - 1 ? "ink" : "") : i === labels.length - 1 ? "ink" : ""}`}
                            style={{
                              height: `${point.value == null ? 0 : (point.value / max) * 100}%`,
                            }}
                          >
                            <span>{point.display}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <b className="plot-label">{label}</b>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="notice">
          These observations require a different scale. Read the data table
          below.
        </p>
      )}
      <p className="chart-scroll-hint">
        Scroll horizontally to see every column. Keyboard: focus the chart and
        use the arrow keys.
      </p>
      <div className="chart-source">{source}</div>
      <p className="chart-method">
        Zero baseline. Missing values are not interpolated.
      </p>
      {children}
    </figure>
  );
}
