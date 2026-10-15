import { test } from "node:test";
import assert from "node:assert/strict";
import {
  stateMoneySummary,
  billionaireLeaders,
  moneyStateHref,
  moneyBand,
} from "../src/lib/home-money";
import type { LeaderRecord } from "../src/lib/leader-validation";
import data from "../src/data/us-state-wealth.json";
import reference from "../src/data/home-money-reference.json";
test("Money summaries preserve dated state observations and compute weighted household shares", () => {
  const s = stateMoneySummary();
  assert.equal(s.highest.code, "HI");
  assert.equal(s.highest.topOnePercent, 21518000);
  assert.equal(s.lowest.code, "MS");
  assert.equal(s.lowest.topOnePercent, 2940000);
  assert.equal(s.millionaires.length, 10);
  assert.equal(s.millionaires[0].code, "VT");
  const total = data.states.reduce((n, s) => n + s.millionaires, 0),
    homes = data.states.reduce((n, s) => n + s.households, 0);
  assert.equal(s.nationalMillionaireShare, (total / homes) * 100);
  assert.equal(s.nationalMillionaireShare.toFixed(1), "17.6");
  assert.equal(reference.national.period, "2022");
  assert.equal(data.topOnePercent.date, "2026-04");
  assert.equal(moneyStateHref("HI"), "/top-1-percent-net-worth/#state-hi");
  assert.equal(moneyBand(15000000), 4);
});
test("AI billionaire list accepts sourced personal estimates, never company or unknown values", () => {
  const p = (
    name: string,
    value: number | null,
    basis = "Forbes personal wealth estimate",
    estimator = "Forbes",
  ) =>
    ({
      name,
      path: `/leaders/${name}/`,
      wealth: {
        value,
        basis,
        estimator,
        sourceId: "record",
        date: "2026-10-12",
      },
    }) as LeaderRecord;
  const ranked = billionaireLeaders([
    p("small", 1),
    p("large", 9),
    p("unknown", null),
    p("company", 50, "Company valuation"),
    p("historical", 3, "Historical estimate"),
    p("other", 10, "Personal wealth", "Bloomberg"),
    p("below", 0.6),
    {
      ...p("unestablished", 12),
      wealth: {
        ...p("unestablished", 12).wealth,
        display: "Wealth not established",
      },
    },
  ]);
  assert.deepEqual(
    ranked.map((p) => p.name),
    ["large", "small"],
  );
});
