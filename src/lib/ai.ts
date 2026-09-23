/** Minimal OpenAI-compatible chat client used by the job analyzer.
 *  When AI_API_KEY is empty the app runs in offline heuristic mode and
 *  this module is never invoked with a real request resolved to null. */

export interface AiAnalysisPayload {
  jobTitle?: string;
  company?: string;
  description: string;
  resumeSummary?: string;
  skills?: string[];
}

export interface AiAnalysisResult {
  requiredSkills: string[];
  preferredSkills: string[];
  technologies: string[];
  responsibilities: string[];
  experience: string | null;
}

const AI_API_KEY = process.env.AI_API_KEY;

export function isAiConfigured(): boolean {
  return Boolean(AI_API_KEY);
}

function parseJsonArray(text: string): string[] {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.map((x) => String(x).trim()).filter(Boolean);
    }
  } catch {
    // ignore
  }
  // Fallback: extract quoted terms or lines.
  const matches = text.match(/"([^"]+)"/g) ?? [];
  return matches.map((m) => m.slice(1, -1));
}

export async function analyzeWithAi(
  payload: AiAnalysisPayload,
): Promise<AiAnalysisResult> {
  if (!AI_API_KEY) {
    throw new Error("AI not configured");
  }

  const system =
    "You are a resume/job-match analyst. Given a job description and a candidate's profile, " +
    "return a JSON object ONLY (no markdown, no commentary). schema: " +
    JSON.stringify({
      requiredSkills: "string[]",
      preferredSkills: "string[]",
      technologies: "string[]",
      responsibilities: "string[]",
      experience: "string|null e.g. '3+ years'",
    });

  const user = [
    `Job title: ${payload.jobTitle ?? "not given"}`,
    `Company: ${payload.company ?? "not given"}`,
    "Job description:",
    payload.description.slice(0, 20_000),
    payload.resumeSummary ? `Candidate summary:\n${payload.resumeSummary.slice(0, 4000)}` : "",
    payload.skills?.length ? `Candidate skills:\n${payload.skills.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 900,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`AI request failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  return {
    requiredSkills: parseJsonArray(JSON.stringify(parsed.requiredSkills ?? [])),
    preferredSkills: parseJsonArray(JSON.stringify(parsed.preferredSkills ?? [])),
    technologies: parseJsonArray(JSON.stringify(parsed.technologies ?? [])),
    responsibilities: parseJsonArray(JSON.stringify(parsed.responsibilities ?? [])),
    experience:
      typeof parsed.experience === "string" && parsed.experience
        ? parsed.experience
        : null,
  };
}