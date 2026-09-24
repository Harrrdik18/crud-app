import { describe, it, expect } from "vitest";
import { makeTestDb, createTestUser } from "./helpers";
import { createApplication } from "@/services/application-service";
import {
  createFollowUp,
  listFollowUps,
  updateFollowUp,
  getFollowUpById,
} from "@/services/followup-service";

const { db } = makeTestDb();

async function userWithApp() {
  const { id } = await createTestUser(db);
  const { id: appId } = await createApplication(
    id,
    { company: "Corp", title: "Engineer", appliedAt: "2026-02-01" },
    db,
  );
  return { userId: id, appId };
}

describe("followup-service integration", () => {
  it("creates and lists follow-ups, sorted by due date", async () => {
    const { userId, appId } = await userWithApp();
    await createFollowUp(userId, { applicationId: appId, title: "First", dueAt: "2026-03-05" }, db);
    await createFollowUp(userId, { applicationId: appId, title: "Second", dueAt: "2026-03-01" }, db);

    const list = await listFollowUps(userId, { pageSize: 20 }, db);
    expect(list.total).toBe(2);
    expect(list.data[0].title).toBe("Second"); // earlier due date first
    expect(list.data[0].company).toBe("Corp");
  });

  it("marks a follow-up done and records completedAt", async () => {
    const { userId, appId } = await userWithApp();
    const { id } = await createFollowUp(userId, { applicationId: appId, title: "Call", dueAt: "2026-03-05" }, db);

    await updateFollowUp(userId, id, { status: "done" }, db);
    const row = await getFollowUpById(userId, id, db);
    expect(row!.status).toBe("done");
    expect(row!.completedAt).not.toBeNull();

    await updateFollowUp(userId, id, { status: "pending" }, db);
    const reopened = await getFollowUpById(userId, id, db);
    expect(reopened!.completedAt).toBeNull();
  });

  it("filters by status", async () => {
    const { userId, appId } = await userWithApp();
    await createFollowUp(userId, { applicationId: appId, title: "Pending", dueAt: "2026-03-05" }, db);
    const { id } = await createFollowUp(userId, { applicationId: appId, title: "Done", dueAt: "2026-03-06" }, db);
    await updateFollowUp(userId, id, { status: "done" }, db);

    const pending = await listFollowUps(userId, { status: "pending", pageSize: 20 }, db);
    expect(pending.total).toBe(1);
  });

  it("does not leak follow-ups across users", async () => {
    const { userId, appId } = await userWithApp();
    await createFollowUp(userId, { applicationId: appId, title: "Mine", dueAt: "2026-03-05" }, db);

    const other = await createTestUser(db);
    const list = await listFollowUps(other.id, { pageSize: 20 }, db);
    expect(list.total).toBe(0);
  });
});