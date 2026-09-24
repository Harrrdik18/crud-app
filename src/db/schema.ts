import {
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/* ------------------------------------------------------------------ */
/*  Enums                                                              */
/* ------------------------------------------------------------------ */

export const applicationStatus = pgEnum("application_status", [
  "saved",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
]);

export const employmentType = pgEnum("employment_type", [
  "full_time",
  "part_time",
  "contract",
  "freelance",
  "internship",
  "temporary",
  "other",
]);

export const salaryInterval = pgEnum("salary_interval", [
  "year",
  "hour",
  "month",
  "one_time",
]);

export const applicationSource = pgEnum("application_source", [
  "linkedin",
  "indeed",
  "company_website",
  "referral",
  "recruiter",
  "job_board",
  "networking",
  "other",
]);

export const interviewType = pgEnum("interview_type", [
  "phone",
  "video",
  "onsite",
  "technical",
  "behavioral",
  "panel",
  "take_home",
  "other",
]);

export const interviewResult = pgEnum("interview_result", [
  "unknown",
  "passed",
  "failed",
  "cancelled",
]);

export const followUpStatus = pgEnum("follow_up_status", [
  "pending",
  "done",
  "skipped",
]);

export const skillKind = pgEnum("skill_kind", [
  "technology",
  "language",
  "domain",
  "soft",
  "tool",
]);

/* ------------------------------------------------------------------ */
/*  Users + auth                                                       */
/* ------------------------------------------------------------------ */

export const users = pgTable("users", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);

/* ------------------------------------------------------------------ */
/*  Profile / resume                                                   */
/* ------------------------------------------------------------------ */

export const profiles = pgTable("profiles", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  userId: uuid("user_id").notNull().unique(),
  headline: text("headline"),
  location: text("location"),
  bio: text("bio"),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  websiteUrl: text("website_url"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Experience = {
  id?: string;
  role: string;
  company: string;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  description?: string | null;
  technologies: string[];
};

export type Education = {
  id?: string;
  institution: string;
  degree?: string | null;
  field?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

export type Project = {
  id?: string;
  name: string;
  description?: string | null;
  url?: string | null;
  technologies: string[];
};

export const resumes = pgTable("resumes", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  userId: uuid("user_id").notNull().unique(),
  title: text("title").notNull().default("My Resume"),
  summary: text("summary"),
  yearsExperience: integer("years_experience"),
  targetRole: text("target_role"),
  targetLocation: text("target_location"),
  experiences: jsonb("experiences").$type<Experience[]>().notNull().default([]),
  education: jsonb("education").$type<Education[]>().notNull().default([]),
  projects: jsonb("projects").$type<Project[]>().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const skills = pgTable(
  "skills",
  {
    id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resumeId: uuid("resume_id").references(() => resumes.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    kind: skillKind("kind").notNull().default("technology"),
    level: text("level"),
  },
  (table) => [
    index("skills_user_id_idx").on(table.userId),
    index("skills_resume_id_idx").on(table.resumeId),
    index("skills_name_idx").on(table.name),
  ],
);

/* ------------------------------------------------------------------ */
/*  Applications                                                       */
/* ------------------------------------------------------------------ */

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    company: text("company").notNull(),
    title: text("title").notNull(),
    url: text("url"),
    location: text("location"),
    employmentType: employmentType("employment_type"),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    salaryCurrency: text("salary_currency"),
    salaryInterval: salaryInterval("salary_interval"),
    experience: text("experience"),
    description: text("description"),
    status: applicationStatus("status").notNull().default("applied"),
    appliedAt: date("applied_at").notNull().default(sql`CURRENT_DATE`),
    source: applicationSource("source"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("applications_user_id_idx").on(table.userId),
    index("applications_status_idx").on(table.status),
    index("applications_applied_at_idx").on(table.appliedAt),
    index("applications_created_at_idx").on(table.createdAt),
    index("applications_company_idx").on(table.company),
    index("applications_user_status_idx").on(table.userId, table.status),
  ],
);

export const statusHistory = pgTable(
  "status_history",
  {
    id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fromStatus: applicationStatus("from_status"),
    toStatus: applicationStatus("to_status").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("status_history_application_id_idx").on(table.applicationId),
    index("status_history_user_id_idx").on(table.userId),
  ],
);

export const interviews = pgTable(
  "interviews",
  {
    id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: interviewType("type").notNull().default("video"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes"),
    interviewer: text("interviewer"),
    location: text("location"),
    notes: text("notes"),
    result: interviewResult("result").notNull().default("unknown"),
    feedback: text("feedback"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("interviews_application_id_idx").on(table.applicationId),
    index("interviews_user_id_idx").on(table.userId),
    index("interviews_scheduled_at_idx").on(table.scheduledAt),
    index("interviews_user_scheduled_idx").on(table.userId, table.scheduledAt),
  ],
);

export const followUps = pgTable(
  "follow_ups",
  {
    id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    applicationId: uuid("application_id").references(() => applications.id, {
      onDelete: "cascade",
    }),
    title: text("title").notNull(),
    dueAt: date("due_at").notNull().default(sql`CURRENT_DATE`),
    status: followUpStatus("status").notNull().default("pending"),
    notes: text("notes"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("follow_ups_user_id_idx").on(table.userId),
    index("follow_ups_application_id_idx").on(table.applicationId),
    index("follow_ups_due_at_idx").on(table.dueAt),
    index("follow_ups_user_due_idx").on(table.userId, table.dueAt),
  ],
);

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("notes_application_id_idx").on(table.applicationId),
    index("notes_user_id_idx").on(table.userId),
  ],
);

/* ------------------------------------------------------------------ */
/*  Job analysis + matches                                             */
/* ------------------------------------------------------------------ */

export type JobAnalysisData = {
  requiredSkills: string[];
  preferredSkills: string[];
  technologies: string[];
  responsibilities: string[];
  keywords: string[];
  experience: string | null;
  backend: boolean;
};

export const jobAnalyses = pgTable(
  "job_analyses",
  {
    id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    applicationId: uuid("application_id").references(() => applications.id, {
      onDelete: "set null",
    }),
    sourceTextHash: text("source_text_hash").notNull(),
    title: text("title"),
    company: text("company"),
    data: jsonb("data").$type<JobAnalysisData>().notNull(),
    method: text("method").notNull().default("heuristic"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("job_analyses_user_id_idx").on(table.userId),
    index("job_analyses_source_hash_idx").on(table.sourceTextHash),
    index("job_analyses_user_source_idx").on(table.userId, table.sourceTextHash),
  ],
);

export const matches = pgTable(
  "matches",
  {
    id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    applicationId: uuid("application_id").references(() => applications.id, {
      onDelete: "cascade",
    }),
    analysisId: uuid("analysis_id").references(() => jobAnalyses.id, {
      onDelete: "set null",
    }),
    jobTitle: text("job_title"),
    company: text("company"),
    overallScore: integer("overall_score").notNull(),
    matchingSkills: jsonb("matching_skills").$type<string[]>().notNull(),
    gapSkills: jsonb("gap_skills").$type<string[]>().notNull(),
    depthAssessment: integer("depth_assessment"),
    areaAssessments: jsonb("area_assessments")
      .$type<
        { area: string; score: number }[]
      >()
      .notNull(),
    experienceMet: jsonb("experience_met").$type<{
      meets: boolean;
      required: string | null;
      candidate: string | null;
    }>(),
    method: text("method").notNull().default("heuristic"),
    disclaimer: text("disclaimer").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("matches_user_id_idx").on(table.userId),
    index("matches_application_id_idx").on(table.applicationId),
    index("matches_analysis_id_idx").on(table.analysisId),
  ],
);