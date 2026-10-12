import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_newsletter_registrations_status" AS ENUM('registered', 'withdrawn');
  CREATE TABLE "newsletter_registrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"status" "enum_newsletter_registrations_status" DEFAULT 'registered' NOT NULL,
  	"email_verified" boolean DEFAULT false,
  	"consented_at" timestamp(3) with time zone NOT NULL,
  	"consent_version" varchar NOT NULL,
  	"source_path" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "newsletter_rate_limits" (
    "bucket" varchar PRIMARY KEY NOT NULL,
    "attempts" integer NOT NULL,
    "expires_at" timestamp(3) with time zone NOT NULL
  );
  CREATE INDEX "newsletter_rate_limits_expiry_idx" ON "newsletter_rate_limits" ("expires_at");
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "newsletter_registrations_id" integer;
  CREATE UNIQUE INDEX "newsletter_registrations_email_idx" ON "newsletter_registrations" USING btree ("email");
  CREATE INDEX "newsletter_registrations_updated_at_idx" ON "newsletter_registrations" USING btree ("updated_at");
  CREATE INDEX "newsletter_registrations_created_at_idx" ON "newsletter_registrations" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletter_registrations_fk" FOREIGN KEY ("newsletter_registrations_id") REFERENCES "public"."newsletter_registrations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_newsletter_registrations_i_idx" ON "payload_locked_documents_rels" USING btree ("newsletter_registrations_id");`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_newsletter_registrations_fk";
  
  DROP INDEX "payload_locked_documents_rels_newsletter_registrations_i_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "newsletter_registrations_id";
  DROP TABLE "newsletter_registrations";
  DROP TABLE "newsletter_rate_limits";
  DROP TYPE "public"."enum_newsletter_registrations_status";`);
}
