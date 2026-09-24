import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

export const APPLICATION_STATUSES = [
  "saved",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export const EMPLOYMENT_TYPES = [
  "full_time",
  "part_time",
  "contract",
  "freelance",
  "internship",
  "temporary",
  "other",
] as const;

export const SALARY_INTERVALS = ["year", "hour", "month", "one_time"] as const;

export const APPLICATION_SOURCES = [
  "linkedin",
  "indeed",
  "company_website",
  "referral",
  "recruiter",
  "job_board",
  "networking",
  "other",
] as const;

export const INTERVIEW_TYPES = [
  "phone",
  "video",
  "onsite",
  "technical",
  "behavioral",
  "panel",
  "take_home",
  "other",
] as const;

export const INTERVIEW_RESULTS = [
  "unknown",
  "passed",
  "failed",
  "cancelled",
] as const;

export const FOLLOW_UP_STATUSES = ["pending", "done", "skipped"] as const;

export const SKILL_KINDS = [
  "technology",
  "language",
  "domain",
  "soft",
  "tool",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];
export type SalaryInterval = (typeof SALARY_INTERVALS)[number];
export type ApplicationSource = (typeof APPLICATION_SOURCES)[number];
export type InterviewType = (typeof INTERVIEW_TYPES)[number];
export type InterviewResult = (typeof INTERVIEW_RESULTS)[number];
export type FollowUpStatus = (typeof FOLLOW_UP_STATUSES)[number];
export type SkillKind = (typeof SKILL_KINDS)[number];

/* ------------------------------------------------------------------ */
/*  Primitives                                                         */
/* ------------------------------------------------------------------ */

function emptyToNull(input: unknown): unknown {
  if (input === undefined || input === null) return null;
  if (typeof input === "string" && input.trim() === "") return null;
  return input;
}

function maybeEmptyString(schema: z.ZodType<string>) {
  return z.preprocess(emptyToNull, schema.nullable());
}

function maybeEnum<T extends readonly [string, ...string[]]>(values: T) {
  return z.preprocess(emptyToNull, z.enum(values).nullable());
}

function maybeNumber(schema: z.ZodType<number>) {
  return z.preprocess((v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : v;
  }, schema.nullable());
}

const optionalText = (max: number) =>
  maybeEmptyString(z.string().trim().max(max));

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const optionalDate = () =>
  maybeEmptyString(z.string().regex(DATE_RE, "Use a valid date (YYYY-MM-DD)"));

/* ------------------------------------------------------------------ */
/*  Auth                                                               */
/* ------------------------------------------------------------------ */

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.email("Enter a valid email address").trim().toLowerCase().max(200),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address").trim().toLowerCase().max(200),
  password: z.string().min(1, "Password is required").max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/* ------------------------------------------------------------------ */
/*  Profile                                                            */
/* ------------------------------------------------------------------ */

export const profileSchema = z.object({
  headline: optionalText(200),
  location: optionalText(120),
  bio: optionalText(2000),
  githubUrl: maybeEmptyString(z.url("Enter a valid URL").max(300)),
  linkedinUrl: maybeEmptyString(z.url("Enter a valid URL").max(300)),
  websiteUrl: maybeEmptyString(z.url("Enter a valid URL").max(300)),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required").max(128),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(128),
});

/* ------------------------------------------------------------------ */
/*  Applications                                                       */
/* ------------------------------------------------------------------ */

export const applicationSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(150),
  title: z.string().trim().min(1, "Job title is required").max(200),
  url: maybeEmptyString(z.url("Enter a valid URL").max(500)),
  location: optionalText(150),
  employmentType: maybeEnum(EMPLOYMENT_TYPES),
  salaryMin: maybeNumber(z.number().int().min(0).max(100_000_000)),
  salaryMax: maybeNumber(z.number().int().min(0).max(100_000_000)),
  salaryCurrency: optionalText(8),
  salaryInterval: maybeEnum(SALARY_INTERVALS),
  experience: optionalText(200),
  description: optionalText(20_000),
  status: z.enum(APPLICATION_STATUSES).default("applied"),
  appliedAt: z.string().regex(DATE_RE, "Use a valid date (YYYY-MM-DD)"),
  source: maybeEnum(APPLICATION_SOURCES),
  notes: optionalText(10_000),
});

export const statusChangeSchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
  note: optionalText(2000),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

/** Search/filter/sort query params used on the applications list page. */
export const applicationQuerySchema = z.object({
  q: optionalText(100),
  status: maybeEnum(APPLICATION_STATUSES),
  location: optionalText(100),
  from: optionalDate().nullable(),
  to: optionalDate().nullable(),
  sort: z.enum(["newest", "oldest", "company", "status"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(12),
});

export type ApplicationQuery = z.infer<typeof applicationQuerySchema>;

/* ------------------------------------------------------------------ */
/*  Interviews                                                         */
/* ------------------------------------------------------------------ */

export const interviewSchema = z.object({
  applicationId: z.string().trim().min(1).max(40),
  type: z.enum(INTERVIEW_TYPES).default("video"),
  scheduledAt: z.string().trim().min(1, "Date/time is required"),
  durationMinutes: maybeNumber(z.number().int().min(5).max(600)),
  interviewer: optionalText(150),
  location: optionalText(200),
  notes: optionalText(5000),
  result: z.enum(INTERVIEW_RESULTS).default("unknown"),
  feedback: optionalText(5000),
});

export type InterviewInput = z.infer<typeof interviewSchema>;

/* ------------------------------------------------------------------ */
/*  Follow-ups                                                         */
/* ------------------------------------------------------------------ */

export const followUpSchema = z.object({
  applicationId: maybeEmptyString(z.string().trim().max(40)).nullable(),
  title: z.string().trim().min(1, "Title is required").max(150),
  dueAt: z.string().regex(DATE_RE, "Use a valid date (YYYY-MM-DD)"),
  status: z.enum(FOLLOW_UP_STATUSES).default("pending"),
  notes: optionalText(2000),
});

export type FollowUpInput = z.infer<typeof followUpSchema>;

/* ------------------------------------------------------------------ */
/*  Notes                                                              */
/* ------------------------------------------------------------------ */

export const noteSchema = z.object({
  body: z.string().trim().min(1, "Note is required").max(10_000),
});

export type NoteInput = z.infer<typeof noteSchema>;

/* ------------------------------------------------------------------ */
/*  Resume                                                             */
/* ------------------------------------------------------------------ */

export const experienceItemSchema = z.object({
  id: z.string().optional(),
  role: z.string().trim().min(1).max(150),
  company: z.string().trim().min(1).max(150),
  startDate: z.string().trim().min(1).max(10),
  endDate: optionalText(10),
  current: z.boolean().default(false),
  description: optionalText(4000),
  technologies: z.array(z.string().trim().min(1).max(60)).default([]),
});

export const educationItemSchema = z.object({
  id: z.string().optional(),
  institution: z.string().trim().min(1).max(150),
  degree: optionalText(150),
  field: optionalText(150),
  startDate: optionalText(10),
  endDate: optionalText(10),
});

export const projectItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(150),
  description: optionalText(3000),
  url: maybeEmptyString(z.url("Enter a valid URL").max(300)),
  technologies: z.array(z.string().trim().min(1).max(60)).default([]),
});

export const resumeSchema = z.object({
  title: z.string().trim().min(1).max(100).default("My Resume"),
  summary: optionalText(8000),
  yearsExperience: maybeNumber(z.number().int().min(0).max(100)),
  targetRole: optionalText(150),
  targetLocation: optionalText(150),
  experiences: z.array(experienceItemSchema).max(50).default([]),
  education: z.array(educationItemSchema).max(30).default([]),
  projects: z.array(projectItemSchema).max(50).default([]),
});

export const skillInputSchema = z.object({
  name: z.string().trim().min(1).max(60),
  kind: z.enum(SKILL_KINDS).default("technology"),
  level: optionalText(40),
});

export const skillsBulkSchema = z.object({
  skills: z.array(skillInputSchema).max(100).default([]),
});

export type ResumeInput = z.infer<typeof resumeSchema>;

/* ------------------------------------------------------------------ */
/*  Job analysis                                                       */
/* ------------------------------------------------------------------ */

export const jobAnalysisRequestSchema = z.object({
  jobTitle: optionalText(200),
  company: optionalText(150),
  description: z
    .string()
    .trim()
    .min(50, "Job description must be at least 50 characters")
    .max(30_000, "Job description is too long"),
});

export type JobAnalysisRequest = z.infer<typeof jobAnalysisRequestSchema>;

/* ------------------------------------------------------------------ */
/*  Errors                                                             */
/* ------------------------------------------------------------------ */

export function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Invalid input";
  const path = issue.path.join(".");
  const prefix = path ? `${path}: ` : "";
  return `${prefix}${issue.message}`;
}

export function safeParse<T extends z.ZodType>(
  schema: T,
  data: unknown,
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) return result;
  return { success: false, error: firstIssue(result.error) };
}