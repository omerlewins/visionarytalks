import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "stories_sections" ADD COLUMN "anchor" varchar;
  ALTER TABLE "_stories_v_version_sections" ADD COLUMN "anchor" varchar;`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "stories_sections" DROP COLUMN "anchor";
  ALTER TABLE "_stories_v_version_sections" DROP COLUMN "anchor";`);
}
