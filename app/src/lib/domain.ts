import { z } from "zod";

export const sourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.url(),
  publisher: z.string(),
  publishedAt: z.string().optional(),
  evidence: z.string().optional(),
});
export type Source = z.infer<typeof sourceSchema>;
export const metricSchema = z.object({
  label: z.string(),
  value: z.number().finite().nullable(),
  currency: z.string().optional(),
  unit: z.string(),
  period: z.string().min(1),
  definition: z.string().min(1),
  basis: z.enum(["reported", "estimated", "calculated"]),
  geography: z.string().optional(),
  sourceIds: z.array(z.string()).min(1),
});
export type Metric = z.infer<typeof metricSchema>;
export type Section = {
  id: string;
  heading: string;
  text: string;
  sourceIds?: string[];
};
export type Story = {
  id: string;
  path: string;
  title: string;
  dek: string;
  kind: "article" | "ownership" | "leader" | "salary" | "company" | "page";
  category: string;
  author: { name: string; path?: string; bio?: string };
  publishedAt?: string;
  modifiedAt?: string;
  image?: string;
  imageAlt?: string;
  imageCredit?: string;
  fixture?: boolean;
  sections: Section[];
  shortAnswer?: string;
  facts?: { label: string; value: string }[];
  sources: Source[];
  metrics?: Metric[];
  timeline?: { date: string; text: string; sourceIds?: string[] }[];
  relations?: {
    from: string;
    to: string;
    label: string;
    stake?: number | null;
  }[];
  faqs?: { question: string; answer: string }[];
  related?: string[];
  legacyHTML?: string;
  noindex?: boolean;
  richBody?: any;
  taxonomy?:{name:string;path:string;kind:string}[];
};
export type CompanyRow = {
  id: string;
  name: string;
  vertical: string;
  description: string;
  profilePath?: string;
  observations: {
    value: number | null;
    display: string;
    metric: string;
    period: string;
    basis: string;
    note: string;
    source: Source;
  }[];
};
export function publicPath(value: string): string {
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\?#\x00-\x20]/.test(value)
  )
    throw new Error("Use an absolute local path without query or fragment");
  const decoded = decodeURIComponent(value);
  if (
    decoded.split("/").some((p) => p === "." || p === "..") ||
    decoded.includes("\\")
  )
    throw new Error("Unsafe path");
  return value;
}
export function canPublish(role: unknown) {
  return role === "admin" || role === "editor";
}
export function filterCompanies(
  rows: CompanyRow[],
  query = "",
  vertical = "",
  metric = "",
  sort = "name",
) {
  return rows
    .filter(
      (r) =>
        (!query ||
          `${r.name} ${r.description} ${r.vertical}`
            .toLowerCase()
            .includes(query.toLowerCase())) &&
        (!vertical || r.vertical === vertical) &&
        (!metric || r.observations[0]?.metric === metric),
    )
    .sort((a, b) => {
      if (sort === "value") {
        const av = a.observations[0]?.value,
          bv = b.observations[0]?.value;
        return av == null ? (bv == null ? 0 : 1) : bv == null ? -1 : bv - av;
      }
      if (sort === "date")
        return (b.observations[0]?.period ?? "").localeCompare(
          a.observations[0]?.period ?? "",
        );
      return a.name.localeCompare(b.name);
    });
}
export function chartScale(metrics: Metric[]) {
  const scopes = new Set(
    metrics.map((m) =>
      [m.unit, m.currency, m.definition, m.geography].join("|"),
    ),
  );
  if (scopes.size > 1)
    throw new Error("Incompatible metric scopes cannot share a chart");
  return Math.max(1, ...metrics.map((m) => m.value ?? 0));
}
