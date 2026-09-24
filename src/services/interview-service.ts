import { eq, and, desc, count, gte, lte } from "drizzle-orm";
import {
  interviews,
  applications,
} from "@/db/schema";
import { getDb } from "@/db";
import { interviewSchema, type InterviewInput } from "@/lib/validation/schemas";

export class InterviewError extends Error {
  constructor(
    message: string,
    public code: "NOT_FOUND" | "UNAUTHORIZED" | "VALIDATION" | "DATABASE",
  ) {
    super(message);
    this.name = "InterviewError";
  }
}

export interface InterviewWithApp {
  id: string;
  applicationId: string;
  userId: string;
  type: string;
  scheduledAt: Date;
  durationMinutes: number | null;
  interviewer: string | null;
  location: string | null;
  notes: string | null;
  result: string;
  feedback: string | null;
  createdAt: Date;
  updatedAt: Date;
  company: string;
  title: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listInterviews(
  userId: string,
  query: { page?: number; pageSize?: number; from?: string; to?: string; applicationId?: string },
  db = getDb(),
): Promise<PaginatedResult<InterviewWithApp>> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  const conditions = [eq(interviews.userId, userId)];

  if (query.from) conditions.push(gte(interviews.scheduledAt, new Date(query.from)));
  if (query.to) conditions.push(lte(interviews.scheduledAt, new Date(query.to)));
  if (query.applicationId) conditions.push(eq(interviews.applicationId, query.applicationId));

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: interviews.id,
        applicationId: interviews.applicationId,
        userId: interviews.userId,
        type: interviews.type,
        scheduledAt: interviews.scheduledAt,
        durationMinutes: interviews.durationMinutes,
        interviewer: interviews.interviewer,
        location: interviews.location,
        notes: interviews.notes,
        result: interviews.result,
        feedback: interviews.feedback,
        createdAt: interviews.createdAt,
        updatedAt: interviews.updatedAt,
        company: applications.company,
        title: applications.title,
      })
      .from(interviews)
      .innerJoin(applications, eq(interviews.applicationId, applications.id))
      .where(and(...conditions))
      .orderBy(desc(interviews.scheduledAt))
      .limit(pageSize)
      .offset(offset),
    db.select({ total: count() }).from(interviews).where(and(...conditions)),
  ]);

  return {
    data: rows.map((r) => ({
      ...r,
      scheduledAt: r.scheduledAt instanceof Date ? r.scheduledAt : new Date(r.scheduledAt),
    })),
    total: Number(total),
    page,
    pageSize,
    totalPages: Math.ceil(Number(total) / pageSize),
  };
}

export async function getInterviewById(
  userId: string,
  interviewId: string,
  db = getDb(),
): Promise<InterviewWithApp | null> {
  const rows = await db
    .select({
      id: interviews.id,
      applicationId: interviews.applicationId,
      userId: interviews.userId,
      type: interviews.type,
      scheduledAt: interviews.scheduledAt,
      durationMinutes: interviews.durationMinutes,
      interviewer: interviews.interviewer,
      location: interviews.location,
      notes: interviews.notes,
      result: interviews.result,
      feedback: interviews.feedback,
      createdAt: interviews.createdAt,
      updatedAt: interviews.updatedAt,
      company: applications.company,
      title: applications.title,
    })
    .from(interviews)
    .innerJoin(applications, eq(interviews.applicationId, applications.id))
    .where(and(eq(interviews.id, interviewId), eq(interviews.userId, userId)))
    .limit(1);

  if (rows.length === 0) return null;

  const r = rows[0];
  return {
    ...r,
    scheduledAt: r.scheduledAt instanceof Date ? r.scheduledAt : new Date(r.scheduledAt),
  };
}

export async function createInterview(
  userId: string,
  input: unknown,
  db = getDb(),
): Promise<{ id: string }> {
  const parsed = interviewSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new InterviewError(issue?.message ?? "Invalid input", "VALIDATION");
  }

  const { applicationId, ...data } = parsed.data;

  const app = await db
    .select({ id: applications.id })
    .from(applications)
    .where(and(eq(applications.id, applicationId), eq(applications.userId, userId)))
    .limit(1);

  if (app.length === 0) {
    throw new InterviewError("Application not found", "NOT_FOUND");
  }

  const [row] = await db
    .insert(interviews)
    .values({ ...data, applicationId, userId, scheduledAt: new Date(data.scheduledAt) })
    .returning({ id: interviews.id });

  return { id: row.id };
}

export async function updateInterview(
  userId: string,
  interviewId: string,
  input: unknown,
  db = getDb(),
): Promise<void> {
  const parsed = interviewSchema.partial().safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new InterviewError(issue?.message ?? "Invalid input", "VALIDATION");
  }

  const updateData: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.scheduledAt) {
    updateData.scheduledAt = new Date(parsed.data.scheduledAt);
  }

  const result = await db
    .update(interviews)
    .set(updateData)
    .where(and(eq(interviews.id, interviewId), eq(interviews.userId, userId)));

  if (!result[0]) {
    throw new InterviewError("Interview not found", "NOT_FOUND");
  }
}

export async function deleteInterview(
  userId: string,
  interviewId: string,
  db = getDb(),
): Promise<void> {
  const result = await db
    .delete(interviews)
    .where(and(eq(interviews.id, interviewId), eq(interviews.userId, userId)));

  if (!result[0]) {
    throw new InterviewError("Interview not found", "NOT_FOUND");
  }
}