/** Local, read-only preparation. No CMS/model credentials or publication side effects. */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import { packetSchema } from "../src/workflows/contracts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const cycle = JSON.parse(await readFile(resolve(root, "growth/cycles/2026-10-09/packets.json"), "utf8"));
const raw = JSON.parse(await readFile(resolve(root, "private/search-console-pages.json"), "utf8"));
const filters = await readFile(resolve(root, "private/search-console-Filters.csv"), "utf8");
const inventory = JSON.parse(await readFile(resolve(root, "private/ranking-audit/source-comparison.json"), "utf8"));
const http = JSON.parse(await readFile(resolve(root, "private/ranking-audit/http-results.json"), "utf8"));

function finite(value: unknown, label: string) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid ${label}`);
  return n;
}
const byURL = new Map<string, { url: string; path: string; clicks: number; impressions: number; weightedPosition: number; sourceRows: number }>();
for (const row of raw) {
  const url = new URL(row["Top pages"]);
  if (!["visionarytalks.com", "www.visionarytalks.com"].includes(url.hostname)) throw new Error("Unexpected Search Console host");
  const clicks = finite(row.Clicks, "clicks");
  const impressions = finite(row.Impressions, "impressions");
  const position = finite(row.Position, "position");
  const record = byURL.get(url.href) ?? { url: url.href, path: url.pathname, clicks: 0, impressions: 0, weightedPosition: 0, sourceRows: 0 };
  record.clicks += clicks;
  record.impressions += impressions;
  record.weightedPosition += position * impressions;
  record.sourceRows++;
  byURL.set(url.href, record);
}
const pages = [...byURL.values()].map(({ weightedPosition, ...page }) => ({
  ...page,
  ctrPercent: page.impressions ? Number((100 * page.clicks / page.impressions).toFixed(3)) : null,
  averagePosition: page.impressions ? Number((weightedPosition / page.impressions).toFixed(3)) : null,
}));
const totals = pages.reduce((sum, p) => ({ clicks: sum.clicks + p.clicks, impressions: sum.impressions + p.impressions }), { clicks: 0, impressions: 0 });
const validatedPackets = cycle.items.map((item: any) => {
  const packet = packetSchema.parse(item.packet);
  const matches = inventory.filter((row: any) => row.path === packet.proposedPath && row.targetID);
  const existing = ["revision", "data-review"].includes(item.action);
  if (existing && !matches.length) throw new Error(`Missing existing revision target: ${item.id}`);
  if (!existing && matches.length) throw new Error(`New-story path collides with known target: ${item.id}`);
  return { id: item.id, hub: item.hub, action: item.action, state: item.status,
    contractValid: true, path: packet.proposedPath,
    targetKnownInMigrationInventory: Boolean(matches.length),
    readyForPublication: false, pending: item.requiredBeforePublication,
    duplicateCheckScope: "supplied ranking URL migration inventory only; full CMS/live check pending" };
});
const sample = [
  { state: "California", approximateMillionaireHouseholds: 3590000, approximateCoveredHouseholds: 12430000, existingSharePercent: 28.9 },
  { state: "New Jersey", approximateMillionaireHouseholds: 960000, approximateCoveredHouseholds: 3240000, existingSharePercent: 29.6 },
].map(row => {
  const computedSharePercent = Number((row.approximateMillionaireHouseholds / row.approximateCoveredHouseholds * 100).toFixed(1));
  return { ...row, computedSharePercent, matches: computedSharePercent === row.existingSharePercent };
});
if (sample.some(row => !row.matches)) throw new Error("Wealth sample failed reconciliation");
const topPages = [...pages].sort((a, b) => b.clicks - a.clicks).slice(0, 10);
const refreshCandidates = pages.filter(p => p.impressions >= 10000 && p.averagePosition !== null && p.averagePosition >= 4 && p.averagePosition <= 15)
  .sort((a, b) => b.impressions - a.impressions);
const report = {
  cycle: cycle.cycle, generatedAt: new Date().toISOString(), mode: cycle.mode,
  status: "preparation-complete; source/editorial review and DataForSEO pending",
  actualSideEffects: "local ignored report files only; no CMS write/model call/publication/automation",
  searchConsole: { scope: "exported page rows only; not property-wide visits", rawRows: raw.length, uniqueURLs: pages.length, filtersCSV: filters.trim(), exactDateRange: null, country: null, device: null, ...totals,
    ctrPercent: Number((100 * totals.clicks / totals.impressions).toFixed(3)), topPages,
    topFiveClickSharePercent: Number((100 * topPages.slice(0, 5).reduce((s, p) => s + p.clicks, 0) / totals.clicks).toFixed(1)) },
  dataforseo: { state: "oauth-required", initializationStatus: 401, currentMetricsRetrieved: false, scope: cycle.scope },
  packetValidation: validatedPackets,
  dataVerification: { source: "https://www.windfall.com/blog/what-it-takes-to-be-in-the-top-1-of-every-state", observationPeriod: "April 2026", scope: "two-row sample only; full table/national total unverified", sample },
  migrationAudit: { scope: "existing supplied 206-URL HTTP audit, not a fresh crawl", sampleURLs: http.length,
    live200: http.filter((r: any) => r.live.status === 200).length, staging200: http.filter((r: any) => r.staging.status === 200).length,
    clickedNon200Staging: http.filter((r: any) => r.clicks > 0 && r.staging.status !== 200).map((r: any) => ({ path: r.path, clicks: r.clicks, status: r.staging.status ?? null })) },
  nextMeasurement: "Capture exact completed-date GSC windows at publication; review at 7/28/56 days. No scheduled execution.",
};
const output = resolve(root, "private/growth", cycle.cycle);
await mkdir(output, { recursive: true });
await writeFile(resolve(output, "cycle-report.json"), JSON.stringify(report, null, 2) + "\n");
await writeFile(resolve(output, "refresh-candidates.json"), JSON.stringify(refreshCandidates, null, 2) + "\n");
console.log(JSON.stringify({ cycle: cycle.cycle, validatedPackets: validatedPackets.length, sampleCalculationsPassed: sample.length, searchConsoleExport: totals, uniqueURLs: pages.length, refreshCandidates: refreshCandidates.length, output, dataforseo: "OAuth required", publication: "pending review", automation: "none" }, null, 2));
