"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  createInterview,
  updateInterview,
  deleteInterview,
  InterviewError,
} from "@/services/interview-service";
import {
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
  FollowUpError,
} from "@/services/followup-service";

export interface ActionResult {
  ok?: boolean;
  error?: string;
}

function getError(err: unknown): string {
  if (err instanceof InterviewError) return err.message;
  if (err instanceof FollowUpError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

export async function createInterviewAction(
  prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authenticated" };

  const input = {
    applicationId: formData.get("applicationId"),
    type: formData.get("type") || "video",
    scheduledAt: formData.get("scheduledAt"),
    durationMinutes: formData.get("durationMinutes") ? Number(formData.get("durationMinutes")) : null,
    interviewer: formData.get("interviewer") || null,
    location: formData.get("location") || null,
    notes: formData.get("notes") || null,
    result: formData.get("result") || "unknown",
    feedback: formData.get("feedback") || null,
  };

  try {
    await createInterview(user.id, input);
  } catch (err) {
    return { error: getError(err) };
  }

  revalidatePath("/interviews");
  revalidatePath("/dashboard");
  redirect("/interviews");
}

export async function updateInterviewAction(
  interviewId: string,
  prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authenticated" };

  const input = {
    applicationId: formData.get("applicationId"),
    type: formData.get("type"),
    scheduledAt: formData.get("scheduledAt"),
    durationMinutes: formData.get("durationMinutes") ? Number(formData.get("durationMinutes")) : null,
    interviewer: formData.get("interviewer") || null,
    location: formData.get("location") || null,
    notes: formData.get("notes") || null,
    result: formData.get("result"),
    feedback: formData.get("feedback") || null,
  };

  try {
    await updateInterview(user.id, interviewId, input);
  } catch (err) {
    return { error: getError(err) };
  }

  revalidatePath("/interviews");
  revalidatePath(`/interviews/${interviewId}`);
  revalidatePath("/dashboard");
  redirect(`/interviews/${interviewId}`);
}

export async function deleteInterviewAction(interviewId: string): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  try {
    await deleteInterview(user.id, interviewId);
  } catch (err) {
    console.error("deleteInterview failed", err);
  }

  revalidatePath("/interviews");
  revalidatePath("/dashboard");
  redirect("/interviews");
}

export async function createFollowUpAction(
  prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authenticated" };

  const input = {
    applicationId: formData.get("applicationId") || null,
    title: formData.get("title"),
    dueAt: formData.get("dueAt"),
    status: formData.get("status") || "pending",
    notes: formData.get("notes") || null,
  };

  try {
    await createFollowUp(user.id, input);
  } catch (err) {
    return { error: getError(err) };
  }

  revalidatePath("/follow-ups");
  revalidatePath("/dashboard");
  redirect("/follow-ups");
}

export async function updateFollowUpAction(
  followUpId: string,
  prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authenticated" };

  const input = {
    applicationId: formData.get("applicationId") || null,
    title: formData.get("title"),
    dueAt: formData.get("dueAt"),
    status: formData.get("status"),
    notes: formData.get("notes") || null,
  };

  try {
    await updateFollowUp(user.id, followUpId, input);
  } catch (err) {
    return { error: getError(err) };
  }

  revalidatePath("/follow-ups");
  revalidatePath(`/follow-ups/${followUpId}`);
  revalidatePath("/dashboard");
  redirect(`/follow-ups/${followUpId}`);
}

export async function deleteFollowUpAction(followUpId: string): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  try {
    await deleteFollowUp(user.id, followUpId);
  } catch (err) {
    console.error("deleteFollowUp failed", err);
  }

  revalidatePath("/follow-ups");
  revalidatePath("/dashboard");
  redirect("/follow-ups");
}