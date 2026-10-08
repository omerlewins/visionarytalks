import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_content_jobs_action" AS ENUM('retry', 'cancel');
  ALTER TABLE "media" ADD COLUMN "prefix" varchar DEFAULT 'media';
  ALTER TABLE "media" ADD COLUMN "_objectkey" varchar;
  ALTER TABLE "source_documents" ADD COLUMN "prefix" varchar DEFAULT 'private';
  ALTER TABLE "source_documents" ADD COLUMN "_objectkey" varchar;
  ALTER TABLE "companies" ADD COLUMN "canonical_key" varchar;
  ALTER TABLE "institutions" ADD COLUMN "canonical_key" varchar;
  ALTER TABLE "education" ADD COLUMN "canonical_key" varchar;
  ALTER TABLE "company_roles" ADD COLUMN "canonical_key" varchar;
  ALTER TABLE "ownership" ADD COLUMN "canonical_key" varchar;
  ALTER TABLE "events" ADD COLUMN "canonical_key" varchar;
  ALTER TABLE "observations" ADD COLUMN "canonical_key" varchar;
  ALTER TABLE "content_jobs" ADD COLUMN "action" "enum_content_jobs_action";
  ALTER TABLE "payload_jobs" ADD COLUMN "concurrency_key" varchar;
  CREATE UNIQUE INDEX "companies_canonical_key_idx" ON "companies" USING btree ("canonical_key");
  CREATE UNIQUE INDEX "people_canonical_key_idx" ON "people" USING btree ("canonical_key");
  CREATE UNIQUE INDEX "institutions_canonical_key_idx" ON "institutions" USING btree ("canonical_key");
  CREATE UNIQUE INDEX "education_canonical_key_idx" ON "education" USING btree ("canonical_key");
  CREATE UNIQUE INDEX "company_roles_canonical_key_idx" ON "company_roles" USING btree ("canonical_key");
  CREATE UNIQUE INDEX "ownership_canonical_key_idx" ON "ownership" USING btree ("canonical_key");
  CREATE UNIQUE INDEX "events_canonical_key_idx" ON "events" USING btree ("canonical_key");
  CREATE UNIQUE INDEX "observations_canonical_key_idx" ON "observations" USING btree ("canonical_key");
  CREATE INDEX "payload_jobs_concurrency_key_idx" ON "payload_jobs" USING btree ("concurrency_key");`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "companies_canonical_key_idx";
  DROP INDEX "people_canonical_key_idx";
  DROP INDEX "institutions_canonical_key_idx";
  DROP INDEX "education_canonical_key_idx";
  DROP INDEX "company_roles_canonical_key_idx";
  DROP INDEX "ownership_canonical_key_idx";
  DROP INDEX "events_canonical_key_idx";
  DROP INDEX "observations_canonical_key_idx";
  DROP INDEX "payload_jobs_concurrency_key_idx";
  ALTER TABLE "media" DROP COLUMN "prefix";
  ALTER TABLE "media" DROP COLUMN "_objectkey";
  ALTER TABLE "source_documents" DROP COLUMN "prefix";
  ALTER TABLE "source_documents" DROP COLUMN "_objectkey";
  ALTER TABLE "companies" DROP COLUMN "canonical_key";
  ALTER TABLE "institutions" DROP COLUMN "canonical_key";
  ALTER TABLE "education" DROP COLUMN "canonical_key";
  ALTER TABLE "company_roles" DROP COLUMN "canonical_key";
  ALTER TABLE "ownership" DROP COLUMN "canonical_key";
  ALTER TABLE "events" DROP COLUMN "canonical_key";
  ALTER TABLE "observations" DROP COLUMN "canonical_key";
  ALTER TABLE "content_jobs" DROP COLUMN "action";
  ALTER TABLE "payload_jobs" DROP COLUMN "concurrency_key";
  DROP TYPE "public"."enum_content_jobs_action";`);
}
