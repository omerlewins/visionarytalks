import Link from "next/link";
import type { CompanyRow } from "@/lib/domain";
import { editorialText } from "@/lib/home-editorial";

// This preview has native details and links, without filter controls. Keep it
// on the server so the homepage does not hydrate the full tracker and Zod.
export function TrackerPreview({ rows }: { rows: CompanyRow[] }) {
  const selection = [...rows]
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 4);
  return (
    <div className="tracker">
      <p className="source">
        {rows.length} {rows.length === 1 ? "company" : "companies"} · Dated,
        company-reported observations, not live prices or necessarily the latest
        valuations. Mixed metrics are not directly comparable.
      </p>
      <p className="tracker-scroll-hint">
        Scroll across for figures and source links →
      </p>
      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Company observations"
      >
        <table>
          <caption>A selection from the tracker</caption>
          <thead>
            <tr>
              <th>Company</th>
              <th>Primary vertical</th>
              <th>Observation</th>
              <th>Period &amp; source</th>
            </tr>
          </thead>
          <tbody>
            {selection.map((row) => {
              const observation = row.observations[0];
              return (
                <tr key={row.id}>
                  <th scope="row">
                    <details>
                      <summary>{row.name}</summary>
                      <p>{editorialText(row.description)}</p>
                      {row.observations.map((o, i) => (
                        <p key={i}>
                          <strong>
                            {o.display} · {o.period}
                          </strong>
                          <br />
                          {editorialText(o.note)}
                        </p>
                      ))}
                      {row.profilePath && (
                        <Link href={row.profilePath}>
                          Ownership investigation ↗
                        </Link>
                      )}
                    </details>
                  </th>
                  <td>{row.vertical}</td>
                  <td>
                    <strong>{observation?.display ?? "Unknown"}</strong>
                    <small>{observation?.metric ?? "No observation"}</small>
                  </td>
                  <td>
                    {observation?.period ?? "Unknown date"}
                    <small>
                      {observation?.source.url && (
                        <a
                          href={observation.source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {observation.source.publisher} ↗
                        </a>
                      )}
                    </small>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
