"use client";

import pay from "@/data/salary-maps.json";
import { SalaryStateMap, dollars, type StateData } from "./SalaryStateMap";

type Job = keyof typeof pay.jobs;

const k = (n: number) => `$${n / 1000}K`;
const median = (edges: number[]) => [
  `Under ${k(edges[0])}`,
  `${k(edges[0])} to ${k(edges[1])}`,
  `${k(edges[1])} to ${k(edges[2])}`,
  `${k(edges[2])} to ${k(edges[3])}`,
  `${k(edges[3])}+`,
];
const jobs = (edges: number[]) => {
  const f = (n: number) => n.toLocaleString("en-US");
  return [
    `Under ${f(edges[0])}`,
    `${f(edges[0])} to ${f(edges[1] - 1)}`,
    `${f(edges[1])} to ${f(edges[2] - 1)}`,
    `${f(edges[2])} to ${f(edges[3] - 1)}`,
    `${f(edges[3])}+`,
  ];
};

// Per-job copy and color breaks. Data for every job comes from one BLS file
// build (app/src/data/salary-maps.json); each article places its map with
// <div id="vt-salary-map-<job>"></div>.
const config: Record<
  Job,
  {
    name: string;
    median: number[];
    employment: number[];
    defaultState: string;
    note?: string;
  }
> = {
  "dental-hygienist": {
    name: "dental hygienist",
    median: [85000, 95000, 105000, 115000],
    employment: [1000, 2500, 5000, 10000],
    defaultState: "CA",
    note: "Many hygienists work part time; BLS annual figures assume full-time hours.",
  },
  electrician: {
    name: "electrician",
    median: [60000, 65000, 70000, 80000],
    employment: [5000, 10000, 20000, 40000],
    defaultState: "IL",
  },
  firefighter: {
    name: "firefighter",
    median: [45000, 55000, 65000, 75000],
    employment: [2000, 5000, 10000, 20000],
    defaultState: "NY",
    note: "Paid firefighters only; BLS does not count volunteers.",
  },
  pilot: {
    name: "airline pilot",
    median: [150000, 200000, 250000, 300000],
    employment: [500, 2000, 4000, 8000],
    defaultState: "GA",
    note: "Small pilot counts make some state medians swing widely; several states have no published estimate.",
  },
  lineman: {
    name: "lineman",
    median: [80000, 90000, 100000, 110000],
    employment: [1000, 2000, 3000, 5000],
    defaultState: "WA",
  },
  "garbage-collector": {
    name: "garbage collector",
    median: [42000, 48000, 54000, 60000],
    employment: [1000, 2000, 4000, 8000],
    defaultState: "IL",
  },
};

export function JobStateMap({ job }: { job: Job }) {
  const data = pay.jobs[job];
  const c = config[job];
  return (
    <SalaryStateMap
      id={`${job}-state-map`}
      title={`${c.name[0].toUpperCase()}${c.name.slice(1)} salary by state`}
      eyebrow="BLS WAGE DATA · MAY 2025"
      intro={
        <>
          Median annual wage and number of jobs in each state for{" "}
          {data.title.toLowerCase()}, from the Bureau of Labor Statistics. The
          national median is {dollars(data.national.median)}.
        </>
      }
      states={data.states as Record<string, StateData>}
      scales={{
        median: { edges: c.median, labels: median(c.median) },
        employment: { edges: c.employment, labels: jobs(c.employment) },
      }}
      defaultState={c.defaultState}
      mapLabel={`Interactive US map of ${c.name} pay. Select a state to see its figures.`}
      hint={
        <>
          Click or tap a state, or use Tab and Enter. These are wages paid in
          May 2025 to {data.title.toLowerCase()}, BLS occupation{" "}
          {data.occupation}. BLS counts straight-time pay, so overtime is not
          included.{c.note ? ` ${c.note}` : ""}
        </>
      }
      caption={`${data.title} pay by state, May 2025`}
      source={
        <>
          Source:{" "}
          <a href="https://www.bls.gov/oes/">
            BLS Occupational Employment and Wage Statistics
          </a>
          , May 2025, occupation {data.occupation}, from the BLS state data file
          downloaded October 27, 2026. Boundaries: US Census via us-atlas.
        </>
      }
    />
  );
}
