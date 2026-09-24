import { describe, it, expect } from "vitest";
import { makeTestDb, createTestUser } from "./helpers";
import { createApplication } from "@/services/application-service";
import { createInterview, listInterviews, updateInterview, InterviewError } from "@/services/interview-service";

const { db } = makeTestDb();

async function userWithApp() {
  const { id } = await createTestUser(db);
  const { id: appId } = await createApplication(
    id,
    { company: "Corp", title: "Engineer", appliedAt: "2026-02-01", status: "interview" },
    db,
  );
  return { userId: id, appId };
}

describe("interview-service integration", () => {
  it("creates and reads an interview linked to an application", async () => {
    const { userId, appId } = await userWithApp();
    const created = await createInterview(
      userId,
      {
        applicationId: appId,
        type: "technical",
        scheduledAt: "2026-03-01T10:00",
        interviewer: "Sam R.",
      },
      db,
    );

    const interviews = await listInterviews(userId, { pageSize: 20 }, db);
    expect(interviews.total).toBe(1);
    expect(interviews.data[0].company).toBe("Corp");
    expect(interviews.data[0].type).toBe("technical");
    expect(interviews.data[0].interviewer).toBe("Sam R.");
  });

  it("rejects interviews for an application the user does not own", async () => {
    const other = await userWithApp();
    const { id } = await createTestUser(db);
    await expect(
      createInterview(
        id,
        { applicationId: other.appId, scheduledAt: "2026-03-01T10:00" },
        db,
      ),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("updates interview fields", async () => {
    const { userId, appId } = await userWithApp();
    const { id } = await createInterview(
      userId,
      { applicationId: appId, scheduledAt: "2026-03-01T10:00" },
      db,
    );
    await updateInterview(userId, id, { result: "passed", feedback: "Great!" }, db);

    const [row] = (await listInterviews(userId, { pageSize: 20 }, db)).data;
    expect(row.result).toBe("passed");
    expect(row.feedback).toBe("Great!");
  });

  it("throws when updating a nonexistent interview", async () => {
    const { id } = await createTestUser(db);
    await expect(
      updateInterview(id, "00000000-0000-0000-0000-000000000000", { result: "passed" }, db),
    ).rejects.toThrow(InterviewError);
  });
});