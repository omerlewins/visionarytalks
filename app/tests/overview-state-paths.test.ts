import { test } from "node:test";
import assert from "node:assert/strict";
import data from "../src/data/us-state-wealth.json";
import { overviewStatePaths } from "../src/lib/overview-state-paths";
test("homepage geography retains all 51 jurisdictions and polygon rings with a smaller payload", () => {
  let original = 0,
    overview = 0;
  for (const state of data.states) {
    const path = overviewStatePaths[state.code];
    assert.ok(path.startsWith("M") && path.endsWith("Z"));
    assert.equal(
      (path.match(/M/g) || []).length,
      (state.path.match(/M/g) || []).length,
    );
    assert.ok(!/NaN|undefined/.test(path));
    original += state.path.length;
    overview += path.length;
  }
  assert.equal(Object.keys(overviewStatePaths).length, 51);
  assert.ok(overview < original * 0.4, `${overview} / ${original}`);
  assert.equal(
    data.states.find((s) => s.code === "HI")!.topOnePercent,
    21518000,
  );
});
