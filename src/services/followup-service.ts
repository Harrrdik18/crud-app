import { eq, and, count, asc } from "drizzle-orm";
import {
  followUps,
  applications,
} from "@/db/schema";
import { getDb } from "@/db";
import { followUpSchema, type FollowUpInput } from "@/lib/validation/schemas";

export class FollowUpError extends Error {
  constructor(
    message: string,
    public code: "NOT_FOUND" | "UNAUTHORIZED" | "VALIDATION" | "DATABASE",
  ) {
    super(message);
    this.name = "FollowUpError";
  }
}

export interface FollowUpWithApp {
  id: string;
  applicationId: string | null;
  userId: string;
  title: string;
  dueAt: Date;
  status: string;
  notes: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  company: string | null;
  appTitle: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listFollowUps(
  userId: string,
  query: { page?: number; pageSize?: number; status?: string; applicationId?: string },
  db = getDb(),
): Promise<PaginatedResult<FollowUpWithApp>> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  const conditions = [eq(followUps.userId, userId)];

  if (query.status) conditions.push(eq(followUps.status, query.status as "pending" | "done" | "skipped"));
  if (query.applicationId) conditions.push(eq(followUps.applicationId, query.applicationId));

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: followUps.id,
        applicationId: followUps.applicationId,
        userId: followUps.userId,
        title: followUps.title,
        dueAt: followUps.dueAt,
        status: followUps.status,
        notes: followUps.notes,
        completedAt: followUps.completedAt,
        createdAt: followUps.createdAt,
        updatedAt: followUps.updatedAt,
        company: applications.company,
        appTitle: applications.title,
      })
      .from(followUps)
      .leftJoin(applications, eq(followUps.applicationId, applications.id))
      .where(and(...conditions))
      .orderBy(asc(followUps.dueAt))
      .limit(pageSize)
      .offset(offset),
    db.select({ total: count() }).from(followUps).where(and(...conditions)),
  ]);

  const toDate = (v: string | Date): Date => v instanceof Date ? v : new Date(v);
  return {
    data: rows.map((r) => ({
      ...r,
      dueAt: toDate(r.dueAt),
      completedAt: r.completedAt ? toDate(r.completedAt) : null,
    })),
    total: Number(total),
    page,
    pageSize,
    totalPages: Math.ceil(Number(total) / pageSize),
  };
}

export async function getFollowUpById(
  userId: string,
  followUpId: string,
  db = getDb(),
): Promise<FollowUpWithApp | null> {
  const rows = await db
    .select({
      id: followUps.id,
      applicationId: followUps.applicationId,
      userId: followUps.userId,
      title: followUps.title,
      dueAt: followUps.dueAt,
      status: followUps.status,
      notes: followUps.notes,
      completedAt: followUps.completedAt,
      createdAt: followUps.createdAt,
      updatedAt: followUps.updatedAt,
      company: applications.company,
      appTitle: applications.title,
    })
    .from(followUps)
    .leftJoin(applications, eq(followUps.applicationId, applications.id))
    .where(and(eq(followUps.id, followUpId), eq(followUps.userId, userId)))
    .limit(1);

  const toDate = (v: string | Date): Date => v instanceof Date ? v : new Date(v);

  if (rows.length === 0) return null;

  const r = rows[0];
  return {
    ...r,
    dueAt: toDate(r.dueAt),
    completedAt: r.completedAt ? toDate(r.completedAt) : null,
  };
}

export async function createFollowUp(
  userId: string,
  input: unknown,
  db = getDb(),
): Promise<{ id: string }> {
  const parsed = followUpSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new Error(issue?.message ?? "Invalid input");
  }

  const { applicationId, ...data } = parsed.data;

  const [row] = await db
    .insert(followUps)
    .values({ ...data, applicationId, userId })
    .returning({ id: followUps.id });

  return { id: row.id };
}

export async function updateFollowUp(
  userId: string,
  followUpId: string,
  input: unknown,
  db = getDb(),
): Promise<void> {
  const parsed = followUpSchema.partial().safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new Error(issue?.message ?? "Invalid input");
  }

  // Check current status to see if we're transitioning to "done"
  const current = await db
    .select({ status: followUps.status })
    .from(followUps)
    .where(eq(followUps.id, followUpId))
    .limit(1);

  const updateData: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  const newStatus = parsed.data.status;
  if (newStatus === "done" && current[0]?.status !== "done") {
    updateData.completedAt = new Date();
  } else if (newStatus && newStatus !== "done") {
    updateData.completedAt = null;
  }

  const result = await db
    .update(followUps)
    .set(updateData)
    .where(and(eq(followUps.id, followUpId), eq(followUps.userId, userId)))
    .returning({ id: followUps.id });

  if (!result[0]) {
    throw new Error("Follow-up not found");
  }
}

export async function deleteFollowUp(
  userId: string,
  followUpId: string,
  db = getDb(),
): Promise<void> {
  const result = await db
    .delete(followUps)
    .where(and(eq(followUps.id, followUpId), eq(followUps.userId, userId)))
    .returning({ id: followUps.id });

  if (!result[0]) {
    throw new Error("Follow-up not found");
  }
}