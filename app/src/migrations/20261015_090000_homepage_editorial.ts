import {
  type MigrateUpArgs,
  type MigrateDownArgs,
  sql,
} from "@payloadcms/db-postgres";
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
 CREATE TYPE "public"."enum_site_settings_ownership_updates_status" AS ENUM('Pending deal','New round','IPO filing','Reported talks');
 CREATE TABLE "site_settings_ownership_updates" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "event_date" timestamp(3) with time zone NOT NULL,
  "status" "enum_site_settings_ownership_updates_status" NOT NULL,
  "headline" varchar NOT NULL,
  "story_id" integer NOT NULL
 );
 ALTER TABLE "site_settings_ownership_updates" ADD CONSTRAINT "site_settings_ownership_updates_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade;
 ALTER TABLE "site_settings_ownership_updates" ADD CONSTRAINT "site_settings_ownership_updates_story_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade;
 CREATE INDEX "site_settings_ownership_updates_order_idx" ON "site_settings_ownership_updates" ("_order");
 CREATE INDEX "site_settings_ownership_updates_parent_idx" ON "site_settings_ownership_updates" ("_parent_id");
 CREATE INDEX "site_settings_ownership_updates_story_idx" ON "site_settings_ownership_updates" ("story_id");
 `);
}
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(
    sql`DROP TABLE "site_settings_ownership_updates"; DROP TYPE "public"."enum_site_settings_ownership_updates_status"; DELETE FROM "site_settings_rels" WHERE "path"='mostReadStories';`,
  );
}
