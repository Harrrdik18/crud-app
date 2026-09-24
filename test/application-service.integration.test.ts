import { describe, it, expect } from "vitest";
import { makeTestDb, createTestUser } from "./helpers";
import {
  listApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  changeApplicationStatus,
  deleteApplication,
  getApplicationsByStatus,
  ApplicationError,
} from "@/services/application-service";

const { db } = makeTestDb();

const validApp = {
  company: "Acme Corp",
  title: "Senior Engineer",
  appliedAt: "2026-01-10",
  status: "applied",
};

describe("application-service integration", () => {
  it("creates and reads back an application", async () => {
    const { id } = await createTestUser(db);

    const created = await createApplication(id, validApp, db);
    expect(created.id).toBeTruthy();

    const row = await getApplicationById(id, created.id, db);
    expect(row).not.toBeNull();
    expect(row!.company).toBe("Acme Corp");
    expect(row!.title).toBe("Senior Engineer");
    expect(row!.userId).toBe(id);
    expect(row!.interviewsCount).toBe(0);
  });

  it("lists applications with pagination and defaults", async () => {
    const { id } = await createTestUser(db);
    for (let i = 0; i < 5; i++) {
      await createApplication(id, { ...validApp, title: `Engineer ${i}` }, db);
    }

    const result = await listApplications(id, { page: 1, pageSize: 2 }, db);
    expect(result.total).toBe(5);
    expect(result.data).toHaveLength(2);
    expect(result.totalPages).toBe(3);
  });

  it("filters by status and search term", async () => {
    const { id } = await createTestUser(db);
    await createApplication(id, { ...validApp, title: "Frontend Engineer", status: "applied" }, db);
    await createApplication(id, { ...validApp, title: "Backend Engineer", status: "interview" }, db);

    const byStatus = await listApplications(id, { status: "interview", pageSize: 20 }, db);
    expect(byStatus.total).toBe(1);
    expect(byStatus.data[0].title).toBe("Backend Engineer");

    const bySearch = await listApplications(id, { q: "frontend", pageSize: 20 }, db);
    expect(bySearch.total).toBe(1);
  });

  it("does not leak rows across users", async () => {
    const u1 = await createTestUser(db);
    const u2 = await createTestUser(db);

    await createApplication(u1.id, validApp, db);
    const others = await listApplications(u2.id, { pageSize: 20 }, db);
    expect(others.total).toBe(0);
  });

  it("updates an application in place", async () => {
    const { id } = await createTestUser(db);
    const created = await createApplication(id, validApp, db);

    await updateApplication(id, created.id, { title: "Principal Engineer", location: "Remote" }, db);
    const row = await getApplicationById(id, created.id, db);
    expect(row!.title).toBe("Principal Engineer");
    expect(row!.location).toBe("Remote");
  });

  it("records status history on status change", async () => {
    const { id } = await createTestUser(db);
    const created = await createApplication(id, validApp, db);

    await changeApplicationStatus(id, created.id, { status: "interview" }, db);
    await changeApplicationStatus(id, created.id, { status: "offer", note: "Went well!" }, db);

    const row = await getApplicationById(id, created.id, db);
    expect(row!.status).toBe("offer");
  });

  it("rejects unknown applications with NOT_FOUND", async () => {
    const { id } = await createTestUser(db);
    await expect(
      deleteApplication(id, "00000000-0000-0000-0000-000000000000", db),
    ).rejects.toThrow(ApplicationError);
  });

  it("rejects invalid input with VALIDATION", async () => {
    const { id } = await createTestUser(db);
    await expect(
      createApplication(id, { ...validApp, appliedAt: "not-a-date" }, db),
    ).rejects.toMatchObject({ code: "VALIDATION" });
  });

  it("groups applications by status for the pipeline", async () => {
    const { id } = await createTestUser(db);
    await createApplication(id, { ...validApp, status: "applied" }, db);
    await createApplication(id, { ...validApp, title: "Second", status: "interview" }, db);

    const grouped = await getApplicationsByStatus(id, db);
    expect(grouped.applied).toHaveLength(1);
    expect(grouped.interview).toHaveLength(1);
    expect(grouped.offer).toHaveLength(0);
  });
});