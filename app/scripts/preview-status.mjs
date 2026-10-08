import pg from "pg";
if (process.env.APP_ENV !== "preview") throw new Error("Preview environment required");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15000, query_timeout: 15000 });
await client.connect();
for (const table of ["stories", "media"]) {
  const result = await client.query(`SELECT count(*)::int AS count, max(updated_at) AS latest FROM ${table}`);
  console.log(table, result.rows[0]);
}
await client.end();
