"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  updateProfile,
  updateResume,
  upsertSkills,
  ProfileError,
} from "@/services/profile-service";
import { skillsBulkSchema } from "@/lib/validation/schemas";

export interface ActionResult {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function getError(err: unknown): string {
  if (err instanceof ProfileError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

export async function updateProfileAction(
  prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authenticated" };

  const input = {
    headline: formData.get("headline") || null,
    location: formData.get("location") || null,
    bio: formData.get("bio") || null,
    githubUrl: formData.get("githubUrl") || null,
    linkedinUrl: formData.get("linkedinUrl") || null,
    websiteUrl: formData.get("websiteUrl") || null,
  };

  try {
    await updateProfile(user.id, input);
  } catch (err) {
    return { error: getError(err) };
  }

  revalidatePath("/profile");
  revalidatePath("/resume");
  redirect("/profile");
}

export async function updateResumeAction(
  prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authenticated" };

  const parseArray = (key: string) => {
    const val = formData.get(key);
    if (!val) return [];
    try {
      return JSON.parse(val as string);
    } catch {
      return [];
    }
  };

  const input = {
    title: formData.get("title") || "My Resume",
    summary: formData.get("summary") || null,
    yearsExperience: formData.get("yearsExperience") ? Number(formData.get("yearsExperience")) : null,
    targetRole: formData.get("targetRole") || null,
    targetLocation: formData.get("targetLocation") || null,
    experiences: parseArray("experiences"),
    education: parseArray("education"),
    projects: parseArray("projects"),
  };

  try {
    await updateResume(user.id, input);

    const skillsStr = formData.get("skills");
    if (skillsStr) {
      const skillNames = String(skillsStr)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const parsedSkills = skillsBulkSchema.safeParse({
        skills: skillNames.map((name) => ({ name, kind: "technology" as const })),
      });
      if (parsedSkills.success) {
        await upsertSkills(user.id, parsedSkills.data);
      }
    }
  } catch (err) {
    return { error: getError(err) };
  }

  revalidatePath("/resume");
  revalidatePath("/profile");
  redirect("/resume");
}

export async function upsertSkillsAction(
  prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authenticated" };

  const skillsStr = formData.get("skills");
  if (!skillsStr) return { error: "No skills data" };

  let skills: { name: string; kind: string; level?: string }[];
  try {
    skills = JSON.parse(skillsStr as string);
  } catch {
    return { error: "Invalid skills JSON" };
  }

  const parsed = skillsBulkSchema.safeParse({ skills });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue?.message ?? "Invalid skills data" };
  }

  try {
    await upsertSkills(user.id, parsed.data);
  } catch (err) {
    return { error: getError(err) };
  }

  revalidatePath("/resume");
  revalidatePath("/profile");
  redirect("/resume");
}