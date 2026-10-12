import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "stories" ADD COLUMN "published_research" jsonb;
    ALTER TABLE "_stories_v" ADD COLUMN "version_published_research" jsonb;`);
}
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "stories" DROP COLUMN "published_research";
    ALTER TABLE "_stories_v" DROP COLUMN "version_published_research";`);
}
