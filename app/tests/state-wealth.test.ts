import { test } from "node:test";
import assert from "node:assert/strict";
import {
  correctedStateWealthHTML,
  stateWealthData as data,
} from "../src/lib/state-wealth";
import leopold from "../src/data/leopold-aschenbrenner-profile.json";
import { validateLeader } from "../src/lib/leader-validation";
import { leaderSchema } from "../src/lib/leader-schema";
import { leaderWealthObservations } from "../src/lib/leader-wealth";

test("top 1% map retains dated household dollar estimates for every jurisdiction", () => {
  assert.equal(data.topOnePercent.date, "2026-04");
  assert.equal(data.topOnePercent.checked, "2026-10-12");
  assert.match(data.topOnePercent.source, /windfall.com/);
  for (const state of data.states)
    assert.ok(
      Number.isInteger(state.topOnePercent) && state.topOnePercent > 1000000,
    );
  const ranked = [...data.states].sort(
    (a, b) => b.topOnePercent - a.topOnePercent,
  );
  assert.equal(ranked[0].code, "HI");
  assert.equal(ranked[0].topOnePercent, 21518000);
  assert.equal(ranked.at(-1)!.code, "MS");
  assert.equal(ranked.at(-1)!.topOnePercent, 2940000);
  assert.equal(
    data.states.find((s) => s.code === "CA")!.topOnePercent,
    19751000,
  );
  assert.equal(
    data.states.find((s) => s.code === "DC")!.topOnePercent,
    11255000,
  );
});

test("state maps include 50 states plus DC, preserve true zero counts, and reconcile totals", () => {
  assert.equal(data.states.length, 51);
  assert.equal(new Set(data.states.map((s) => s.fips)).size, 51);
  assert.equal(new Set(data.states.map((s) => s.code)).size, 51);
  assert.equal(
    data.states.reduce((sum, s) => sum + s.billionaires, 0),
    871,
  );
  assert.equal(
    data.states.reduce((sum, s) => sum + s.millionaires, 0),
    21790000,
  );
  assert.deepEqual(
    data.states
      .filter((s) => s.billionaires === 0)
      .map((s) => s.code)
      .sort(),
    ["AK", "DE", "WV"],
  );
  assert.equal(data.states.find((s) => s.code === "MS")!.billionaires, 2);
  for (const s of data.states) {
    assert.match(s.path, /^M/);
    assert.ok(s.households > s.millionaires);
    assert.ok(s.x >= 0 && s.x <= 975 && s.y >= 0 && s.y <= 610);
  }
});
test("legacy Mississippi correction applies to the intended article only", () => {
  const html =
    "<tr><td>20</td><td>Mississippi</td><td>MS</td><td>8</td><td>2.71</td></tr><tr><td>10</td><td>Mississippi</td><td>8</td><td>2.71</td></tr>";
  const fixed = correctedStateWealthHTML(
    "/how-many-billionaires-by-state/",
    html,
  );
  assert.match(fixed, /<td>MS<\/td><td>2<\/td><td>0.68/);
  assert.match(fixed, /<td>Colorado<\/td><td>13/);
  assert.equal(correctedStateWealthHTML("/millionaires-by-state/", html), html);
  assert.equal(
    correctedStateWealthHTML("/how-many-billionaires-by-state/", fixed),
    fixed,
  );
});
test("Leopold retains his original canonical route and never charts managed assets as personal wealth", () => {
  const p = leopold.profile as any;
  assert.deepEqual(validateLeader(p, leopold.sources, p.checked).errors, []);
  assert.equal(p.path, "/leopold-aschenbrenner-net-worth/");
  assert.equal(
    leaderSchema(p)["@graph"][0].mainEntityOfPage,
    "https://visionarytalks.com/leopold-aschenbrenner-net-worth/",
  );
  assert.equal(p.wealth.value, null);
  assert.deepEqual(leaderWealthObservations(p), []);
  assert.equal(
    (((5673738513 + 5573819392) / 20242292228) * 100).toFixed(1),
    "55.6",
  );
});
