import { eq, and, desc } from "drizzle-orm";
import { jobAnalyses, matches, applications } from "@/db/schema";
import { getDb } from "@/db";
import { analyzeJob, skillMatches } from "@/lib/analyzer";
import { jobAnalysisRequestSchema } from "@/lib/validation/schemas";
import { getResume, getSkills } from "@/services/profile-service";
import { analyzeWithAi, isAiConfigured } from "@/lib/ai";
import type { JobAnalysisData } from "@/db/schema";

export class MatchError extends Error {
  constructor(
    message: string,
    public code: "NOT_FOUND" | "VALIDATION" | "AI_UNAVAILABLE" | "DATABASE",
  ) {
    super(message);
    this.name = "MatchError";
  }
}

export interface MatchRequest {
  jobTitle?: string;
  company?: string;
  description: string;
  applicationId?: string;
}

export interface MatchResult {
  analysis: {
    id: string;
    jobTitle: string;
    company: string;
    requiredSkills: string[];
    preferredSkills: string[];
    technologies: string[];
    responsibilities: string[];
    keywords: string[];
    experience: string | null;
    method: string;
    createdAt: Date;
  };
  match: {
    id: string;
    overallScore: number;
    matchingSkills: string[];
    gapSkills: string[];
    depthAssessment: number | null;
    areaAssessments: { area: string; score: number }[];
    experienceMet: { meets: boolean; required: string | null; candidate: string | null };
    method: string;
    disclaimer: string;
    createdAt: Date;
  } | null;
}

export async function getSkillNames(userId: string, db = getDb()): Promise<string[]> {
  const rows = await getSkills(userId, db);
  return rows.map((s) => s.name);
}

export async function getResumeSummary(userId: string, db = getDb()): Promise<string> {
  const resume = await getResume(userId, db);
  if (!resume) return "";
  const chunks: string[] = [];
  if (resume.summary) chunks.push(resume.summary);
  if (resume.targetRole) chunks.push(`Target role: ${resume.targetRole}`);
  for (const exp of resume.experiences) {
    chunks.push(`Worked at ${exp.company} as ${exp.role}`);
  }
  for (const proj of resume.projects) {
    chunks.push(`Built: ${proj.name} - ${proj.description ?? ""}`);
  }
  return chunks.join("\n");
}

async function ensureApplicationOwnership(
  userId: string,
  applicationId: string | undefined,
  db = getDb(),
): Promise<void> {
  if (!applicationId) return;
  const row = await db
    .select({ id: applications.id })
    .from(applications)
    .where(and(eq(applications.id, applicationId), eq(applications.userId, userId)))
    .limit(1);
  if (row.length === 0) {
    throw new MatchError("Application not found", "NOT_FOUND");
  }
}

export async function createJobAnalysis(
  userId: string,
  req: MatchRequest,
  db = getDb(),
): Promise<MatchResult> {
  const parsed = jobAnalysisRequestSchema.safeParse(req);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new MatchError(issue?.message ?? "Invalid job description", "VALIDATION");
  }

  await ensureApplicationOwnership(userId, req.applicationId, db);

  const sourceText = `${req.jobTitle ?? ""}\n${req.company ?? ""}\n${req.description}`.trim();
  const sourceTextHash = hashText(sourceText);

  const analyzed = analyzeJob({
    jobTitle: req.jobTitle,
    company: req.company,
    description: req.description,
  });

  let effective = analyzed;
  let method = analyzed.method;
  if (isAiConfigured()) {
    try {
      const [resumeSummary, candidateSkills] = await Promise.all([
        getResumeSummary(userId, db),
        getSkillNames(userId, db),
      ]);
      const ai = await analyzeWithAi({
        jobTitle: req.jobTitle,
        company: req.company,
        description: req.description,
        resumeSummary,
        skills: candidateSkills,
      });
      effective = {
        ...analyzed,
        requiredSkills: ai.requiredSkills.length ? ai.requiredSkills : analyzed.requiredSkills,
        preferredSkills: ai.preferredSkills.length ? ai.preferredSkills : analyzed.preferredSkills,
        technologies: ai.technologies.length ? ai.technologies : analyzed.technologies,
        responsibilities: ai.responsibilities.length ? ai.responsibilities : analyzed.responsibilities,
        experience: ai.experience ?? analyzed.experience,
      };
      method = "ai";
    } catch (err) {
      console.error("AI analysis failed, using heuristic", err instanceof Error ? err.message : err);
      method = "heuristic-fallback";
    }
  }

  const analysisData: JobAnalysisData = {
    requiredSkills: effective.requiredSkills,
    preferredSkills: effective.preferredSkills,
    technologies: effective.technologies,
    responsibilities: effective.responsibilities,
    keywords: effective.keywords,
    experience: effective.experience,
    backend: false,
  };

  const [row] = await db
    .insert(jobAnalyses)
    .values({
      userId,
      applicationId: req.applicationId ?? null,
      sourceTextHash,
      title: effective.jobTitle,
      company: effective.company,
      data: analysisData,
      method,
    })
    .returning({ id: jobAnalyses.id, createdAt: jobAnalyses.createdAt });

  const match = await computeAndStoreMatch(userId, row.id, effective, db);

  return {
    analysis: {
      id: row.id,
      jobTitle: effective.jobTitle,
      company: effective.company,
      requiredSkills: effective.requiredSkills,
      preferredSkills: effective.preferredSkills,
      technologies: effective.technologies,
      responsibilities: effective.responsibilities,
      keywords: effective.keywords,
      experience: effective.experience,
      method,
      createdAt: row.createdAt,
    },
    match,
  };
}

interface InternalAnalysis {
  requiredSkills: string[];
  preferredSkills: string[];
  technologies: string[];
  responsibilities: string[];
  keywords: string[];
  experience: string | null;
  jobTitle: string;
  company: string;
  normalized: string;
  method: string;
}

async function computeAndStoreMatch(
  userId: string,
  analysisId: string,
  analyzed: InternalAnalysis,
  db = getDb(),
): Promise<MatchResult["match"]> {
  const candidateSkills = await getSkillNames(userId, db);
  const resume = await getResume(userId, db);
  const resumeYears =
    resume?.yearsExperience ??
    (resume?.experiences.some((e) => e.current) ? 3 : null);

  const { matchingSkills, gapSkills } = skillMatches(
    candidateSkills,
    [...analyzed.requiredSkills, ...analyzed.preferredSkills],
  );

  const requiredCount = analyzed.requiredSkills.length;
  const matchCount = analyzed.requiredSkills.filter((s) =>
    candidateSkills.some((c) =>
      c.toLowerCase().includes(s) || s.includes(c.toLowerCase())
    ),
  ).length;

  const skillScore = Math.round(
    requiredCount === 0
      ? 60
      : (matchCount / requiredCount) * 100,
  );

  const depthAssessment =
    requiredCount === 0 ? null : Math.round((matchCount / requiredCount) * 100);

  // Experience match
  let meets = true;
  const required = analyzed.experience;
  const candidate = resumeYears ? `${resumeYears} years` : "Not specified";
  if (required) {
    const reqYrs = parseInt(required, 10);
    const candYrs = resumeYears ?? 0;
    meets = candYrs >= reqYrs;
  }

  const experienceScore = Math.round(meets ? 90 : 55);

  const areas: { area: string; score: number }[] = [
    { area: "Core skills", score: skillScore },
    { area: "Experience", score: experienceScore },
    { area: "Tech stack", score: skillScore },
  ];

  const overallScore = Math.round(
    Math.min(100, (skillScore * 0.55 + experienceScore * 0.3 + skillScore * 0.15) * 0.4 + 40),
  );

  const disclaimer =
    "Estimated via Heuristic Analysis. This is not an official assessment - use it as a guide.";

  const [row] = await db
    .insert(matches)
    .values({
      userId,
      applicationId: null,
      analysisId,
      jobTitle: analyzed.jobTitle,
      company: analyzed.company,
      overallScore,
      matchingSkills,
      gapSkills,
      depthAssessment,
      areaAssessments: areas,
      experienceMet: { meets, required, candidate },
      method: "heuristic",
      disclaimer,
    })
    .returning({ id: matches.id, createdAt: matches.createdAt });

  return {
    id: row.id,
    overallScore,
    matchingSkills,
    gapSkills,
    depthAssessment,
    areaAssessments: areas,
    experienceMet: { meets, required, candidate },
    method: "heuristic",
    disclaimer,
    createdAt: row.createdAt,
  };
}

export async function getLatestMatch(userId: string, db = getDb()) {
  const rows = await db
    .select({
      id: matches.id,
      jobTitle: matches.jobTitle,
      company: matches.company,
      overallScore: matches.overallScore,
      matchingSkills: matches.matchingSkills,
      gapSkills: matches.gapSkills,
      depthAssessment: matches.depthAssessment,
      areaAssessments: matches.areaAssessments,
      experienceMet: matches.experienceMet,
      method: matches.method,
      disclaimer: matches.disclaimer,
      createdAt: matches.createdAt,
    })
    .from(matches)
    .where(eq(matches.userId, userId))
    .orderBy(desc(matches.createdAt))
    .limit(1);

  return rows[0] ?? null;
}

export async function getMatchForApplication(
  userId: string,
  applicationId: string,
  db = getDb(),
) {
  const rows = await db
    .select({
      id: matches.id,
      jobTitle: matches.jobTitle,
      company: matches.company,
      overallScore: matches.overallScore,
      matchingSkills: matches.matchingSkills,
      gapSkills: matches.gapSkills,
      depthAssessment: matches.depthAssessment,
      areaAssessments: matches.areaAssessments,
      experienceMet: matches.experienceMet,
      method: matches.method,
      disclaimer: matches.disclaimer,
      createdAt: matches.createdAt,
    })
    .from(matches)
    .where(and(eq(matches.userId, userId), eq(matches.applicationId, applicationId)))
    .orderBy(desc(matches.createdAt))
    .limit(1);

  return rows[0] ?? null;
}

function hashText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return `h${Math.abs(hash).toString(36)}`;
}