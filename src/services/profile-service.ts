import { eq } from "drizzle-orm";
import {
  profiles,
  resumes,
  skills,
  type Experience,
  type Education,
  type Project,
} from "@/db/schema";
import { getDb } from "@/db";
import { profileSchema, resumeSchema, skillsBulkSchema } from "@/lib/validation/schemas";

export class ProfileError extends Error {
  constructor(
    message: string,
    public code: "NOT_FOUND" | "UNAUTHORIZED" | "VALIDATION" | "DATABASE",
  ) {
    super(message);
    this.name = "ProfileError";
  }
}

export async function getProfile(userId: string, db = getDb()) {
  const rows = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function updateProfile(
  userId: string,
  input: unknown,
  db = getDb(),
): Promise<void> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new ProfileError(issue?.message ?? "Invalid input", "VALIDATION");
  }

  const existing = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.userId, userId)).limit(1);

  if (existing.length === 0) {
    await db.insert(profiles).values({ userId, ...parsed.data });
  } else {
    await db
      .update(profiles)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(profiles.userId, userId));
  }
}

export async function getResume(userId: string, db = getDb()) {
  const rows = await db.select().from(resumes).where(eq(resumes.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function updateResume(
  userId: string,
  input: unknown,
  db = getDb(),
): Promise<void> {
  const parsed = resumeSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new ProfileError(issue?.message ?? "Invalid input", "VALIDATION");
  }

  const existing = await db.select({ id: resumes.id }).from(resumes).where(eq(resumes.userId, userId)).limit(1);

  if (existing.length === 0) {
    await db.insert(resumes).values({ userId, ...parsed.data });
  } else {
    await db
      .update(resumes)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(resumes.userId, userId));
  }
}

export async function getSkills(userId: string, db = getDb()) {
  const rows = await db
    .select()
    .from(skills)
    .where(eq(skills.userId, userId))
    .orderBy(skills.name);
  return rows;
}

export async function upsertSkills(
  userId: string,
  input: unknown,
  db = getDb(),
): Promise<void> {
  const parsed = skillsBulkSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new ProfileError(issue?.message ?? "Invalid input", "VALIDATION");
  }

  await db.transaction(async (tx) => {
    await tx.delete(skills).where(eq(skills.userId, userId));

    if (parsed.data.skills.length > 0) {
      await tx.insert(skills).values(
        parsed.data.skills.map((s) => ({ userId, ...s })),
      );
    }
  });
}