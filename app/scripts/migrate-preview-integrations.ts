export {};
if (
  process.env.APP_ENV !== "preview" ||
  process.env.VERCEL_ENV === "production" ||
  !process.env.NEON_PROJECT_ID ||
  !process.env.DATABASE_URL
)
  throw Error("Isolated Preview only");
const url = new URL(process.env.DATABASE_URL);
if (!url.hostname.endsWith(".neon.tech"))
  throw Error("Unexpected database host");
url.hostname = url.hostname.replace("-pooler", "");
process.env.DATABASE_URL = url.href;
const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config");
const payload = await getPayload({ config });
try {
  await payload.db.migrate();
  console.log(
    "Integration migration applied to the isolated Preview database.",
  );
} finally {
  await payload.destroy();
}
process.exit(0);
