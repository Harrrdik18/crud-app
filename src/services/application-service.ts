import { eq, and, desc, asc, sql, count, gte, lte, ilike } from "drizzle-orm";
import {
  applications,
  statusHistory,
  interviews,
  followUps,
  notes,
} from "@/db/schema";
import { getDb } from "@/db";
import {
  applicationSchema,
  applicationQuerySchema,
  statusChangeSchema,
  type ApplicationInput,
  type ApplicationQuery,
  type ApplicationStatus,
} from "@/lib/validation/schemas";

export class ApplicationError extends Error {
  constructor(
    message: string,
    public code: "NOT_FOUND" | "UNAUTHORIZED" | "VALIDATION" | "DATABASE",
  ) {
    super(message);
    this.name = "ApplicationError";
  }
}

export interface ApplicationWithRelations {
  id: string;
  userId: string;
  company: string;
  title: string;
  url: string | null;
  location: string | null;
  employmentType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryInterval: string | null;
  experience: string | null;
  description: string | null;
  status: ApplicationStatus;
  appliedAt: Date;
  source: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  interviewsCount?: number;
  followUpsCount?: number;
  notesCount?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface RawApplicationRow {
  id: string;
  userId: string;
  company: string;
  title: string;
  url: string | null;
  location: string | null;
  employmentType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryInterval: string | null;
  experience: string | null;
  description: string | null;
  status: string;
  appliedAt: string | Date;
  source: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  interviewsCount: number | null;
  followUpsCount: number | null;
  notesCount: number | null;
}

function mapRow(r: RawApplicationRow): ApplicationWithRelations {
  return {
    id: r.id,
    userId: r.userId,
    company: r.company,
    title: r.title,
    url: r.url,
    location: r.location,
    employmentType: r.employmentType,
    salaryMin: r.salaryMin,
    salaryMax: r.salaryMax,
    salaryCurrency: r.salaryCurrency,
    salaryInterval: r.salaryInterval,
    experience: r.experience,
    description: r.description,
    status: r.status as ApplicationStatus,
    appliedAt: r.appliedAt instanceof Date ? r.appliedAt : new Date(r.appliedAt),
    source: r.source,
    notes: r.notes,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    interviewsCount: Number(r.interviewsCount ?? 0),
    followUpsCount: Number(r.followUpsCount ?? 0),
    notesCount: Number(r.notesCount ?? 0),
  };
}

export async function listApplications(
  userId: string,
  query: ApplicationQuery,
  db = getDb(),
): Promise<PaginatedResult<ApplicationWithRelations>> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 12;
  const offset = (page - 1) * pageSize;

  const conditions = [eq(applications.userId, userId)];

  if (query.q) {
    const search = `%${query.q}%`;
    conditions.push(sql`(${applications.company} ILIKE ${search} OR ${applications.title} ILIKE ${search})`);
  }
  if (query.status) conditions.push(eq(applications.status, query.status));
  if (query.location) conditions.push(ilike(applications.location, `%${query.location}%`));
  if (query.from) conditions.push(gte(applications.appliedAt, query.from));
  if (query.to) conditions.push(lte(applications.appliedAt, query.to));

  const orderBy = (() => {
    switch (query.sort) {
      case "oldest": return asc(applications.createdAt);
      case "company": return asc(applications.company);
      case "status": return asc(applications.status);
      default: return desc(applications.createdAt);
    }
  })();

  const rows = await db
    .select({
      id: applications.id,
      userId: applications.userId,
      company: applications.company,
      title: applications.title,
      url: applications.url,
      location: applications.location,
      employmentType: applications.employmentType,
      salaryMin: applications.salaryMin,
      salaryMax: applications.salaryMax,
      salaryCurrency: applications.salaryCurrency,
      salaryInterval: applications.salaryInterval,
      experience: applications.experience,
      description: applications.description,
      status: applications.status,
      appliedAt: applications.appliedAt,
      source: applications.source,
      notes: applications.notes,
      createdAt: applications.createdAt,
      updatedAt: applications.updatedAt,
      interviewsCount: count(interviews.id),
      followUpsCount: count(followUps.id),
      notesCount: count(notes.id),
    })
    .from(applications)
    .leftJoin(interviews, eq(interviews.applicationId, applications.id))
    .leftJoin(followUps, eq(followUps.applicationId, applications.id))
    .leftJoin(notes, eq(notes.applicationId, applications.id))
    .where(and(...conditions))
    .groupBy(applications.id)
    .orderBy(orderBy)
    .limit(pageSize)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(applications)
    .where(and(...conditions));

  return {
    data: rows.map(mapRow),
    total: Number(total),
    page,
    pageSize,
    totalPages: Math.ceil(Number(total) / pageSize),
  };
}

export async function getApplicationById(
  userId: string,
  applicationId: string,
  db = getDb(),
): Promise<ApplicationWithRelations | null> {
  const rows = await db
    .select({
      id: applications.id,
      userId: applications.userId,
      company: applications.company,
      title: applications.title,
      url: applications.url,
      location: applications.location,
      employmentType: applications.employmentType,
      salaryMin: applications.salaryMin,
      salaryMax: applications.salaryMax,
      salaryCurrency: applications.salaryCurrency,
      salaryInterval: applications.salaryInterval,
      experience: applications.experience,
      description: applications.description,
      status: applications.status,
      appliedAt: applications.appliedAt,
      source: applications.source,
      notes: applications.notes,
      createdAt: applications.createdAt,
      updatedAt: applications.updatedAt,
      interviewsCount: count(interviews.id),
      followUpsCount: count(followUps.id),
      notesCount: count(notes.id),
    })
    .from(applications)
    .leftJoin(interviews, eq(interviews.applicationId, applications.id))
    .leftJoin(followUps, eq(followUps.applicationId, applications.id))
    .leftJoin(notes, eq(notes.applicationId, applications.id))
    .where(and(eq(applications.id, applicationId), eq(applications.userId, userId)))
    .groupBy(applications.id)
    .limit(1);

  return rows[0] ? mapRow(rows[0]) : null;
}

export async function createApplication(
  userId: string,
  input: unknown,
  db = getDb(),
): Promise<{ id: string; status: ApplicationStatus }> {
  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new ApplicationError(issue?.message ?? "Invalid input", "VALIDATION");
  }

  const [row] = await db
    .insert(applications)
    .values({ ...parsed.data, userId })
    .returning({ id: applications.id, status: applications.status });

  return { id: row.id, status: row.status };
}

export async function updateApplication(
  userId: string,
  applicationId: string,
  input: unknown,
  db = getDb(),
): Promise<void> {
  const parsed = applicationSchema.partial().safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new ApplicationError(issue?.message ?? "Invalid input", "VALIDATION");
  }

  const result = await db
    .update(applications)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(applications.id, applicationId), eq(applications.userId, userId)));

  if (!result[0]) {
    throw new ApplicationError("Application not found", "NOT_FOUND");
  }
}

export async function changeApplicationStatus(
  userId: string,
  applicationId: string,
  input: unknown,
  db = getDb(),
): Promise<void> {
  const parsed = statusChangeSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new ApplicationError(issue?.message ?? "Invalid input", "VALIDATION");
  }

  const current = await db
    .select({ status: applications.status })
    .from(applications)
    .where(and(eq(applications.id, applicationId), eq(applications.userId, userId)))
    .limit(1);

  if (current.length === 0) {
    throw new ApplicationError("Application not found", "NOT_FOUND");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(applications)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(and(eq(applications.id, applicationId), eq(applications.userId, userId)));

    await tx.insert(statusHistory).values({
      applicationId,
      userId,
      fromStatus: current[0].status,
      toStatus: parsed.data.status,
      note: parsed.data.note,
    });
  });
}

export async function deleteApplication(
  userId: string,
  applicationId: string,
  db = getDb(),
): Promise<void> {
  const result = await db
    .delete(applications)
    .where(and(eq(applications.id, applicationId), eq(applications.userId, userId)));

  if (!result[0]) {
    throw new ApplicationError("Application not found", "NOT_FOUND");
  }
}

export async function getApplicationsByStatus(
  userId: string,
  db = getDb(),
): Promise<Record<ApplicationStatus, ApplicationWithRelations[]>> {
  const rows = await db
    .select({
      id: applications.id,
      userId: applications.userId,
      company: applications.company,
      title: applications.title,
      url: applications.url,
      location: applications.location,
      employmentType: applications.employmentType,
      salaryMin: applications.salaryMin,
      salaryMax: applications.salaryMax,
      salaryCurrency: applications.salaryCurrency,
      salaryInterval: applications.salaryInterval,
      experience: applications.experience,
      description: applications.description,
      status: applications.status,
      appliedAt: applications.appliedAt,
      source: applications.source,
      notes: applications.notes,
      createdAt: applications.createdAt,
      updatedAt: applications.updatedAt,
      interviewsCount: count(interviews.id),
      followUpsCount: count(followUps.id),
      notesCount: count(notes.id),
    })
    .from(applications)
    .leftJoin(interviews, eq(interviews.applicationId, applications.id))
    .leftJoin(followUps, eq(followUps.applicationId, applications.id))
    .leftJoin(notes, eq(notes.applicationId, applications.id))
    .where(eq(applications.userId, userId))
    .groupBy(applications.id)
    .orderBy(desc(applications.createdAt));

  const statuses: ApplicationStatus[] = [
    "saved",
    "applied",
    "screening",
    "interview",
    "offer",
    "rejected",
    "withdrawn",
  ];
  const grouped: Record<ApplicationStatus, ApplicationWithRelations[]> = statuses.reduce(
    (acc, s) => ({ ...acc, [s]: [] }),
    {} as Record<ApplicationStatus, ApplicationWithRelations[]>,
  );

  for (const r of rows) {
    grouped[r.status].push(mapRow(r));
  }
  return grouped;
}