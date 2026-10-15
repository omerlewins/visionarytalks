import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "integrations" (
    "id" serial PRIMARY KEY NOT NULL,
    "search_console_property" varchar,
    "google_verification_token" varchar,
    "ga4_property_id" varchar,
    "ga4_measurement_id" varchar,
    "tracking_enabled" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "integrations" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "integrations" CASCADE;`);
}
