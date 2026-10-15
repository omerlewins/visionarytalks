import type { Story, CompanyRow } from "./domain";
import type { OwnershipFile } from "./ownership-contract";

export const watchlistPath = "/ai-people-to-watch/";
export const watchlistDek =
  "Education, career path, dated funding figures and sources for every person.";
export const editorialText = (value: string) =>
  value.replace(/\s*[\u2013\u2014]\s*/g, ": ");
export function storyUpdated(story: {
  modifiedAt?: string | null;
  publishedAt?: string | null;
}) {
  return [story.modifiedAt, story.publishedAt].find((value): value is string =>
    Boolean(value && Number.isFinite(Date.parse(value))),
  );
}
export function updatedStories(stories: Story[]) {
  return stories
    .filter(
      (s) =>
        s.kind !== "page" &&
        !s.noindex &&
        !s.excludeFromHomepage &&
        storyUpdated(s),
    )
    .sort(
      (a, b) =>
        Date.parse(storyUpdated(b)!) - Date.parse(storyUpdated(a)!) ||
        Date.parse(b.publishedAt || "1970-01-01") -
          Date.parse(a.publishedAt || "1970-01-01") ||
        a.path.localeCompare(b.path),
    );
}
export type StoryReference = string | number | { id: string | number } | null;
export function homepageEdition(
  stories: Story[],
  heroChoice?: StoryReference,
  leadChoice?: StoryReference,
) {
  const ordered = updatedStories(stories);
  const resolve = (ref?: StoryReference) =>
    ref == null
      ? undefined
      : ordered.find(
          (s) => s.id === String(typeof ref === "object" ? ref.id : ref),
        );
  const hero =
    resolve(heroChoice) ??
    ordered.find((s) => s.path === watchlistPath) ??
    ordered[0];
  const manualLead = resolve(leadChoice);
  const editorPick = Boolean(manualLead && manualLead.path !== hero?.path);
  const lead = editorPick
    ? manualLead
    : ordered.find((s) => s.path !== hero?.path);
  return {
    hero,
    lead,
    editorPick,
    latest: ordered
      .filter((s) => s.path !== hero?.path && s.path !== lead?.path)
      .slice(0, 6),
    updated: ordered[0] && storyUpdated(ordered[0]),
  };
}
export function updatedLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(new Date(date));
}
export function editionLabel(date: string) {
  const value = new Date(date);
  const day = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(value);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  }).format(value);
  return `${day} · Updated ${time} ET`;
}
export function relativeUpdated(date: string, now = new Date()) {
  const elapsed = Math.max(0, now.getTime() - Date.parse(date));
  const etDay = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  if (
    etDay(new Date(date)) !== etDay(now) &&
    elapsed < 48 * 3600000 &&
    etDay(new Date(date)) === etDay(new Date(now.getTime() - 86400000))
  )
    return "Yesterday";
  if (elapsed < 3600000)
    return elapsed < 60000
      ? "Just updated"
      : `${Math.floor(elapsed / 60000)}m ago`;
  if (elapsed < 24 * 3600000) return `${Math.floor(elapsed / 3600000)}h ago`;
  if (elapsed < 7 * 86400000) return `${Math.floor(elapsed / 86400000)}d ago`;
  return updatedLabel(date);
}
export type Figure = {
  name: string;
  figure: string;
  date: string;
  measure: string;
  path: string;
};
const monthLabel = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(
    new Date(date.length === 7 ? date + "-15T12:00:00Z" : date + "T12:00:00Z"),
  );
export const figureDate = monthLabel;
export function homepageFigures(
  rows: CompanyRow[],
  files: { path: string; content: OwnershipFile }[],
  published: Story[],
): Figure[] {
  const available = new Set(
    published
      .filter((s) => s.kind === "ownership" && !s.excludeFromHomepage)
      .map((s) => s.path),
  );
  const result: Figure[] = [];
  for (const c of rows) {
    const path =
      c.profilePath ||
      files.find(
        (f) => f.content.company.toLowerCase() === c.name.toLowerCase(),
      )?.path;
    const observation = c.observations.find(
      (o) =>
        o.value !== null &&
        /financing valuation/i.test(o.metric) &&
        /^\d{4}-\d{2}-\d{2}$/.test(o.period),
    );
    if (path && available.has(path) && observation)
      result.push({
        name: c.name,
        figure: observation.display,
        date: observation.period,
        measure: "financing valuation",
        path,
      });
  }
  for (const file of files) {
    if (!available.has(file.path) || result.some((r) => r.path === file.path))
      continue;
    // Only exact priced rounds. Tenders, loans, consideration and pending
    // transactions remain distinct and cannot silently become valuations.
    const round = file.content.rounds
      .filter(
        (r) =>
          r.priced && r.value !== null && /^\d{4}-\d{2}(-\d{2})?$/.test(r.date),
      )
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    if (round)
      result.push({
        name: file.content.company,
        figure: `${round.currency === "EUR" ? "€" : "$"}${round.value}B`,
        date: round.date,
        measure: "financing valuation",
        path: file.path,
      });
  }
  return result.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
}
export type OwnershipUpdate = {
  eventDate: string;
  headline: string;
  status: "Pending deal" | "New round" | "IPO filing" | "Reported talks";
  story: string | number | { id: string | number };
};
export function ownershipUpdates(
  items: OwnershipUpdate[] | null | undefined,
  published: Story[],
) {
  return (items || [])
    .flatMap((item) => {
      const id = typeof item.story === "object" ? item.story?.id : item.story;
      const story = published.find(
        (s) =>
          s.id === String(id) &&
          s.kind === "ownership" &&
          !s.excludeFromHomepage,
      );
      return story && Number.isFinite(Date.parse(item.eventDate))
        ? [{ ...item, path: story.path }]
        : [];
    })
    .slice(0, 3);
}
