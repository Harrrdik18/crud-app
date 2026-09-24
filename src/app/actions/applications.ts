"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  createApplication,
  updateApplication,
  changeApplicationStatus,
  deleteApplication,
  ApplicationError,
} from "@/services/application-service";

export interface ActionResult {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof ApplicationError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

export async function createApplicationAction(
  prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authenticated" };

  const input = {
    company: formData.get("company"),
    title: formData.get("title"),
    url: formData.get("url") || null,
    location: formData.get("location") || null,
    employmentType: formData.get("employmentType") || null,
    salaryMin: formData.get("salaryMin") ? Number(formData.get("salaryMin")) : null,
    salaryMax: formData.get("salaryMax") ? Number(formData.get("salaryMax")) : null,
    salaryCurrency: formData.get("salaryCurrency") || null,
    salaryInterval: formData.get("salaryInterval") || null,
    experience: formData.get("experience") || null,
    description: formData.get("description") || null,
    status: formData.get("status") || "applied",
    appliedAt: formData.get("appliedAt"),
    source: formData.get("source") || null,
    notes: formData.get("notes") || null,
  };

  try {
    await createApplication(user.id, input);
  } catch (err) {
    return { error: getErrorMessage(err) };
  }

  revalidatePath("/applications");
  revalidatePath("/dashboard");
  redirect("/applications");
}

export async function updateApplicationAction(
  applicationId: string,
  prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authenticated" };

  const input = {
    company: formData.get("company"),
    title: formData.get("title"),
    url: formData.get("url") || null,
    location: formData.get("location") || null,
    employmentType: formData.get("employmentType") || null,
    salaryMin: formData.get("salaryMin") ? Number(formData.get("salaryMin")) : null,
    salaryMax: formData.get("salaryMax") ? Number(formData.get("salaryMax")) : null,
    salaryCurrency: formData.get("salaryCurrency") || null,
    salaryInterval: formData.get("salaryInterval") || null,
    experience: formData.get("experience") || null,
    description: formData.get("description") || null,
    status: formData.get("status"),
    appliedAt: formData.get("appliedAt"),
    source: formData.get("source") || null,
    notes: formData.get("notes") || null,
  };

  try {
    await updateApplication(user.id, applicationId, input);
  } catch (err) {
    return { error: getErrorMessage(err) };
  }

  revalidatePath("/applications");
  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/dashboard");
  redirect(`/applications/${applicationId}`);
}

export async function changeStatusAction(
  applicationId: string,
  prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authenticated" };

  const input = {
    status: formData.get("status"),
    note: formData.get("note") || null,
  };

  try {
    await changeApplicationStatus(user.id, applicationId, input);
  } catch (err) {
    return { error: getErrorMessage(err) };
  }

  revalidatePath("/applications");
  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/dashboard");
  redirect(`/applications/${applicationId}`);
}

export async function deleteApplicationAction(applicationId: string): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  try {
    await deleteApplication(user.id, applicationId);
  } catch (err) {
    console.error("deleteApplication failed", err);
  }

  revalidatePath("/applications");
  revalidatePath("/dashboard");
  redirect("/applications");
}