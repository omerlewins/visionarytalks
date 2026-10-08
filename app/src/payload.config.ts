import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import sharp from "sharp";
import path from "node:path";
import { collections } from "./cms/collections";
import { editors } from "./cms/access";
import { prepareTask } from "./workflows/engine";
import { privateBlobStorage } from "./cms/blob-storage";
if (
  process.env.VERCEL_ENV === "production" &&
  (process.env.DEMO_MODE === "true" || process.env.APP_ENV !== "production")
)
  throw new Error(
    "Production must explicitly disable fixtures and use APP_ENV=production",
  );
if (process.env.VERCEL_ENV === "preview" && process.env.APP_ENV !== "preview")
  throw new Error("Preview requires its isolated APP_ENV=preview credentials");
if (
  process.env.VERCEL_ENV &&
  ((!process.env.S3_BUCKET &&
    !process.env.BLOB_STORE_ID &&
    !process.env.BLOB_READ_WRITE_TOKEN) ||
    !process.env.DATABASE_URL ||
    (process.env.PAYLOAD_SECRET?.length ?? 0) < 32)
)
  throw new Error(
    "Hosted environments require durable private storage, PostgreSQL and a 32+ character secret",
  );
export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? "",
  sharp,
  editor: lexicalEditor(),
  admin: {
    user: "users",
    importMap: { baseDir: path.resolve(process.cwd(), "src") },
    meta: { titleSuffix: "— Visionary Talks" },
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL ?? "",
      connectionTimeoutMillis: 15000,
    },
    push: process.env.APP_ENV === "development",
    migrationDir: path.resolve(process.cwd(), "src/migrations"),
  }),
  collections,
  globals: [
    {
      slug: "site-settings",
      access: { read: () => true, update: editors },
      fields: [
        {
          name: "featuredStories",
          type: "relationship",
          relationTo: "stories",
          hasMany: true,
        },
        {
          name: "heroTitle",
          type: "text",
          defaultValue: "The stories behind the world we live in.",
        },
        { name: "heroDescription", type: "textarea" },
        { name: "newsletterURL", type: "text" },
      ],
    },
  ],
  plugins: [
    ...(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN
      ? [privateBlobStorage()]
      : [
          s3Storage({
            enabled: Boolean(process.env.S3_BUCKET),
            alwaysInsertFields: true,
            collections: {
              media: { prefix: "media" },
              "source-documents": { prefix: "private" },
            },
            bucket: process.env.S3_BUCKET ?? "",
            config: {
              region: process.env.S3_REGION ?? "auto",
              endpoint: process.env.S3_ENDPOINT,
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
              },
            },
          }),
        ]),
  ],
  upload: { limits: { fileSize: 4 * 1024 * 1024 } },
  jobs: {
    enableConcurrencyControl: true,
    access: {
      run: ({ req }) =>
        Boolean(process.env.CRON_SECRET) &&
        req.headers.get("authorization") ===
          `Bearer ${process.env.CRON_SECRET}`,
    },
    tasks: [prepareTask],
  },
  typescript: {
    outputFile: path.resolve(process.cwd(), "src/payload-types.ts"),
  },
});
