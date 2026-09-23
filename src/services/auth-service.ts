import { eq } from "drizzle-orm";
import { users, profiles, resumes } from "@/db/schema";
import { getDb } from "@/db";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { createSession, getUserById } from "@/lib/session";
import { registerSchema, loginSchema, type RegisterInput, type LoginInput } from "@/lib/validation/schemas";

export class AuthError extends Error {
  constructor(
    message: string,
    public code:
      | "EMAIL_TAKEN"
      | "INVALID_CREDENTIALS"
      | "VALIDATION"
      | "DATABASE",
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export interface RegisteredUser {
  id: string;
  email: string;
  name: string;
  sessionToken: string;
}

export async function registerUser(
  input: unknown,
  db = getDb(),
  ipAddress?: string | null,
): Promise<RegisteredUser> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new AuthError(issue?.message ?? "Invalid input", "VALIDATION");
  }
  const { name, email, password } = parsed.data;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) {
    throw new AuthError("An account with this email already exists", "EMAIL_TAKEN");
  }

  const passwordHash = await hashPassword(password);

  try {
    const result = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ name, email, passwordHash })
        .returning({ id: users.id, email: users.email, name: users.name });

      await tx.insert(profiles).values({ userId: user.id });
      await tx.insert(resumes).values({ userId: user.id });

      return user;
    });

    const session = await createSession(db, result.id, ipAddress);
    return { id: result.id, email: result.email, name: result.name, sessionToken: session.token! };
  } catch (err) {
    // Unique constraint race on email -> treat as taken.
    if (err instanceof Error && err.message.includes("unique")) {
      throw new AuthError("An account with this email already exists", "EMAIL_TAKEN");
    }
    throw new AuthError("Could not create your account. Please try again.", "DATABASE");
  }
}

export async function authenticateUser(
  input: unknown,
  db = getDb(),
  ipAddress?: string | null,
): Promise<{ user: { id: string }; sessionToken: string }> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new AuthError(issue?.message ?? "Invalid input", "VALIDATION");
  }
  const { email, password } = parsed.data;

  const rows = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const row = rows[0];
  // Constant-ish time guard: still run a hash if user missing.
  const dummyHash =
    "scrypt$g$8$1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  const hash = row?.passwordHash ?? dummyHash;
  const ok = await verifyPassword(password, hash);
  if (!row || !ok) {
    throw new AuthError("Invalid email or password", "INVALID_CREDENTIALS");
  }

  const session = await createSession(db, row.id, ipAddress);
  return { user: { id: row.id }, sessionToken: session.token! };
}

export async function fullUserProfile(userId: string, db = getDb()) {
  const user = await getUserById(userId, db);
  if (!user) return null;
  const profileRows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  return { user, profile: profileRows[0] ?? null };
}