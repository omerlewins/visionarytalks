import pg from "pg";
import { readFile, writeFile, mkdir } from "node:fs/promises";
const connection = new URL(process.env.DATABASE_URL);
if (
  process.env.APP_ENV !== "development" ||
  connection.hostname !== "127.0.0.1" ||
  connection.port !== "54329"
)
  throw new Error(
    "This helper only supports the isolated local development server",
  );
const client = new pg.Client({ connectionString: connection.href });
await client.connect();
const current = (await client.query("SHOW server_encoding")).rows[0]
  .server_encoding;
if (current === "UTF8") {
  console.log("Local database is already UTF-8");
  await client.end();
  process.exit(0);
}
const name = `visionarytalks_utf8_${Date.now()}`;
await mkdir("../private/database-backups", { recursive: true });
const quote = (value) => `"${value.replaceAll('"', '""')}"`;
const snapshot = {};
await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
const tables = (
  await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename <> 'payload_migrations'",
  )
).rows;
for (const { tablename } of tables)
  snapshot[tablename] = (
    await client.query(
      `SELECT row_to_json(t) AS doc FROM ${quote(tablename)} t`,
    )
  ).rows.map((row) => row.doc);
await client.query("COMMIT");
await writeFile(
  `../private/database-backups/${name}.json`,
  JSON.stringify(snapshot),
);
await client.query(
  `CREATE DATABASE "${name}" WITH TEMPLATE template0 ENCODING 'UTF8' LC_COLLATE 'C' LC_CTYPE 'C'`,
);
await client.end();
connection.pathname = `/${name}`;
process.env.DATABASE_URL = connection.href;
process.env.APP_ENV = "preview";
const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config.ts");
const payload = await getPayload({ config });
await payload.db.migrate();
await payload.destroy();
const target = new pg.Client({ connectionString: connection.href });
await target.connect();
await target.query("BEGIN");
await target.query("SET LOCAL session_replication_role = replica");
for (const [table, rows] of Object.entries(snapshot)) {
  if (!rows.length) continue;
  const columns = (
    await target.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=$1",
      [table],
    )
  ).rows;
  const keys = Object.keys(rows[0]);
  if (keys.some((key) => !columns.some((column) => column.column_name === key)))
    throw new Error(`Schema mismatch for ${table}; original database retained`);
  const json = new Set(
    columns
      .filter((c) => ["json", "jsonb"].includes(c.data_type))
      .map((c) => c.column_name),
  );
  for (const row of rows)
    await target.query(
      `INSERT INTO ${quote(table)} (${keys.map(quote).join(",")}) VALUES (${keys.map((_, index) => `$${index + 1}`).join(",")})`,
      keys.map((key) =>
        json.has(key) && row[key] !== null
          ? JSON.stringify(row[key])
          : row[key],
      ),
    );
  for (const key of keys) {
    const sequence = (
      await target.query("SELECT pg_get_serial_sequence($1, $2) AS seq", [
        quote(table),
        key,
      ])
    ).rows[0].seq;
    if (sequence)
      await target.query(
        `SELECT setval($1::regclass, GREATEST(COALESCE((SELECT MAX(${quote(key)}) FROM ${quote(table)}), 1), 1))`,
        [sequence],
      );
  }
}
await target.query("COMMIT");
await target.end();
const originalEnv = await readFile(".env.local", "utf8");
await writeFile(`../private/database-backups/${name}.env-before`, originalEnv);
connection.pathname = `/${name}`;
await writeFile(
  ".env.local",
  originalEnv.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL=${connection.href}`),
);
console.log(
  "Copied local database into UTF-8 and updated the ignored local environment. Original database and private backup retained.",
);
process.exit(0);
