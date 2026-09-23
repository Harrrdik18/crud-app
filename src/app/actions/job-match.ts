"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import {
  createJobAnalysis,
  MatchError,
} from "@/services/job-match-service";

export interface MatchActionResult {
  ok?: boolean;
  error?: string;
  result?: {
    analysisId: string;
    jobTitle: string;
    company: string;
    requiredSkills: string[];
    preferredSkills: string[];
    technologies: string[];
    responsibilities: string[];
    experience: string | null;
    overallScore: number;
    matchingSkills: string[];
    gapSkills: string[];
    depthAssessment: number | null;
    areaAssessments: { area: string; score: number }[];
    experienceMet: { meets: boolean; required: string | null; candidate: string | null };
    disclaimer: string;
  };
}

export async function analyzeJobAction(
  prev: MatchActionResult | undefined,
  formData: FormData,
): Promise<MatchActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authenticated" };

  const input = {
    jobTitle: (formData.get("jobTitle") as string) || undefined,
    company: (formData.get("company") as string) || undefined,
    description: (formData.get("description") as string) || "",
    applicationId: formData.get("applicationId") ? String(formData.get("applicationId")) : undefined,
  };

  try {
    const { analysis, match } = await createJobAnalysis(user.id, input);
    revalidatePath("/analytics");
    return {
      ok: true,
      result: {
        analysisId: analysis.id,
        jobTitle: analysis.jobTitle,
        company: analysis.company,
        requiredSkills: analysis.requiredSkills,
        preferredSkills: analysis.preferredSkills,
        technologies: analysis.technologies,
        responsibilities: analysis.responsibilities,
        experience: analysis.experience,
        overallScore: match?.overallScore ?? 0,
        matchingSkills: match?.matchingSkills ?? [],
        gapSkills: match?.gapSkills ?? [],
        depthAssessment: match?.depthAssessment ?? null,
        areaAssessments: match?.areaAssessments ?? [],
        experienceMet: match?.experienceMet ?? { meets: true, required: null, candidate: null },
        disclaimer: match?.disclaimer ?? "",
      },
    };
  } catch (err) {
    if (err instanceof MatchError) return { error: err.message };
    console.error("analyze job failed", err);
    return { error: "Something went wrong. Please try again." };
  }
}