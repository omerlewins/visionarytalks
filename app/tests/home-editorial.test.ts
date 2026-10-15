import { test } from "node:test";
import assert from "node:assert/strict";
import {
  homepageEdition,
  homepageFigures,
  ownershipUpdates,
  relativeUpdated,
  editionLabel,
  storyUpdated,
} from "../src/lib/home-editorial";
import type { Story, CompanyRow } from "../src/lib/domain";
import ownership from "../src/data/ownership-investigations.json";
import { publicationSocials } from "../src/lib/publication-socials";
import type { OwnershipFile } from "../src/lib/ownership-contract";
const article = (path: string, date: string, kind: Story["kind"] = "article") =>
  ({
    id: path,
    path,
    modifiedAt: date,
    publishedAt: "2026-01-01",
    kind,
  }) as Story;
test("edition sorts editorial updates and keeps the watchlist out of the lead", () => {
  const stories = [
    article("/older/", "2026-10-01"),
    article("/lead/", "2026-10-14"),
    article("/ai-people-to-watch/", "2026-10-15"),
    ...Array.from({ length: 6 }, (_, i) =>
      article(`/next-${i}/`, `2026-10-0${i + 2}`),
    ),
  ];
  const edition = homepageEdition(stories);
  assert.equal(edition.lead?.path, "/lead/");
  assert.equal(edition.latest.length, 6);
  assert.equal(edition.hero?.path, "/ai-people-to-watch/");
  assert.ok(
    !edition.latest.some(
      (s) => s.path === edition.hero?.path || s.path === edition.lead?.path,
    ),
  );
  assert.equal(edition.updated, "2026-10-15");
  assert.equal(
    storyUpdated({ modifiedAt: "invalid", publishedAt: "2026-10-01" }),
    "2026-10-01",
  );
  assert.equal(
    homepageEdition([article("/draft/", "2026-10-15", "page")]).lead,
    undefined,
  );
});
test("CMS hero and manual lead only resolve to published indexable stories", () => {
  const stories = [
    article("/hero/", "2026-10-10"),
    article("/latest/", "2026-10-15"),
    article("/pick/", "2026-09-01"),
    article("/ai-people-to-watch/", "2026-10-14"),
  ];
  const edition = homepageEdition(stories, { id: "/hero/" }, "/pick/");
  assert.equal(edition.hero?.path, "/hero/");
  assert.equal(edition.lead?.path, "/pick/");
  assert.equal(edition.editorPick, true);
  assert.equal(edition.latest[0].path, "/latest/");
  assert.equal(
    homepageEdition(stories, "missing", "missing").hero?.path,
    "/ai-people-to-watch/",
  );
  assert.equal(homepageEdition(stories, "/hero/", "/hero/").editorPick, false);
});
test("dates use Eastern time and distinguish yesterday from elapsed hours", () => {
  assert.equal(
    editionLabel("2026-01-02T02:10:00Z"),
    "Thursday, January 1, 2026 · Updated 9:10 PM ET",
  );
  assert.equal(
    editionLabel("2026-07-02T02:10:00Z"),
    "Wednesday, July 1, 2026 · Updated 10:10 PM ET",
  );
  assert.equal(
    relativeUpdated("2026-10-15T10:00:00Z", new Date("2026-10-15T12:00:00Z")),
    "2h ago",
  );
  assert.equal(
    relativeUpdated("2026-10-14T21:00:00Z", new Date("2026-10-15T12:00:00Z")),
    "Yesterday",
  );
});
test("figures only link published ownership records and preserve exact priced financing measures", () => {
  const files = ownership.files.map((p) => ({
    path: `/who-owns-${p.slug}/`,
    content: p as OwnershipFile,
  }));
  const published = files.map((f) =>
    article(f.path, "2026-10-12", "ownership"),
  );
  const result = homepageFigures([], files, published);
  assert.ok(result.length >= 8 && result.length <= 10);
  assert.ok(result.every((r) => r.measure === "financing valuation"));
  assert.ok(result.find((r) => r.name === "Groq")?.figure === "$6.9B");
  assert.ok(
    !result.some((r) => r.figure.includes("14.5") || r.figure.includes("270")),
  );
  assert.deepEqual(homepageFigures([], files, []), []);
  const fake = [
    {
      id: "x",
      name: "Test",
      profilePath: "/unpublished/",
      observations: [
        {
          value: 12,
          period: "2026-10-01",
          metric: "Employee tender",
          display: "$12B",
        },
      ],
    },
  ] as CompanyRow[];
  assert.deepEqual(homepageFigures(fake, [], published), []);
});
test("editorial ownership updates cannot surface unpublished or unrelated stories", () => {
  const story = article("/one/", "2026-10-12", "ownership");
  const item = {
    eventDate: "2026-10-01",
    headline: "Deal pending",
    status: "Pending deal" as const,
    story: story.id,
  };
  assert.equal(ownershipUpdates([item], [story]).length, 1);
  assert.equal(ownershipUpdates([item], []).length, 0);
  assert.equal(
    ownershipUpdates([item], [{ ...story, kind: "article" }]).length,
    0,
  );
  assert.deepEqual(
    publicationSocials.map((s) => s.name),
    ["LinkedIn", "Instagram", "Pinterest"],
  );
});
