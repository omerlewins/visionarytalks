import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'contributor');
  CREATE TYPE "public"."enum_sources_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_stories_chart_metrics_basis" AS ENUM('reported', 'estimated', 'calculated');
  CREATE TYPE "public"."enum_stories_kind" AS ENUM('article', 'ownership', 'leader', 'salary', 'company', 'page');
  CREATE TYPE "public"."enum_stories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__stories_v_version_chart_metrics_basis" AS ENUM('reported', 'estimated', 'calculated');
  CREATE TYPE "public"."enum__stories_v_version_kind" AS ENUM('article', 'ownership', 'leader', 'salary', 'company', 'page');
  CREATE TYPE "public"."enum__stories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_companies_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_people_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_institutions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_education_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_education_precision" AS ENUM('day', 'month', 'year', 'unknown');
  CREATE TYPE "public"."enum_company_roles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_company_roles_role_type" AS ENUM('executive', 'founder', 'board', 'investor', 'partnership');
  CREATE TYPE "public"."enum_ownership_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_ownership_rights" AS ENUM('equity', 'voting', 'unknown');
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_observations_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_observations_basis" AS ENUM('reported', 'estimated', 'calculated');
  CREATE TYPE "public"."enum_taxonomy_kind" AS ENUM('category', 'tag');
  CREATE TYPE "public"."enum_content_inbox_workflow" AS ENUM('leader', 'salary', 'ownership', 'article');
  CREATE TYPE "public"."enum_content_inbox_image_mode" AS ENUM('reuse', 'generate', 'none');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'prepare-content');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'prepare-content');
  CREATE TABLE "users_sessions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "created_at" timestamp(3) with time zone,
    "expires_at" timestamp(3) with time zone NOT NULL
  );

  CREATE TABLE "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "role" "enum_users_role" DEFAULT 'contributor' NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "email" varchar NOT NULL,
    "reset_password_token" varchar,
    "reset_password_expiration" timestamp(3) with time zone,
    "salt" varchar,
    "hash" varchar,
    "reset_password_requested_at" timestamp(3) with time zone,
    "login_attempts" numeric DEFAULT 0,
    "lock_until" timestamp(3) with time zone
  );

  CREATE TABLE "authors" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "path" varchar,
    "bio" varchar,
    "legacy_key" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "sources" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "url" varchar NOT NULL,
    "publisher" varchar NOT NULL,
    "published_at" timestamp(3) with time zone,
    "reviewed_at" timestamp(3) with time zone,
    "evidence" varchar,
    "_status" "enum_sources_status" DEFAULT 'draft',
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "media" (
    "id" serial PRIMARY KEY NOT NULL,
    "alt" varchar NOT NULL,
    "caption" varchar,
    "credit" varchar NOT NULL,
    "original_u_r_l" varchar,
    "checksum" varchar,
    "generated" boolean,
    "provenance" jsonb,
    "approved" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "url" varchar,
    "thumbnail_u_r_l" varchar,
    "filename" varchar,
    "mime_type" varchar,
    "filesize" numeric,
    "width" numeric,
    "height" numeric,
    "focal_x" numeric,
    "focal_y" numeric,
    "sizes_thumbnail_url" varchar,
    "sizes_thumbnail_width" numeric,
    "sizes_thumbnail_height" numeric,
    "sizes_thumbnail_mime_type" varchar,
    "sizes_thumbnail_filesize" numeric,
    "sizes_thumbnail_filename" varchar,
    "sizes_editorial_url" varchar,
    "sizes_editorial_width" numeric,
    "sizes_editorial_height" numeric,
    "sizes_editorial_mime_type" varchar,
    "sizes_editorial_filesize" numeric,
    "sizes_editorial_filename" varchar
  );

  CREATE TABLE "source_documents" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "checksum" varchar,
    "retention_until" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "url" varchar,
    "thumbnail_u_r_l" varchar,
    "filename" varchar,
    "mime_type" varchar,
    "filesize" numeric,
    "width" numeric,
    "height" numeric,
    "focal_x" numeric,
    "focal_y" numeric
  );

  CREATE TABLE "stories_sections" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "heading" varchar,
    "text" varchar,
    "source_ids" jsonb
  );

  CREATE TABLE "stories_facts" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "value" varchar
  );

  CREATE TABLE "stories_timeline" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "date" varchar,
    "text" varchar,
    "source_ids" jsonb
  );

  CREATE TABLE "stories_relations" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "from" varchar,
    "to" varchar,
    "label" varchar,
    "stake" numeric
  );

  CREATE TABLE "stories_chart_metrics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "value" numeric,
    "currency" varchar,
    "unit" varchar,
    "period" varchar,
    "definition" varchar,
    "basis" "enum_stories_chart_metrics_basis",
    "geography" varchar,
    "source_ids" jsonb
  );

  CREATE TABLE "stories_faqs" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" varchar
  );

  CREATE TABLE "stories" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "path" varchar,
    "legacy_key" varchar,
    "legacy_status" varchar,
    "kind" "enum_stories_kind",
    "category" varchar,
    "dek" varchar,
    "author_id" integer,
    "featured_image_id" integer,
    "published_at" timestamp(3) with time zone,
    "modified_at" timestamp(3) with time zone,
    "body" jsonb,
    "short_answer" varchar,
    "seo_title" varchar,
    "seo_description" varchar,
    "seo_canonical" varchar,
    "seo_noindex" boolean,
    "legacy_h_t_m_l" varchar,
    "import_checksum" varchar,
    "source_job_key" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_stories_status" DEFAULT 'draft'
  );

  CREATE TABLE "stories_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "sources_id" integer,
    "companies_id" integer,
    "people_id" integer,
    "taxonomy_id" integer,
    "stories_id" integer
  );

  CREATE TABLE "_stories_v_version_sections" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "heading" varchar,
    "text" varchar,
    "source_ids" jsonb
  );

  CREATE TABLE "_stories_v_version_facts" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "value" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_stories_v_version_timeline" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "date" varchar,
    "text" varchar,
    "source_ids" jsonb,
    "_uuid" varchar
  );

  CREATE TABLE "_stories_v_version_relations" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "from" varchar,
    "to" varchar,
    "label" varchar,
    "stake" numeric,
    "_uuid" varchar
  );

  CREATE TABLE "_stories_v_version_chart_metrics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "value" numeric,
    "currency" varchar,
    "unit" varchar,
    "period" varchar,
    "definition" varchar,
    "basis" "enum__stories_v_version_chart_metrics_basis",
    "geography" varchar,
    "source_ids" jsonb,
    "_uuid" varchar
  );

  CREATE TABLE "_stories_v_version_faqs" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_stories_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_title" varchar,
    "version_path" varchar,
    "version_legacy_key" varchar,
    "version_legacy_status" varchar,
    "version_kind" "enum__stories_v_version_kind",
    "version_category" varchar,
    "version_dek" varchar,
    "version_author_id" integer,
    "version_featured_image_id" integer,
    "version_published_at" timestamp(3) with time zone,
    "version_modified_at" timestamp(3) with time zone,
    "version_body" jsonb,
    "version_short_answer" varchar,
    "version_seo_title" varchar,
    "version_seo_description" varchar,
    "version_seo_canonical" varchar,
    "version_seo_noindex" boolean,
    "version_legacy_h_t_m_l" varchar,
    "version_import_checksum" varchar,
    "version_source_job_key" varchar,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__stories_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE "_stories_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "sources_id" integer,
    "companies_id" integer,
    "people_id" integer,
    "taxonomy_id" integer,
    "stories_id" integer
  );

  CREATE TABLE "companies" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "_status" "enum_companies_status" DEFAULT 'draft',
    "vertical" varchar NOT NULL,
    "legal_entity" varchar,
    "website" varchar,
    "description" varchar,
    "profile_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "companies_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "observations_id" integer,
    "sources_id" integer
  );

  CREATE TABLE "people" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "_status" "enum_people_status" DEFAULT 'draft',
    "canonical_key" varchar,
    "biography" varchar,
    "portrait_id" integer,
    "profile_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "people_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "sources_id" integer
  );

  CREATE TABLE "institutions" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "_status" "enum_institutions_status" DEFAULT 'draft',
    "location" varchar,
    "website" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "institutions_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "sources_id" integer
  );

  CREATE TABLE "education" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "_status" "enum_education_status" DEFAULT 'draft',
    "person_id" integer,
    "institution_id" integer,
    "awarding_institution_id" integer,
    "program" varchar,
    "subject" varchar,
    "start" varchar,
    "end" varchar,
    "graduation" varchar,
    "precision" "enum_education_precision",
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "education_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "sources_id" integer
  );

  CREATE TABLE "company_roles" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "_status" "enum_company_roles_status" DEFAULT 'draft',
    "person_id" integer,
    "company_id" integer,
    "role_type" "enum_company_roles_role_type",
    "start" varchar,
    "end" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "company_roles_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "sources_id" integer
  );

  CREATE TABLE "ownership" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "_status" "enum_ownership_status" DEFAULT 'draft',
    "parent_id" integer,
    "child_id" integer,
    "stake" numeric,
    "rights" "enum_ownership_rights",
    "effective_at" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "ownership_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "sources_id" integer
  );

  CREATE TABLE "events" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "_status" "enum_events_status" DEFAULT 'draft',
    "company_id" integer,
    "event_type" varchar,
    "effective_at" varchar,
    "amount" numeric,
    "currency" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "events_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "sources_id" integer
  );

  CREATE TABLE "observations" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "_status" "enum_observations_status" DEFAULT 'draft',
    "label" varchar NOT NULL,
    "value" numeric,
    "currency" varchar,
    "unit" varchar NOT NULL,
    "period" varchar NOT NULL,
    "definition" varchar NOT NULL,
    "basis" "enum_observations_basis" NOT NULL,
    "geography" varchar,
    "source_ids" jsonb NOT NULL,
    "display" varchar,
    "company_id" integer,
    "person_id" integer,
    "occupation" varchar,
    "seniority" varchar,
    "statistic" varchar,
    "sample_size" numeric,
    "methodology" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "observations_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "sources_id" integer
  );

  CREATE TABLE "taxonomy" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "path" varchar NOT NULL,
    "legacy_key" varchar,
    "kind" "enum_taxonomy_kind",
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "redirects" (
    "id" serial PRIMARY KEY NOT NULL,
    "from" varchar NOT NULL,
    "to" varchar NOT NULL,
    "reason" varchar NOT NULL,
    "approved" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "content_inbox_urls" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "url" varchar NOT NULL
  );

  CREATE TABLE "content_inbox" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "workflow" "enum_content_inbox_workflow" NOT NULL,
    "text" varchar,
    "image_mode" "enum_content_inbox_image_mode" DEFAULT 'reuse',
    "allow_research" boolean DEFAULT false,
    "target_id" integer,
    "target_version" varchar,
    "proposed_path" varchar NOT NULL,
    "author_id" integer,
    "prepare" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "content_inbox_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "source_documents_id" integer,
    "media_id" integer
  );

  CREATE TABLE "content_jobs" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "key" varchar,
    "state" varchar,
    "data" jsonb,
    "error" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "claim_evidence" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "key" varchar,
    "state" varchar,
    "data" jsonb,
    "error" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "generated_assets" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "key" varchar,
    "state" varchar,
    "data" jsonb,
    "error" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "review_decisions" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "key" varchar,
    "state" varchar,
    "data" jsonb,
    "error" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "prompt_templates" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "key" varchar,
    "state" varchar,
    "data" jsonb,
    "error" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "migration_records" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "key" varchar,
    "state" varchar,
    "data" jsonb,
    "error" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_kv" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar NOT NULL,
    "data" jsonb NOT NULL
  );

  CREATE TABLE "payload_jobs_log" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "executed_at" timestamp(3) with time zone NOT NULL,
    "completed_at" timestamp(3) with time zone NOT NULL,
    "task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
    "task_i_d" varchar NOT NULL,
    "input" jsonb,
    "output" jsonb,
    "state" "enum_payload_jobs_log_state" NOT NULL,
    "error" jsonb
  );

  CREATE TABLE "payload_jobs" (
    "id" serial PRIMARY KEY NOT NULL,
    "input" jsonb,
    "completed_at" timestamp(3) with time zone,
    "total_tried" numeric DEFAULT 0,
    "has_error" boolean DEFAULT false,
    "error" jsonb,
    "task_slug" "enum_payload_jobs_task_slug",
    "queue" varchar DEFAULT 'default',
    "wait_until" timestamp(3) with time zone,
    "processing" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_locked_documents" (
    "id" serial PRIMARY KEY NOT NULL,
    "global_slug" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_locked_documents_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "users_id" integer,
    "authors_id" integer,
    "sources_id" integer,
    "media_id" integer,
    "source_documents_id" integer,
    "stories_id" integer,
    "companies_id" integer,
    "people_id" integer,
    "institutions_id" integer,
    "education_id" integer,
    "company_roles_id" integer,
    "ownership_id" integer,
    "events_id" integer,
    "observations_id" integer,
    "taxonomy_id" integer,
    "redirects_id" integer,
    "content_inbox_id" integer,
    "content_jobs_id" integer,
    "claim_evidence_id" integer,
    "generated_assets_id" integer,
    "review_decisions_id" integer,
    "prompt_templates_id" integer,
    "migration_records_id" integer
  );

  CREATE TABLE "payload_preferences" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar,
    "value" jsonb,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_preferences_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "users_id" integer
  );

  CREATE TABLE "payload_migrations" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "batch" numeric,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "site_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "hero_title" varchar DEFAULT 'The stories behind the world we live in.',
    "hero_description" varchar,
    "newsletter_u_r_l" varchar,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  CREATE TABLE "site_settings_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "stories_id" integer
  );

  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_sections" ADD CONSTRAINT "stories_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_facts" ADD CONSTRAINT "stories_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_timeline" ADD CONSTRAINT "stories_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_relations" ADD CONSTRAINT "stories_relations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_chart_metrics" ADD CONSTRAINT "stories_chart_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_faqs" ADD CONSTRAINT "stories_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories" ADD CONSTRAINT "stories_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "stories" ADD CONSTRAINT "stories_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "stories_rels" ADD CONSTRAINT "stories_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_rels" ADD CONSTRAINT "stories_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_rels" ADD CONSTRAINT "stories_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_rels" ADD CONSTRAINT "stories_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_rels" ADD CONSTRAINT "stories_rels_taxonomy_fk" FOREIGN KEY ("taxonomy_id") REFERENCES "public"."taxonomy"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_rels" ADD CONSTRAINT "stories_rels_stories_fk" FOREIGN KEY ("stories_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stories_v_version_sections" ADD CONSTRAINT "_stories_v_version_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_stories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stories_v_version_facts" ADD CONSTRAINT "_stories_v_version_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_stories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stories_v_version_timeline" ADD CONSTRAINT "_stories_v_version_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_stories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stories_v_version_relations" ADD CONSTRAINT "_stories_v_version_relations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_stories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stories_v_version_chart_metrics" ADD CONSTRAINT "_stories_v_version_chart_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_stories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stories_v_version_faqs" ADD CONSTRAINT "_stories_v_version_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_stories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stories_v" ADD CONSTRAINT "_stories_v_parent_id_stories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."stories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_stories_v" ADD CONSTRAINT "_stories_v_version_author_id_authors_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_stories_v" ADD CONSTRAINT "_stories_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_stories_v_rels" ADD CONSTRAINT "_stories_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_stories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stories_v_rels" ADD CONSTRAINT "_stories_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stories_v_rels" ADD CONSTRAINT "_stories_v_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stories_v_rels" ADD CONSTRAINT "_stories_v_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stories_v_rels" ADD CONSTRAINT "_stories_v_rels_taxonomy_fk" FOREIGN KEY ("taxonomy_id") REFERENCES "public"."taxonomy"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stories_v_rels" ADD CONSTRAINT "_stories_v_rels_stories_fk" FOREIGN KEY ("stories_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "companies" ADD CONSTRAINT "companies_profile_id_stories_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."stories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "companies_rels" ADD CONSTRAINT "companies_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "companies_rels" ADD CONSTRAINT "companies_rels_observations_fk" FOREIGN KEY ("observations_id") REFERENCES "public"."observations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "companies_rels" ADD CONSTRAINT "companies_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_profile_id_stories_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."stories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people_rels" ADD CONSTRAINT "people_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people_rels" ADD CONSTRAINT "people_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "institutions_rels" ADD CONSTRAINT "institutions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "institutions_rels" ADD CONSTRAINT "institutions_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "education" ADD CONSTRAINT "education_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "education" ADD CONSTRAINT "education_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "education" ADD CONSTRAINT "education_awarding_institution_id_institutions_id_fk" FOREIGN KEY ("awarding_institution_id") REFERENCES "public"."institutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "education_rels" ADD CONSTRAINT "education_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."education"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "education_rels" ADD CONSTRAINT "education_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_roles" ADD CONSTRAINT "company_roles_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "company_roles" ADD CONSTRAINT "company_roles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "company_roles_rels" ADD CONSTRAINT "company_roles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."company_roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_roles_rels" ADD CONSTRAINT "company_roles_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ownership" ADD CONSTRAINT "ownership_parent_id_companies_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ownership" ADD CONSTRAINT "ownership_child_id_companies_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ownership_rels" ADD CONSTRAINT "ownership_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."ownership"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ownership_rels" ADD CONSTRAINT "ownership_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "observations" ADD CONSTRAINT "observations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "observations" ADD CONSTRAINT "observations_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "observations_rels" ADD CONSTRAINT "observations_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."observations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "observations_rels" ADD CONSTRAINT "observations_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_inbox_urls" ADD CONSTRAINT "content_inbox_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_inbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_inbox" ADD CONSTRAINT "content_inbox_target_id_stories_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."stories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_inbox" ADD CONSTRAINT "content_inbox_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_inbox_rels" ADD CONSTRAINT "content_inbox_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."content_inbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_inbox_rels" ADD CONSTRAINT "content_inbox_rels_source_documents_fk" FOREIGN KEY ("source_documents_id") REFERENCES "public"."source_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_inbox_rels" ADD CONSTRAINT "content_inbox_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_source_documents_fk" FOREIGN KEY ("source_documents_id") REFERENCES "public"."source_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_stories_fk" FOREIGN KEY ("stories_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_institutions_fk" FOREIGN KEY ("institutions_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_education_fk" FOREIGN KEY ("education_id") REFERENCES "public"."education"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_company_roles_fk" FOREIGN KEY ("company_roles_id") REFERENCES "public"."company_roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ownership_fk" FOREIGN KEY ("ownership_id") REFERENCES "public"."ownership"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_observations_fk" FOREIGN KEY ("observations_id") REFERENCES "public"."observations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_taxonomy_fk" FOREIGN KEY ("taxonomy_id") REFERENCES "public"."taxonomy"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_content_inbox_fk" FOREIGN KEY ("content_inbox_id") REFERENCES "public"."content_inbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_content_jobs_fk" FOREIGN KEY ("content_jobs_id") REFERENCES "public"."content_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_claim_evidence_fk" FOREIGN KEY ("claim_evidence_id") REFERENCES "public"."claim_evidence"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_generated_assets_fk" FOREIGN KEY ("generated_assets_id") REFERENCES "public"."generated_assets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_review_decisions_fk" FOREIGN KEY ("review_decisions_id") REFERENCES "public"."review_decisions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_prompt_templates_fk" FOREIGN KEY ("prompt_templates_id") REFERENCES "public"."prompt_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_migration_records_fk" FOREIGN KEY ("migration_records_id") REFERENCES "public"."migration_records"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_stories_fk" FOREIGN KEY ("stories_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "authors_updated_at_idx" ON "authors" USING btree ("updated_at");
  CREATE INDEX "authors_created_at_idx" ON "authors" USING btree ("created_at");
  CREATE INDEX "sources__status_idx" ON "sources" USING btree ("_status");
  CREATE INDEX "sources_updated_at_idx" ON "sources" USING btree ("updated_at");
  CREATE INDEX "sources_created_at_idx" ON "sources" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_editorial_sizes_editorial_filename_idx" ON "media" USING btree ("sizes_editorial_filename");
  CREATE INDEX "source_documents_updated_at_idx" ON "source_documents" USING btree ("updated_at");
  CREATE INDEX "source_documents_created_at_idx" ON "source_documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "source_documents_filename_idx" ON "source_documents" USING btree ("filename");
  CREATE INDEX "stories_sections_order_idx" ON "stories_sections" USING btree ("_order");
  CREATE INDEX "stories_sections_parent_id_idx" ON "stories_sections" USING btree ("_parent_id");
  CREATE INDEX "stories_facts_order_idx" ON "stories_facts" USING btree ("_order");
  CREATE INDEX "stories_facts_parent_id_idx" ON "stories_facts" USING btree ("_parent_id");
  CREATE INDEX "stories_timeline_order_idx" ON "stories_timeline" USING btree ("_order");
  CREATE INDEX "stories_timeline_parent_id_idx" ON "stories_timeline" USING btree ("_parent_id");
  CREATE INDEX "stories_relations_order_idx" ON "stories_relations" USING btree ("_order");
  CREATE INDEX "stories_relations_parent_id_idx" ON "stories_relations" USING btree ("_parent_id");
  CREATE INDEX "stories_chart_metrics_order_idx" ON "stories_chart_metrics" USING btree ("_order");
  CREATE INDEX "stories_chart_metrics_parent_id_idx" ON "stories_chart_metrics" USING btree ("_parent_id");
  CREATE INDEX "stories_faqs_order_idx" ON "stories_faqs" USING btree ("_order");
  CREATE INDEX "stories_faqs_parent_id_idx" ON "stories_faqs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "stories_path_idx" ON "stories" USING btree ("path");
  CREATE UNIQUE INDEX "stories_legacy_key_idx" ON "stories" USING btree ("legacy_key");
  CREATE INDEX "stories_author_idx" ON "stories" USING btree ("author_id");
  CREATE INDEX "stories_featured_image_idx" ON "stories" USING btree ("featured_image_id");
  CREATE UNIQUE INDEX "stories_source_job_key_idx" ON "stories" USING btree ("source_job_key");
  CREATE INDEX "stories_updated_at_idx" ON "stories" USING btree ("updated_at");
  CREATE INDEX "stories_created_at_idx" ON "stories" USING btree ("created_at");
  CREATE INDEX "stories__status_idx" ON "stories" USING btree ("_status");
  CREATE INDEX "stories_rels_order_idx" ON "stories_rels" USING btree ("order");
  CREATE INDEX "stories_rels_parent_idx" ON "stories_rels" USING btree ("parent_id");
  CREATE INDEX "stories_rels_path_idx" ON "stories_rels" USING btree ("path");
  CREATE INDEX "stories_rels_sources_id_idx" ON "stories_rels" USING btree ("sources_id");
  CREATE INDEX "stories_rels_companies_id_idx" ON "stories_rels" USING btree ("companies_id");
  CREATE INDEX "stories_rels_people_id_idx" ON "stories_rels" USING btree ("people_id");
  CREATE INDEX "stories_rels_taxonomy_id_idx" ON "stories_rels" USING btree ("taxonomy_id");
  CREATE INDEX "stories_rels_stories_id_idx" ON "stories_rels" USING btree ("stories_id");
  CREATE INDEX "_stories_v_version_sections_order_idx" ON "_stories_v_version_sections" USING btree ("_order");
  CREATE INDEX "_stories_v_version_sections_parent_id_idx" ON "_stories_v_version_sections" USING btree ("_parent_id");
  CREATE INDEX "_stories_v_version_facts_order_idx" ON "_stories_v_version_facts" USING btree ("_order");
  CREATE INDEX "_stories_v_version_facts_parent_id_idx" ON "_stories_v_version_facts" USING btree ("_parent_id");
  CREATE INDEX "_stories_v_version_timeline_order_idx" ON "_stories_v_version_timeline" USING btree ("_order");
  CREATE INDEX "_stories_v_version_timeline_parent_id_idx" ON "_stories_v_version_timeline" USING btree ("_parent_id");
  CREATE INDEX "_stories_v_version_relations_order_idx" ON "_stories_v_version_relations" USING btree ("_order");
  CREATE INDEX "_stories_v_version_relations_parent_id_idx" ON "_stories_v_version_relations" USING btree ("_parent_id");
  CREATE INDEX "_stories_v_version_chart_metrics_order_idx" ON "_stories_v_version_chart_metrics" USING btree ("_order");
  CREATE INDEX "_stories_v_version_chart_metrics_parent_id_idx" ON "_stories_v_version_chart_metrics" USING btree ("_parent_id");
  CREATE INDEX "_stories_v_version_faqs_order_idx" ON "_stories_v_version_faqs" USING btree ("_order");
  CREATE INDEX "_stories_v_version_faqs_parent_id_idx" ON "_stories_v_version_faqs" USING btree ("_parent_id");
  CREATE INDEX "_stories_v_parent_idx" ON "_stories_v" USING btree ("parent_id");
  CREATE INDEX "_stories_v_version_version_path_idx" ON "_stories_v" USING btree ("version_path");
  CREATE INDEX "_stories_v_version_version_legacy_key_idx" ON "_stories_v" USING btree ("version_legacy_key");
  CREATE INDEX "_stories_v_version_version_author_idx" ON "_stories_v" USING btree ("version_author_id");
  CREATE INDEX "_stories_v_version_version_featured_image_idx" ON "_stories_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_stories_v_version_version_source_job_key_idx" ON "_stories_v" USING btree ("version_source_job_key");
  CREATE INDEX "_stories_v_version_version_updated_at_idx" ON "_stories_v" USING btree ("version_updated_at");
  CREATE INDEX "_stories_v_version_version_created_at_idx" ON "_stories_v" USING btree ("version_created_at");
  CREATE INDEX "_stories_v_version_version__status_idx" ON "_stories_v" USING btree ("version__status");
  CREATE INDEX "_stories_v_created_at_idx" ON "_stories_v" USING btree ("created_at");
  CREATE INDEX "_stories_v_updated_at_idx" ON "_stories_v" USING btree ("updated_at");
  CREATE INDEX "_stories_v_latest_idx" ON "_stories_v" USING btree ("latest");
  CREATE INDEX "_stories_v_autosave_idx" ON "_stories_v" USING btree ("autosave");
  CREATE INDEX "_stories_v_rels_order_idx" ON "_stories_v_rels" USING btree ("order");
  CREATE INDEX "_stories_v_rels_parent_idx" ON "_stories_v_rels" USING btree ("parent_id");
  CREATE INDEX "_stories_v_rels_path_idx" ON "_stories_v_rels" USING btree ("path");
  CREATE INDEX "_stories_v_rels_sources_id_idx" ON "_stories_v_rels" USING btree ("sources_id");
  CREATE INDEX "_stories_v_rels_companies_id_idx" ON "_stories_v_rels" USING btree ("companies_id");
  CREATE INDEX "_stories_v_rels_people_id_idx" ON "_stories_v_rels" USING btree ("people_id");
  CREATE INDEX "_stories_v_rels_taxonomy_id_idx" ON "_stories_v_rels" USING btree ("taxonomy_id");
  CREATE INDEX "_stories_v_rels_stories_id_idx" ON "_stories_v_rels" USING btree ("stories_id");
  CREATE INDEX "companies__status_idx" ON "companies" USING btree ("_status");
  CREATE INDEX "companies_profile_idx" ON "companies" USING btree ("profile_id");
  CREATE INDEX "companies_updated_at_idx" ON "companies" USING btree ("updated_at");
  CREATE INDEX "companies_created_at_idx" ON "companies" USING btree ("created_at");
  CREATE INDEX "companies_rels_order_idx" ON "companies_rels" USING btree ("order");
  CREATE INDEX "companies_rels_parent_idx" ON "companies_rels" USING btree ("parent_id");
  CREATE INDEX "companies_rels_path_idx" ON "companies_rels" USING btree ("path");
  CREATE INDEX "companies_rels_observations_id_idx" ON "companies_rels" USING btree ("observations_id");
  CREATE INDEX "companies_rels_sources_id_idx" ON "companies_rels" USING btree ("sources_id");
  CREATE INDEX "people__status_idx" ON "people" USING btree ("_status");
  CREATE INDEX "people_portrait_idx" ON "people" USING btree ("portrait_id");
  CREATE INDEX "people_profile_idx" ON "people" USING btree ("profile_id");
  CREATE INDEX "people_updated_at_idx" ON "people" USING btree ("updated_at");
  CREATE INDEX "people_created_at_idx" ON "people" USING btree ("created_at");
  CREATE INDEX "people_rels_order_idx" ON "people_rels" USING btree ("order");
  CREATE INDEX "people_rels_parent_idx" ON "people_rels" USING btree ("parent_id");
  CREATE INDEX "people_rels_path_idx" ON "people_rels" USING btree ("path");
  CREATE INDEX "people_rels_sources_id_idx" ON "people_rels" USING btree ("sources_id");
  CREATE INDEX "institutions__status_idx" ON "institutions" USING btree ("_status");
  CREATE INDEX "institutions_updated_at_idx" ON "institutions" USING btree ("updated_at");
  CREATE INDEX "institutions_created_at_idx" ON "institutions" USING btree ("created_at");
  CREATE INDEX "institutions_rels_order_idx" ON "institutions_rels" USING btree ("order");
  CREATE INDEX "institutions_rels_parent_idx" ON "institutions_rels" USING btree ("parent_id");
  CREATE INDEX "institutions_rels_path_idx" ON "institutions_rels" USING btree ("path");
  CREATE INDEX "institutions_rels_sources_id_idx" ON "institutions_rels" USING btree ("sources_id");
  CREATE INDEX "education__status_idx" ON "education" USING btree ("_status");
  CREATE INDEX "education_person_idx" ON "education" USING btree ("person_id");
  CREATE INDEX "education_institution_idx" ON "education" USING btree ("institution_id");
  CREATE INDEX "education_awarding_institution_idx" ON "education" USING btree ("awarding_institution_id");
  CREATE INDEX "education_updated_at_idx" ON "education" USING btree ("updated_at");
  CREATE INDEX "education_created_at_idx" ON "education" USING btree ("created_at");
  CREATE INDEX "education_rels_order_idx" ON "education_rels" USING btree ("order");
  CREATE INDEX "education_rels_parent_idx" ON "education_rels" USING btree ("parent_id");
  CREATE INDEX "education_rels_path_idx" ON "education_rels" USING btree ("path");
  CREATE INDEX "education_rels_sources_id_idx" ON "education_rels" USING btree ("sources_id");
  CREATE INDEX "company_roles__status_idx" ON "company_roles" USING btree ("_status");
  CREATE INDEX "company_roles_person_idx" ON "company_roles" USING btree ("person_id");
  CREATE INDEX "company_roles_company_idx" ON "company_roles" USING btree ("company_id");
  CREATE INDEX "company_roles_updated_at_idx" ON "company_roles" USING btree ("updated_at");
  CREATE INDEX "company_roles_created_at_idx" ON "company_roles" USING btree ("created_at");
  CREATE INDEX "company_roles_rels_order_idx" ON "company_roles_rels" USING btree ("order");
  CREATE INDEX "company_roles_rels_parent_idx" ON "company_roles_rels" USING btree ("parent_id");
  CREATE INDEX "company_roles_rels_path_idx" ON "company_roles_rels" USING btree ("path");
  CREATE INDEX "company_roles_rels_sources_id_idx" ON "company_roles_rels" USING btree ("sources_id");
  CREATE INDEX "ownership__status_idx" ON "ownership" USING btree ("_status");
  CREATE INDEX "ownership_parent_idx" ON "ownership" USING btree ("parent_id");
  CREATE INDEX "ownership_child_idx" ON "ownership" USING btree ("child_id");
  CREATE INDEX "ownership_updated_at_idx" ON "ownership" USING btree ("updated_at");
  CREATE INDEX "ownership_created_at_idx" ON "ownership" USING btree ("created_at");
  CREATE INDEX "ownership_rels_order_idx" ON "ownership_rels" USING btree ("order");
  CREATE INDEX "ownership_rels_parent_idx" ON "ownership_rels" USING btree ("parent_id");
  CREATE INDEX "ownership_rels_path_idx" ON "ownership_rels" USING btree ("path");
  CREATE INDEX "ownership_rels_sources_id_idx" ON "ownership_rels" USING btree ("sources_id");
  CREATE INDEX "events__status_idx" ON "events" USING btree ("_status");
  CREATE INDEX "events_company_idx" ON "events" USING btree ("company_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events_rels_order_idx" ON "events_rels" USING btree ("order");
  CREATE INDEX "events_rels_parent_idx" ON "events_rels" USING btree ("parent_id");
  CREATE INDEX "events_rels_path_idx" ON "events_rels" USING btree ("path");
  CREATE INDEX "events_rels_sources_id_idx" ON "events_rels" USING btree ("sources_id");
  CREATE INDEX "observations__status_idx" ON "observations" USING btree ("_status");
  CREATE INDEX "observations_company_idx" ON "observations" USING btree ("company_id");
  CREATE INDEX "observations_person_idx" ON "observations" USING btree ("person_id");
  CREATE INDEX "observations_updated_at_idx" ON "observations" USING btree ("updated_at");
  CREATE INDEX "observations_created_at_idx" ON "observations" USING btree ("created_at");
  CREATE INDEX "observations_rels_order_idx" ON "observations_rels" USING btree ("order");
  CREATE INDEX "observations_rels_parent_idx" ON "observations_rels" USING btree ("parent_id");
  CREATE INDEX "observations_rels_path_idx" ON "observations_rels" USING btree ("path");
  CREATE INDEX "observations_rels_sources_id_idx" ON "observations_rels" USING btree ("sources_id");
  CREATE INDEX "taxonomy_updated_at_idx" ON "taxonomy" USING btree ("updated_at");
  CREATE INDEX "taxonomy_created_at_idx" ON "taxonomy" USING btree ("created_at");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "content_inbox_urls_order_idx" ON "content_inbox_urls" USING btree ("_order");
  CREATE INDEX "content_inbox_urls_parent_id_idx" ON "content_inbox_urls" USING btree ("_parent_id");
  CREATE INDEX "content_inbox_target_idx" ON "content_inbox" USING btree ("target_id");
  CREATE INDEX "content_inbox_author_idx" ON "content_inbox" USING btree ("author_id");
  CREATE INDEX "content_inbox_updated_at_idx" ON "content_inbox" USING btree ("updated_at");
  CREATE INDEX "content_inbox_created_at_idx" ON "content_inbox" USING btree ("created_at");
  CREATE INDEX "content_inbox_rels_order_idx" ON "content_inbox_rels" USING btree ("order");
  CREATE INDEX "content_inbox_rels_parent_idx" ON "content_inbox_rels" USING btree ("parent_id");
  CREATE INDEX "content_inbox_rels_path_idx" ON "content_inbox_rels" USING btree ("path");
  CREATE INDEX "content_inbox_rels_source_documents_id_idx" ON "content_inbox_rels" USING btree ("source_documents_id");
  CREATE INDEX "content_inbox_rels_media_id_idx" ON "content_inbox_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "content_jobs_key_idx" ON "content_jobs" USING btree ("key");
  CREATE INDEX "content_jobs_updated_at_idx" ON "content_jobs" USING btree ("updated_at");
  CREATE INDEX "content_jobs_created_at_idx" ON "content_jobs" USING btree ("created_at");
  CREATE UNIQUE INDEX "claim_evidence_key_idx" ON "claim_evidence" USING btree ("key");
  CREATE INDEX "claim_evidence_updated_at_idx" ON "claim_evidence" USING btree ("updated_at");
  CREATE INDEX "claim_evidence_created_at_idx" ON "claim_evidence" USING btree ("created_at");
  CREATE UNIQUE INDEX "generated_assets_key_idx" ON "generated_assets" USING btree ("key");
  CREATE INDEX "generated_assets_updated_at_idx" ON "generated_assets" USING btree ("updated_at");
  CREATE INDEX "generated_assets_created_at_idx" ON "generated_assets" USING btree ("created_at");
  CREATE UNIQUE INDEX "review_decisions_key_idx" ON "review_decisions" USING btree ("key");
  CREATE INDEX "review_decisions_updated_at_idx" ON "review_decisions" USING btree ("updated_at");
  CREATE INDEX "review_decisions_created_at_idx" ON "review_decisions" USING btree ("created_at");
  CREATE UNIQUE INDEX "prompt_templates_key_idx" ON "prompt_templates" USING btree ("key");
  CREATE INDEX "prompt_templates_updated_at_idx" ON "prompt_templates" USING btree ("updated_at");
  CREATE INDEX "prompt_templates_created_at_idx" ON "prompt_templates" USING btree ("created_at");
  CREATE UNIQUE INDEX "migration_records_key_idx" ON "migration_records" USING btree ("key");
  CREATE INDEX "migration_records_updated_at_idx" ON "migration_records" USING btree ("updated_at");
  CREATE INDEX "migration_records_created_at_idx" ON "migration_records" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_authors_id_idx" ON "payload_locked_documents_rels" USING btree ("authors_id");
  CREATE INDEX "payload_locked_documents_rels_sources_id_idx" ON "payload_locked_documents_rels" USING btree ("sources_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_source_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("source_documents_id");
  CREATE INDEX "payload_locked_documents_rels_stories_id_idx" ON "payload_locked_documents_rels" USING btree ("stories_id");
  CREATE INDEX "payload_locked_documents_rels_companies_id_idx" ON "payload_locked_documents_rels" USING btree ("companies_id");
  CREATE INDEX "payload_locked_documents_rels_people_id_idx" ON "payload_locked_documents_rels" USING btree ("people_id");
  CREATE INDEX "payload_locked_documents_rels_institutions_id_idx" ON "payload_locked_documents_rels" USING btree ("institutions_id");
  CREATE INDEX "payload_locked_documents_rels_education_id_idx" ON "payload_locked_documents_rels" USING btree ("education_id");
  CREATE INDEX "payload_locked_documents_rels_company_roles_id_idx" ON "payload_locked_documents_rels" USING btree ("company_roles_id");
  CREATE INDEX "payload_locked_documents_rels_ownership_id_idx" ON "payload_locked_documents_rels" USING btree ("ownership_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_observations_id_idx" ON "payload_locked_documents_rels" USING btree ("observations_id");
  CREATE INDEX "payload_locked_documents_rels_taxonomy_id_idx" ON "payload_locked_documents_rels" USING btree ("taxonomy_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_content_inbox_id_idx" ON "payload_locked_documents_rels" USING btree ("content_inbox_id");
  CREATE INDEX "payload_locked_documents_rels_content_jobs_id_idx" ON "payload_locked_documents_rels" USING btree ("content_jobs_id");
  CREATE INDEX "payload_locked_documents_rels_claim_evidence_id_idx" ON "payload_locked_documents_rels" USING btree ("claim_evidence_id");
  CREATE INDEX "payload_locked_documents_rels_generated_assets_id_idx" ON "payload_locked_documents_rels" USING btree ("generated_assets_id");
  CREATE INDEX "payload_locked_documents_rels_review_decisions_id_idx" ON "payload_locked_documents_rels" USING btree ("review_decisions_id");
  CREATE INDEX "payload_locked_documents_rels_prompt_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("prompt_templates_id");
  CREATE INDEX "payload_locked_documents_rels_migration_records_id_idx" ON "payload_locked_documents_rels" USING btree ("migration_records_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_rels_order_idx" ON "site_settings_rels" USING btree ("order");
  CREATE INDEX "site_settings_rels_parent_idx" ON "site_settings_rels" USING btree ("parent_id");
  CREATE INDEX "site_settings_rels_path_idx" ON "site_settings_rels" USING btree ("path");
  CREATE INDEX "site_settings_rels_stories_id_idx" ON "site_settings_rels" USING btree ("stories_id");`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "authors" CASCADE;
  DROP TABLE "sources" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "source_documents" CASCADE;
  DROP TABLE "stories_sections" CASCADE;
  DROP TABLE "stories_facts" CASCADE;
  DROP TABLE "stories_timeline" CASCADE;
  DROP TABLE "stories_relations" CASCADE;
  DROP TABLE "stories_chart_metrics" CASCADE;
  DROP TABLE "stories_faqs" CASCADE;
  DROP TABLE "stories" CASCADE;
  DROP TABLE "stories_rels" CASCADE;
  DROP TABLE "_stories_v_version_sections" CASCADE;
  DROP TABLE "_stories_v_version_facts" CASCADE;
  DROP TABLE "_stories_v_version_timeline" CASCADE;
  DROP TABLE "_stories_v_version_relations" CASCADE;
  DROP TABLE "_stories_v_version_chart_metrics" CASCADE;
  DROP TABLE "_stories_v_version_faqs" CASCADE;
  DROP TABLE "_stories_v" CASCADE;
  DROP TABLE "_stories_v_rels" CASCADE;
  DROP TABLE "companies" CASCADE;
  DROP TABLE "companies_rels" CASCADE;
  DROP TABLE "people" CASCADE;
  DROP TABLE "people_rels" CASCADE;
  DROP TABLE "institutions" CASCADE;
  DROP TABLE "institutions_rels" CASCADE;
  DROP TABLE "education" CASCADE;
  DROP TABLE "education_rels" CASCADE;
  DROP TABLE "company_roles" CASCADE;
  DROP TABLE "company_roles_rels" CASCADE;
  DROP TABLE "ownership" CASCADE;
  DROP TABLE "ownership_rels" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_rels" CASCADE;
  DROP TABLE "observations" CASCADE;
  DROP TABLE "observations_rels" CASCADE;
  DROP TABLE "taxonomy" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "content_inbox_urls" CASCADE;
  DROP TABLE "content_inbox" CASCADE;
  DROP TABLE "content_inbox_rels" CASCADE;
  DROP TABLE "content_jobs" CASCADE;
  DROP TABLE "claim_evidence" CASCADE;
  DROP TABLE "generated_assets" CASCADE;
  DROP TABLE "review_decisions" CASCADE;
  DROP TABLE "prompt_templates" CASCADE;
  DROP TABLE "migration_records" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_rels" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_sources_status";
  DROP TYPE "public"."enum_stories_chart_metrics_basis";
  DROP TYPE "public"."enum_stories_kind";
  DROP TYPE "public"."enum_stories_status";
  DROP TYPE "public"."enum__stories_v_version_chart_metrics_basis";
  DROP TYPE "public"."enum__stories_v_version_kind";
  DROP TYPE "public"."enum__stories_v_version_status";
  DROP TYPE "public"."enum_companies_status";
  DROP TYPE "public"."enum_people_status";
  DROP TYPE "public"."enum_institutions_status";
  DROP TYPE "public"."enum_education_status";
  DROP TYPE "public"."enum_education_precision";
  DROP TYPE "public"."enum_company_roles_status";
  DROP TYPE "public"."enum_company_roles_role_type";
  DROP TYPE "public"."enum_ownership_status";
  DROP TYPE "public"."enum_ownership_rights";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum_observations_status";
  DROP TYPE "public"."enum_observations_basis";
  DROP TYPE "public"."enum_taxonomy_kind";
  DROP TYPE "public"."enum_content_inbox_workflow";
  DROP TYPE "public"."enum_content_inbox_image_mode";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`);
}
