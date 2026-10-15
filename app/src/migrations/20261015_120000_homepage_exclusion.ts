import {
  type MigrateUpArgs,
  type MigrateDownArgs,
  sql,
} from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "stories" ADD COLUMN "exclude_from_homepage" boolean DEFAULT false;
    ALTER TABLE "_stories_v" ADD COLUMN "version_exclude_from_homepage" boolean DEFAULT false;
  `);
}
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "stories" DROP COLUMN "exclude_from_homepage";
    ALTER TABLE "_stories_v" DROP COLUMN "version_exclude_from_homepage";
  `);
}
