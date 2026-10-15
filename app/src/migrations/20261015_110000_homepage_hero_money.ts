import {
  type MigrateUpArgs,
  type MigrateDownArgs,
  sql,
} from "@payloadcms/db-postgres";
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "stories" ADD COLUMN "homepage_headline" varchar;
    ALTER TABLE "_stories_v" ADD COLUMN "version_homepage_headline" varchar;
    ALTER TABLE "site_settings" ADD COLUMN "homepage_hero_id" integer;
    ALTER TABLE "site_settings" ADD COLUMN "homepage_lead_id" integer;
    ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_homepage_hero_fk" FOREIGN KEY ("homepage_hero_id") REFERENCES "public"."stories"("id") ON DELETE set null;
    ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_homepage_lead_fk" FOREIGN KEY ("homepage_lead_id") REFERENCES "public"."stories"("id") ON DELETE set null;
    CREATE INDEX "site_settings_homepage_hero_idx" ON "site_settings" ("homepage_hero_id");
    CREATE INDEX "site_settings_homepage_lead_idx" ON "site_settings" ("homepage_lead_id");
  `);
}
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN "homepage_hero_id", DROP COLUMN "homepage_lead_id";
    ALTER TABLE "stories" DROP COLUMN "homepage_headline";
    ALTER TABLE "_stories_v" DROP COLUMN "version_homepage_headline";
  `);
}
