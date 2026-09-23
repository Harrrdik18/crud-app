CREATE TYPE "public"."application_source" AS ENUM('linkedin', 'indeed', 'company_website', 'referral', 'recruiter', 'job_board', 'networking', 'other');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."employment_type" AS ENUM('full_time', 'part_time', 'contract', 'freelance', 'internship', 'temporary', 'other');--> statement-breakpoint
CREATE TYPE "public"."follow_up_status" AS ENUM('pending', 'done', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."interview_result" AS ENUM('unknown', 'passed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."interview_type" AS ENUM('phone', 'video', 'onsite', 'technical', 'behavioral', 'panel', 'take_home', 'other');--> statement-breakpoint
CREATE TYPE "public"."salary_interval" AS ENUM('year', 'hour', 'month', 'one_time');--> statement-breakpoint
CREATE TYPE "public"."skill_kind" AS ENUM('technology', 'language', 'domain', 'soft', 'tool');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company" text NOT NULL,
	"title" text NOT NULL,
	"url" text,
	"location" text,
	"employment_type" "employment_type",
	"salary_min" integer,
	"salary_max" integer,
	"salary_currency" text,
	"salary_interval" "salary_interval",
	"experience" text,
	"description" text,
	"status" "application_status" DEFAULT 'applied' NOT NULL,
	"applied_at" date DEFAULT CURRENT_DATE NOT NULL,
	"source" "application_source",
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follow_ups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"application_id" uuid,
	"title" text NOT NULL,
	"due_at" date DEFAULT CURRENT_DATE NOT NULL,
	"status" "follow_up_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "interview_type" DEFAULT 'video' NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer,
	"interviewer" text,
	"location" text,
	"notes" text,
	"result" "interview_result" DEFAULT 'unknown' NOT NULL,
	"feedback" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"application_id" uuid,
	"source_text_hash" text NOT NULL,
	"title" text,
	"company" text,
	"data" jsonb NOT NULL,
	"method" text DEFAULT 'heuristic' NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"application_id" uuid,
	"analysis_id" uuid,
	"job_title" text,
	"company" text,
	"overall_score" integer NOT NULL,
	"matching_skills" jsonb NOT NULL,
	"gap_skills" jsonb NOT NULL,
	"depth_assessment" integer,
	"area_assessments" jsonb NOT NULL,
	"experience_met" jsonb,
	"method" text DEFAULT 'heuristic' NOT NULL,
	"disclaimer" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"headline" text,
	"location" text,
	"bio" text,
	"github_url" text,
	"linkedin_url" text,
	"website_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "resumes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text DEFAULT 'My Resume' NOT NULL,
	"summary" text,
	"years_experience" integer,
	"target_role" text,
	"target_location" text,
	"experiences" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"education" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"projects" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resumes_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"resume_id" uuid,
	"name" text NOT NULL,
	"kind" "skill_kind" DEFAULT 'technology' NOT NULL,
	"level" text
);
--> statement-breakpoint
CREATE TABLE "status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"from_status" "application_status",
	"to_status" "application_status" NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_analyses" ADD CONSTRAINT "job_analyses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_analyses" ADD CONSTRAINT "job_analyses_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_analysis_id_job_analyses_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."job_analyses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "applications_user_id_idx" ON "applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "applications_status_idx" ON "applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "applications_applied_at_idx" ON "applications" USING btree ("applied_at");--> statement-breakpoint
CREATE INDEX "applications_created_at_idx" ON "applications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "applications_company_idx" ON "applications" USING btree ("company");--> statement-breakpoint
CREATE INDEX "applications_user_status_idx" ON "applications" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "follow_ups_user_id_idx" ON "follow_ups" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "follow_ups_application_id_idx" ON "follow_ups" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "follow_ups_due_at_idx" ON "follow_ups" USING btree ("due_at");--> statement-breakpoint
CREATE INDEX "follow_ups_user_due_idx" ON "follow_ups" USING btree ("user_id","due_at");--> statement-breakpoint
CREATE INDEX "interviews_application_id_idx" ON "interviews" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "interviews_user_id_idx" ON "interviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "interviews_scheduled_at_idx" ON "interviews" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "interviews_user_scheduled_idx" ON "interviews" USING btree ("user_id","scheduled_at");--> statement-breakpoint
CREATE INDEX "job_analyses_user_id_idx" ON "job_analyses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "job_analyses_source_hash_idx" ON "job_analyses" USING btree ("source_text_hash");--> statement-breakpoint
CREATE INDEX "job_analyses_user_source_idx" ON "job_analyses" USING btree ("user_id","source_text_hash");--> statement-breakpoint
CREATE INDEX "matches_user_id_idx" ON "matches" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "matches_application_id_idx" ON "matches" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "matches_analysis_id_idx" ON "matches" USING btree ("analysis_id");--> statement-breakpoint
CREATE INDEX "notes_application_id_idx" ON "notes" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "notes_user_id_idx" ON "notes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "skills_user_id_idx" ON "skills" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "skills_resume_id_idx" ON "skills" USING btree ("resume_id");--> statement-breakpoint
CREATE INDEX "skills_name_idx" ON "skills" USING btree ("name");--> statement-breakpoint
CREATE INDEX "status_history_application_id_idx" ON "status_history" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "status_history_user_id_idx" ON "status_history" USING btree ("user_id");