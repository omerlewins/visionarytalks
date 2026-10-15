import assert from "node:assert/strict";
import { test } from "node:test";
import history from "../src/data/leader-wealth-history.json";
import batch from "../src/data/leader-profiles.json";
import pilot from "../src/data/michael-truell-profile.json";
import {
  leaderWealthObservations,
  wealthHistory,
} from "../src/lib/leader-wealth";
const profiles = [...batch.leaders, pilot.profile];
const sources = { ...batch.sources, ...pilot.sources, ...history.sources };
test("historical wealth points have valid dates, personal definitions and reviewed sources", () => {
  for (const p of profiles)
    for (const o of leaderWealthObservations(p)) {
      assert.ok(Number.isFinite(o.value) && o.value >= 0, p.name);
      assert.match(o.date, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(o.date <= history.checked);
      assert.ok(sources[o.sourceId as keyof typeof sources], o.sourceId);
      assert.ok(o.dateBasis && o.basis && o.note);
    }
  assert.ok(
    Object.keys(wealthHistory).every((slug) =>
      profiles.some((p) => p.slug === slug),
    ),
  );
});
test("Cursor history retains an earlier sourced total and does not insert financing or transaction proceeds", () => {
  const p = pilot.profile,
    observations = leaderWealthObservations(p);
  assert.deepEqual(
    observations.map((o) => [o.date, o.value]),
    [
      ["2025-12-25", 1.3],
      ["2026-10-09", 2.8],
      ["2026-10-12", 2.8],
    ],
  );
  assert.ok(
    observations.every(
      (o) => o.value !== 2.4 && o.value !== 29.3 && o.value !== 60,
    ),
  );
});
test("unknown totals do not turn into zero-valued personal histories", () => {
  for (const p of profiles.filter((p) => p.wealth.value === null))
    assert.deepEqual(leaderWealthObservations(p), []);
  assert.equal(
    leaderWealthObservations(profiles.find((p) => p.slug === "scott-wu")!)
      .length,
    1,
  );
});
test("historical observations are chronological and retain explicit valuation dates", () => {
  const o = leaderWealthObservations(
    profiles.find((p) => p.slug === "daniela-amodei")!,
  );
  assert.deepEqual(
    o.map((p) => p.date),
    ["2025-03-07", "2026-06-01", "2026-10-11", "2026-10-12"],
  );
  assert.equal(o[0].dateBasis, "Valuation date");
});
