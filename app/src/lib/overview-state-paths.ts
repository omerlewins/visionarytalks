import data from "@/data/us-state-wealth.json";
type Point = [number, number];
const square = (a: Point, b: Point) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
const distance = (p: Point, a: Point, b: Point) => {
  const length = square(a, b);
  if (!length) return square(p, a);
  const t = Math.max(
    0,
    Math.min(
      1,
      ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / length,
    ),
  );
  return square(p, [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
};
function simplify(points: Point[], tolerance: number): Point[] {
  if (points.length < 3) return points;
  let max = tolerance * tolerance,
    index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = distance(points[i], points[0], points.at(-1)!);
    if (d > max) {
      index = i;
      max = d;
    }
  }
  return index
    ? [
        ...simplify(points.slice(0, index + 1), tolerance).slice(0, -1),
        ...simplify(points.slice(index), tolerance),
      ]
    : [points[0], points.at(-1)!];
}
// Geometry only: 1.2 units in a 975px viewBox, less than half a CSS pixel on
// mobile. Retain every polygon ring and every state's exact financial values.
export function overviewPath(path: string): string {
  return (path.match(/M[^M]+/g) || [])
    .map((ring) => {
      const numbers = (ring.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
      const points: Point[] = [];
      for (let i = 0; i < numbers.length; i += 2)
        points.push([numbers[i], numbers[i + 1]]);
      let far = 1;
      for (let i = 2; i < points.length; i++)
        if (square(points[0], points[i]) > square(points[0], points[far]))
          far = i;
      const reduced =
        points.length < 5
          ? points
          : [
              ...simplify(points.slice(0, far + 1), 1.2).slice(0, -1),
              ...simplify([...points.slice(far), points[0]], 1.2).slice(0, -1),
            ];
      const kept = reduced.length >= 3 ? reduced : points;
      return (
        kept.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join("") + "Z"
      );
    })
    .join("");
}
export const overviewStatePaths = Object.fromEntries(
  data.states.map((s) => [s.code, overviewPath(s.path)]),
);
