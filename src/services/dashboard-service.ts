import { eq, and, count, sql, gte, desc, asc } from "drizzle-orm";
import {
  applications,
  interviews,
  followUps,
} from "@/db/schema";
import { getDb } from "@/db";
import type { ApplicationStatus } from "@/lib/validation/schemas";

export interface DashboardStats {
  totalApplications: number;
  applicationsThisWeek: number;
  interviews: number;
  offers: number;
  rejections: number;
  responseRate: number;
  interviewConversionRate: number;
}

export interface FunnelData {
  stage: string;
  count: number;
  percentage: number;
}

export interface UpcomingInterview {
  id: string;
  applicationId: string;
  company: string;
  title: string;
  type: string;
  scheduledAt: Date;
  interviewer: string | null;
}

export interface PendingFollowUp {
  id: string;
  applicationId: string;
  company: string;
  title: string;
  dueAt: Date;
}

export interface RecentApplication {
  id: string;
  company: string;
  title: string;
  status: string;
  appliedAt: Date;
}

export async function getDashboardStats(userId: string, db = getDb()): Promise<DashboardStats> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalApps,
    appsThisWeek,
    interviewsCount,
    offersCount,
    rejectionsCount,
    responseRateData,
    interviewConversionData,
  ] = await Promise.all([
    db.select({ count: count() }).from(applications).where(eq(applications.userId, userId)),
    db.select({ count: count() }).from(applications).where(and(eq(applications.userId, userId), gte(applications.createdAt, weekAgo))),
    db.select({ count: count() }).from(interviews).where(eq(interviews.userId, userId)),
    db.select({ count: count() }).from(applications).where(and(eq(applications.userId, userId), eq(applications.status, "offer"))),
    db.select({ count: count() }).from(applications).where(and(eq(applications.userId, userId), eq(applications.status, "rejected"))),
    db
      .select({ responded: count() })
      .from(applications)
      .where(and(eq(applications.userId, userId), sql`${applications.status} NOT IN ('saved', 'applied')`)),
    db
      .select({ interviewed: count() })
      .from(applications)
      .where(and(eq(applications.userId, userId), sql`${applications.status} IN ('interview', 'offer')`)),
  ]);

  const total = Number(totalApps[0]?.count ?? 0);
  const responded = Number(responseRateData[0]?.responded ?? 0);
  const interviewed = Number(interviewConversionData[0]?.interviewed ?? 0);

  return {
    totalApplications: total,
    applicationsThisWeek: Number(appsThisWeek[0]?.count ?? 0),
    interviews: Number(interviewsCount[0]?.count ?? 0),
    offers: Number(offersCount[0]?.count ?? 0),
    rejections: Number(rejectionsCount[0]?.count ?? 0),
    responseRate: total > 0 ? Math.round((responded / total) * 100) : 0,
    interviewConversionRate: total > 0 ? Math.round((interviewed / total) * 100) : 0,
  };
}

export async function getFunnelData(userId: string, db = getDb()): Promise<FunnelData[]> {
  const stages = [
    { key: "applied", label: "Applications" },
    { key: "screening", label: "Screening" },
    { key: "interview", label: "Interviews" },
    { key: "offer", label: "Offers" },
  ] as const;

  const counts = await Promise.all(
    stages.map((s) =>
      db
        .select({ count: count() })
        .from(applications)
        .where(and(eq(applications.userId, userId), eq(applications.status, s.key))),
    ),
  );

  const total = Number(counts[0]?.[0]?.count ?? 0);
  return stages.map((stage, i) => ({
    stage: stage.label,
    count: Number(counts[i]?.[0]?.count ?? 0),
    percentage: total > 0 ? Math.round((Number(counts[i]?.[0]?.count ?? 0) / total) * 100) : 0,
  }));
}

export async function getUpcomingInterviews(userId: string, limit = 5, db = getDb()): Promise<UpcomingInterview[]> {
  const now = new Date();
  const rows = await db
    .select({
      id: interviews.id,
      applicationId: interviews.applicationId,
      type: interviews.type,
      scheduledAt: interviews.scheduledAt,
      interviewer: interviews.interviewer,
      company: applications.company,
      title: applications.title,
    })
    .from(interviews)
    .innerJoin(applications, eq(interviews.applicationId, applications.id))
    .where(and(eq(interviews.userId, userId), gte(interviews.scheduledAt, now)))
    .orderBy(asc(interviews.scheduledAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    applicationId: r.applicationId,
    company: r.company,
    title: r.title,
    type: r.type,
    scheduledAt: r.scheduledAt,
    interviewer: r.interviewer,
  }));
}

export async function getPendingFollowUps(userId: string, limit = 5, db = getDb()): Promise<PendingFollowUp[]> {
  const nowStr = new Date().toISOString().split("T")[0];
  const rows = await db
    .select({
      id: followUps.id,
      applicationId: followUps.applicationId,
      title: followUps.title,
      dueAt: followUps.dueAt,
      company: applications.company,
      appTitle: applications.title,
    })
    .from(followUps)
    .innerJoin(applications, eq(followUps.applicationId, applications.id))
    .where(and(eq(followUps.userId, userId), eq(followUps.status, "pending"), gte(followUps.dueAt, nowStr)))
    .orderBy(asc(followUps.dueAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    applicationId: r.applicationId ?? "",
    company: r.company,
    title: r.appTitle,
    dueAt: new Date(r.dueAt),
  }));
}

export async function getRecentApplications(userId: string, limit = 5, db = getDb()): Promise<RecentApplication[]> {
  const rows = await db
    .select({
      id: applications.id,
      company: applications.company,
      title: applications.title,
      status: applications.status,
      appliedAt: applications.appliedAt,
    })
    .from(applications)
    .where(eq(applications.userId, userId))
    .orderBy(desc(applications.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    company: r.company,
    title: r.title,
    status: r.status as ApplicationStatus,
    appliedAt: new Date(r.appliedAt),
  }));
}

/** Monday 00:00 UTC of the week containing `d` (matches Postgres date_trunc('week')). */
function startOfUtcWeek(d: Date): Date {
  const monday = new Date(d);
  monday.setUTCHours(0, 0, 0, 0);
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  return monday;
}

export async function getApplicationsByWeek(userId: string, weeks = 12, db = getDb()) {
  const now = new Date();
  const currentWeekStart = startOfUtcWeek(now);
  const start = new Date(currentWeekStart);
  start.setUTCDate(start.getUTCDate() - (weeks - 1) * 7);

  // Format the bucket key in SQL: drizzle's postgres-js driver returns date OIDs as
  // raw strings, so the row value never has a toISOString() to call.
  const weekBucket = sql<string>`to_char(date_trunc('week', ${applications.createdAt}), 'YYYY-MM-DD')`;

  const rows = await db
    .select({ weekStart: weekBucket, count: count() })
    .from(applications)
    .where(and(eq(applications.userId, userId), gte(applications.createdAt, start)))
    .groupBy(weekBucket)
    .orderBy(weekBucket);

  const countsByWeek = new Map(rows.map((r) => [r.weekStart, Number(r.count)]));

  const result: { week: string; count: number }[] = [];
  const cursor = new Date(start);
  while (cursor <= now) {
    const week = cursor.toISOString().slice(0, 10);
    result.push({ week, count: countsByWeek.get(week) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }
  return result;
}

export async function getApplicationsByStatus(userId: string, db = getDb()) {
  const statuses = ["saved", "applied", "screening", "interview", "offer", "rejected", "withdrawn"] as const;
  const counts = await Promise.all(
    statuses.map((s) =>
      db.select({ count: count() }).from(applications).where(and(eq(applications.userId, userId), eq(applications.status, s))),
    ),
  );
  return statuses.map((s, i) => ({ status: s, count: Number(counts[i]?.[0]?.count ?? 0) }));
}

export async function getApplicationsBySource(userId: string, db = getDb()) {
  const sources = ["linkedin", "indeed", "company_website", "referral", "recruiter", "job_board", "networking", "other"] as const;
  const counts = await Promise.all(
    sources.map((s) =>
      db.select({ count: count() }).from(applications).where(and(eq(applications.userId, userId), eq(applications.source, s))),
    ),
  );
  return sources
    .map((s, i) => ({ source: s, count: Number(counts[i]?.[0]?.count ?? 0) }))
    .filter((c) => c.count > 0);
}

export async function getTopSkillsFromJobs(userId: string, limit = 10, db = getDb()) {
  const rows = await db
    .select({ description: applications.description })
    .from(applications)
    .where(and(eq(applications.userId, userId), sql`${applications.description} IS NOT NULL`));

  const skillCounts: Record<string, number> = {};
  const techKeywords = [
    "React", "TypeScript", "JavaScript", "Python", "Node.js", "PostgreSQL", "MongoDB", "AWS",
    "Docker", "Kubernetes", "GraphQL", "REST", "SQL", "Git", "CI/CD", "Redis", "Elasticsearch",
    "Next.js", "Vue", "Angular", "Go", "Java", "C#", "Rust", "Terraform", "Kafka", "RabbitMQ",
  ];

  for (const r of rows) {
    if (!r.description) continue;
    const text = r.description.toLowerCase();
    for (const kw of techKeywords) {
      if (text.includes(kw.toLowerCase())) {
        skillCounts[kw] = (skillCounts[kw] ?? 0) + 1;
      }
    }
  }

  return Object.entries(skillCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([skill, count]) => ({ skill, count }));
}

export async function getCompaniesApplied(userId: string, limit = 10, db = getDb()) {
  const rows = await db
    .select({ company: applications.company, count: count() })
    .from(applications)
    .where(eq(applications.userId, userId))
    .groupBy(applications.company)
    .orderBy(desc(count()))
    .limit(limit);
  return rows.map((r) => ({ company: r.company, count: Number(r.count) }));
}