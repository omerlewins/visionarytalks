// Decode world-atlas countries-110m TopoJSON into projected SVG paths.
// The output is committed and bundled, so the map makes no external requests.
// Run from app/: npx tsx scripts/build-world-geometry.ts
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

type Ring = number[][];
type Geometry = {
  type: "Polygon" | "MultiPolygon";
  id?: string;
  properties: { name: string };
  arcs: number[][] | number[][][];
};
const require = createRequire(import.meta.url);
const topoPath = require.resolve("world-atlas/countries-110m.json");
const version = JSON.parse(
  readFileSync(require.resolve("world-atlas/package.json"), "utf8"),
).version as string;
const topo = JSON.parse(readFileSync(topoPath, "utf8")) as {
  transform: { scale: [number, number]; translate: [number, number] };
  arcs: number[][][];
  objects: { countries: { geometries: Geometry[] } };
};

// Delta-decode quantized arcs into longitude/latitude.
const [sx, sy] = topo.transform.scale;
const [tx, ty] = topo.transform.translate;
const arcs = topo.arcs.map((arc) => {
  let x = 0,
    y = 0;
  return arc.map(([dx, dy]) => {
    x += dx;
    y += dy;
    return [x * sx + tx, y * sy + ty];
  });
});
const ring = (indexes: number[]): Ring => {
  const points = indexes.flatMap((i, n) => {
    const arc = i < 0 ? [...arcs[~i]].reverse() : arcs[i];
    return n === 0 ? arc : arc.slice(1);
  });
  // A few Russia and Fiji rings straddle the antimeridian. Unwrap them east of
  // 180° so no edge is drawn across the whole map; the overhang is clipped.
  const straddles = points.some(
    (p, k) => k > 0 && Math.abs(p[0] - points[k - 1][0]) > 180,
  );
  return straddles
    ? points.map(([lon, lat]) => [lon < 0 ? lon + 360 : lon, lat])
    : points;
};

// Equal Earth projection (Šavrič, Patterson and Jenny, 2018).
const [A1, A2, A3, A4] = [1.340264, -0.081106, 0.000893, 0.003796];
const M = Math.sqrt(3) / 2;
const project = ([lon, lat]: number[]) => {
  const lambda = (lon * Math.PI) / 180;
  const l = Math.asin(M * Math.sin((lat * Math.PI) / 180));
  const l2 = l * l,
    l6 = l2 * l2 * l2;
  return [
    (lambda * Math.cos(l)) /
      (M * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2))),
    l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2)),
  ];
};

// Antarctica carries no list entries and dominates the frame, so it is omitted.
const geometries = topo.objects.countries.geometries.filter(
  (g) => g.id !== "010",
);
const polygons = (g: Geometry): number[][][] =>
  (g.type === "Polygon" ? [g.arcs] : g.arcs) as number[][][];
const projected = geometries.map((g) => ({
  g,
  rings: polygons(g).flatMap((polygon) =>
    polygon.map((r) => ring(r).map(project)),
  ),
}));
const all = projected.flatMap((p) => p.rings.flat());
// Frame on the ±180° meridians, not on the unwrapped overhang.
const minX = project([-180, 0])[0],
  maxX = project([180, 0])[0],
  minY = Math.min(...all.map((p) => p[1])),
  maxY = Math.max(...all.map((p) => p[1]));
const width = 960,
  pad = 4,
  k = (width - pad * 2) / (maxX - minX),
  height = Math.ceil((maxY - minY) * k + pad * 2);
const toSvg = ([x, y]: number[]) => [
  +((x - minX) * k + pad).toFixed(1),
  +((maxY - y) * k + pad).toFixed(1),
];
const countries = projected
  .map(({ g, rings }) => {
    const path = rings
      .map((r) => {
        const pts = r
          .map(toSvg)
          .filter(
            (p, i, a) =>
              i === 0 || p[0] !== a[i - 1][0] || p[1] !== a[i - 1][1],
          );
        return pts.length < 3
          ? ""
          : "M" + pts.map((p) => p[0] + "," + p[1]).join("L") + "Z";
      })
      .join("");
    return { id: g.id ?? null, name: g.properties.name, path };
  })
  .filter((c) => c.path)
  .sort((a, b) => a.name.localeCompare(b.name));

const out = fileURLToPath(
  new URL("../src/data/world-countries-110m.json", import.meta.url),
);
writeFileSync(
  out,
  JSON.stringify(
    {
      source: `world-atlas ${version} countries-110m.json (Natural Earth 1:110m, public domain)`,
      sourceUrl: "https://github.com/topojson/world-atlas",
      license: "world-atlas-LICENSE.txt",
      projection: "Equal Earth",
      omitted: ["Antarctica"],
      ids: "ISO 3166-1 numeric; null where Natural Earth has none",
      width,
      height,
      countries,
    },
    null,
    1,
  ) + "\n",
);
console.log(`${countries.length} countries, ${width}x${height} → ${out}`);
