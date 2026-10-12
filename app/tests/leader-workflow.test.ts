import {
  canChartWealth,
  leaderWealthObservations,
} from "../src/lib/leader-wealth";
import assert from "node:assert/strict";
import { test } from "node:test";
import { leaderProfiles, leaderSources } from "../src/lib/leaders";
import { validateLeader } from "../src/lib/leader-validation";
import { sectionsForStages } from "../src/lib/leader-flow";
import starter from "../../growth/leaders/PROFILE_STARTER.json";
const today = "2026-10-12";
const fixture = () =>
  structuredClone(leaderProfiles.find((p) => p.slug === "michael-truell")!);
test("all current profiles satisfy the shared structural contract", () => {
  for (const p of leaderProfiles)
    assert.deepEqual(
      validateLeader(p, leaderSources, today).errors,
      [],
      p.name,
    );
});
test("stage ordering survives array reordering and supports multiple origin sections", () => {
  const sections = [
    { stage: "finding" as const, id: 4 },
    { stage: "company" as const, id: 2 },
    { stage: "origin" as const, id: 1 },
    { stage: "strategy" as const, id: 3 },
    { stage: "origin" as const, id: 5 },
  ];
  assert.deepEqual(
    sectionsForStages(sections, ["origin", "company", "strategy"]).map(
      (s) => s.id,
    ),
    [1, 5, 2, 3],
  );
});
test("validator rejects missing stage, future access date, broken reference and unknown estimate provenance", () => {
  let p = fixture();
  p.sections = p.sections.filter((s) => s.stage !== "strategy");
  assert.ok(
    validateLeader(p, leaderSources, today).errors.some((e) =>
      e.includes("strategy"),
    ),
  );
  p = fixture();
  p.quickFacts[0].sourceId = "missing-record";
  assert.ok(
    validateLeader(p, leaderSources, today).errors.some((e) =>
      e.includes("Missing source"),
    ),
  );
  p = fixture();
  delete p.wealth.estimator;
  assert.ok(
    validateLeader(p, leaderSources, today).errors.some((e) =>
      e.includes("estimator name"),
    ),
  );
  const sources = structuredClone(leaderSources);
  sources[p.sourceIds[0]].accessed = "2026-10-13";
  assert.ok(
    validateLeader(p, sources, today).errors.some((e) =>
      e.includes("access date"),
    ),
  );
});
test("invalid calendar dates and fact-table placeholders cannot enter the shared contract", () => {
  const p = fixture();
  p.checked = "2026-02-30";
  assert.ok(validateLeader(p, leaderSources, today).errors.length);
  p.checked = today;
  p.quickFacts[0].value = "[RESEARCH]";
  assert.ok(
    validateLeader(p, leaderSources, today).errors.some((e) =>
      e.includes("placeholders"),
    ),
  );
});
test("starter cannot pass validation and research drafts cannot pass the editorial gate", () => {
  assert.ok(validateLeader(starter, leaderSources, today).errors.length);
  const draft = fixture();
  draft.editorialReview.status = "needs-review";
  draft.editorialReview.findingsReviewed = false;
  assert.ok(
    validateLeader(draft, leaderSources, today).publicationGaps.some((g) =>
      g.includes("Editorial approval"),
    ),
  );
});

test("wealth charts require three distinct dates and retain history when a current total is unavailable", () => {
  const p = fixture();
  p.wealth.value = null;
  const history = leaderWealthObservations(p);
  assert.ok(history.length > 0);
  const point = history[0];
  assert.equal(
    canChartWealth([
      { ...point, date: "2025-01-01" },
      { ...point, date: "2025-01-01", estimator: "Other" },
      { ...point, date: "2026-01-01" },
    ]),
    false,
  );
  assert.equal(
    canChartWealth([
      { ...point, date: "2024-01-01" },
      { ...point, date: "2025-01-01" },
      { ...point, date: "2026-01-01" },
    ]),
    true,
  );
});
