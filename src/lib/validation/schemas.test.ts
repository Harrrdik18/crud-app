import { describe, it, expect } from "vitest";
import {
  applicationSchema,
  statusChangeSchema,
  registerSchema,
  loginSchema,
  changePasswordSchema,
  applicationQuerySchema,
  interviewSchema,
  followUpSchema,
  resumeSchema,
  jobAnalysisRequestSchema,
  safeParse,
} from "@/lib/validation/schemas";

describe("auth schemas", () => {
  it("accepts a valid registration", () => {
    const r = registerSchema.safeParse({
      name: "Jane Doe",
      email: "JANE@Example.com",
      password: "longenough",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("jane@example.com");
      expect(r.data.name).toBe("Jane Doe");
    }
  });

  it("rejects a short password", () => {
    expect(registerSchema.safeParse({ name: "a", email: "a@b.com", password: "short" }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
  });

  it("validates changePasswordSchema", () => {
    expect(changePasswordSchema.safeParse({ currentPassword: "a", newPassword: "12345678" }).success).toBe(true);
    expect(changePasswordSchema.safeParse({ currentPassword: "", newPassword: "12345678" }).success).toBe(false);
  });
});

describe("applicationSchema", () => {
  it("accepts a minimal valid application", () => {
    const r = applicationSchema.safeParse({
      company: "Acme",
      title: "Engineer",
      appliedAt: "2026-01-05",
    });
    expect(r.success).toBe(true);
  });

  it("coerces empty salary/url fields to null", () => {
    const r = applicationSchema.safeParse({
      company: "Acme",
      title: "Engineer",
      appliedAt: "2026-01-05",
      url: "",
      salaryMin: null,
      salaryMax: "",
      source: "",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.url).toBeNull();
      expect(r.data.salaryMin).toBeNull();
      expect(r.data.salaryMax).toBeNull();
      expect(r.data.source).toBeNull();
    }
  });

  it("rejects a bad appliedAt date", () => {
    expect(
      applicationSchema.safeParse({ company: "Acme", title: "Engineer", appliedAt: "05/01/2026" }).success,
    ).toBe(false);
  });

  it("rejects a non-numeric salary", () => {
    expect(
      applicationSchema.safeParse({
        company: "Acme",
        title: "Engineer",
        appliedAt: "2026-01-05",
        salaryMin: "lots",
      }).success,
    ).toBe(false);
  });
});

describe("statusChangeSchema", () => {
  it("accepts known statuses", () => {
    expect(statusChangeSchema.safeParse({ status: "interview" }).success).toBe(true);
    expect(statusChangeSchema.safeParse({ status: "bogus" }).success).toBe(false);
  });
});

describe("applicationQuerySchema", () => {
  it("applies defaults", () => {
    const r = applicationQuerySchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.sort).toBe("newest");
      expect(r.data.status).toBeNull();
    }
  });

  it("parses string numbers from URL params", () => {
    const r = applicationQuerySchema.safeParse({ page: "3", pageSize: "50" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.page).toBe(3);
  });
});

describe("interviewSchema / followUpSchema", () => {
  it("orders interviews video by default", () => {
    const r = interviewSchema.safeParse({ applicationId: "1", scheduledAt: "2026-02-01T10:00" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.type).toBe("video");
  });

  it("validates follow-up due date format", () => {
    expect(followUpSchema.safeParse({ title: "Follow up", dueAt: "2026-01-10" }).success).toBe(true);
    expect(followUpSchema.safeParse({ title: "Follow up", dueAt: "Jan 10" }).success).toBe(false);
  });
});

describe("jobAnalysisRequestSchema", () => {
  it("requires a description of at least 50 chars", () => {
    expect(jobAnalysisRequestSchema.safeParse({ description: "too short" }).success).toBe(false);
    expect(
      jobAnalysisRequestSchema.safeParse({ description: "x".repeat(60) }).success,
    ).toBe(true);
  });
});

describe("resumeSchema", () => {
  it("defaults empty arrays and title", () => {
    const r = resumeSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.experiences).toEqual([]);
      expect(r.data.title).toBe("My Resume");
    }
  });
});

describe("firstIssue / safeParse", () => {
  it("includes the field path in errors", () => {
    const result = safeParse(registerSchema, {
      name: "Jane",
      email: "jane@example.com",
      password: "x",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toContain("password");
  });

  it("returns typed data on success", () => {
    const result = safeParse(loginSchema, { email: "a@b.com", password: "ok" });
    expect(result.success).toBe(true);
  });
});