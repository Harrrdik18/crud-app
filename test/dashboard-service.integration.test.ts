import { describe, it, expect } from "vitest";
import { makeTestDb, createTestUser } from "./helpers";
import { createApplication } from "@/services/application-service";
import { getApplicationsByWeek } from "@/services/dashboard-service";

const { db } = makeTestDb();

describe("dashboard-service integration", () => {
  it("buckets applications by ISO week without crashing", async () => {
    const { id } = await createTestUser(db);
    await createApplication(
      id,
      { company: "Acme", title: "Engineer", appliedAt: "2026-09-24" },
      db,
    );

    const weeks = await getApplicationsByWeek(id, 12, db);

    expect(weeks).toHaveLength(12);

    // date_trunc('week') is Monday-anchored; every bucket key must be a Monday.
    for (const w of weeks) {
      expect(w.week).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(`${w.week}T00:00:00Z`).getUTCDay()).toBe(1);
    }

    // The app created "now" lands in the current (last) week, not a zeroed bucket.
    const total = weeks.reduce((sum, w) => sum + w.count, 0);
    expect(total).toBe(1);
    expect(weeks[weeks.length - 1]!.count).toBe(1);
  });

  it("does not leak weekly counts across users", async () => {
    const u1 = await createTestUser(db);
    const u2 = await createTestUser(db);
    await createApplication(
      u1.id,
      { company: "Acme", title: "Engineer", appliedAt: "2026-09-24" },
      db,
    );

    const weeks = await getApplicationsByWeek(u2.id, 12, db);
    expect(weeks).toHaveLength(12);
    expect(weeks.every((w) => w.count === 0)).toBe(true);
  });
});
