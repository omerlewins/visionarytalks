import pg from "pg";
if (process.env.APP_ENV !== "development")
  throw new Error("Local development environment only");
const connection = new URL(process.env.DATABASE_URL);
if (connection.hostname !== "127.0.0.1" || connection.port !== "54329")
  throw new Error(
    "Migration test is restricted to the isolated local test server",
  );
const client = new pg.Client({ connectionString: connection.href });
await client.connect();
const name = `visionary_migration_${Date.now()}`;
await client.query(`CREATE DATABASE "${name}"`);
await client.end();
connection.pathname = `/${name}`;
process.env.DATABASE_URL = connection.href;
process.env.APP_ENV = "preview";
const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config.ts");
const payload = await getPayload({ config });
await payload.db.migrate();
console.log(
  "PASS: all versioned migrations applied to a fresh isolated PostgreSQL database.",
);
await payload.destroy();
process.exit(0);
