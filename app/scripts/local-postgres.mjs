import EmbeddedPostgres from "embedded-postgres";
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
const root = path.resolve("../private/local-postgres");
await mkdir(root, { recursive: true });
const credential = path.join(root, "credentials.json");
const keys = existsSync(credential)
  ? JSON.parse(await readFile(credential, "utf8"))
  : {
      password: randomBytes(24).toString("hex"),
      secret: randomBytes(32).toString("hex"),
    };
await writeFile(credential, JSON.stringify(keys));
const pg = new EmbeddedPostgres({
  databaseDir: path.join(root, "data"),
  user: "postgres",
  password: keys.password,
  port: 54329,
  persistent: true,
  postgresFlags: ["-h", "127.0.0.1"],
  onLog: () => {},
  onError: (msg) => {
    if (String(msg).includes("FATAL")) console.error(msg);
  },
});
if (!existsSync(path.join(root, "data", "PG_VERSION"))) await pg.initialise();
await pg.start();
try {
  await pg.createDatabase("visionarytalks");
} catch {}
if (!existsSync(".env.local"))
  await writeFile(
    ".env.local",
    `APP_ENV=development\nDEMO_MODE=true\nDATABASE_URL=postgresql://postgres:${keys.password}@127.0.0.1:54329/visionarytalks\nPAYLOAD_SECRET=${keys.secret}\nNEXT_PUBLIC_SITE_URL=http://localhost:3000\n`,
  );
console.log(
  "Local PostgreSQL ready on loopback port 54329. Development credentials saved in ignored files.",
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, async () => {
    await pg.stop();
    process.exit(0);
  });
setInterval(() => {}, 10000);
