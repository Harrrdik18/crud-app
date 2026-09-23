export interface SkillMention {
  skill: string;
  occurrences: number;
  preferred: boolean;
  required: boolean;
}

export interface AnalyzedJob {
  jobTitle: string;
  company: string;
  requiredSkills: string[];
  preferredSkills: string[];
  technologies: string[];
  responsibilities: string[];
  keywords: string[];
  experience: string | null;
  requiredKeywords: string[];
  preferredKeywords: string[];
  normalized: string;
  error: string | null;
  method: string;
}

const COMMON_SKILLS = [
  "react", "react.js", "reactjs", "typescript", "javascript", "next.js", "nextjs",
  "node.js", "nodejs", "node", "express", "fastify", "nestjs", "graphql", "rest", "rest api",
  "go", "golang", "rust", "python", "django", "flask", "fastapi", "ruby", "rails",
  "java", "kotlin", "scala", "spring", "c#", "csharp", ".net", "php", "laravel",
  "html", "css", "scss", "sass", "tailwind", "tailwindcss", "material ui", "mui",
  "vue", "vue.js", "svelte", "angular", "ember", "jquery",
  "postgresql", "postgres", "mysql", "mongodb", "sqlite", "redis", "cassandra",
  "dynamodb", "elasticsearch", "clickhouse", "bigquery", "snowflake", "redshift",
  "aws", "gcp", "azure", "cloud", "serverless", "lambda", "ec2", "s3",
  "docker", "kubernetes", "k8s", "terraform", "ansible", "helm", "podman",
  "ci/cd", "github actions", "gitlab ci", "jenkins", "circleci", "vercel", "netlify",
  "git", "github", "gitlab", "bitbucket",
  "unit testing", "testing", "jest", "vitest", "playwright", "cypress", "mocha",
  "tdd", "bdd", "e2e", "integration testing",
  "sql", "nosql", "orm", "prisma", "drizzle", "typeorm", "sequelize", "knex",
  "microservices", "monolith", "event-driven", "message queue", "kafka", "rabbitmq",
  "webpack", "vite", "rollup", "babel", "eslint",
  "performance", "optimization", "accessibility", "a11y", "seo", "responsive",
  "design systems", "component library", "storybook", "figma",
  "machine learning", "ml", "ai", "llm", "data science", "pandas", "numpy",
  "agile", "scrum", "kanban", "leadership", "mentoring", "communication",
  "restful", "api", "web services", "frontend", "backend", "full-stack", "fullstack",
];

const COMMON_TECHS = [
  "react", "typescript", "javascript", "next.js", "node.js", "python", "postgresql",
  "docker", "kubernetes", "aws", "gcp", "azure", "graphql", "mongodb", "redis",
  "tailwind", "django", "flask", "fastapi", "express", "go", "rust", "java",
  "spring", "kafka", "terraform", "ci/cd", "vitest", "jest", "playwright",
  "k8s", "serverless", "lambda", "s3", "webpack", "vite", "prisma", "drizzle",
];

const RESPONSIBILITY_HINTS = [
  "build", "develop", "design", "architect", "lead", "own", "drive", "ship",
  "collaborate", "maintain", "improve", "optimize", "refactor", "test",
  "implement", "integrate", "automate", "deliver", "manage", "create",
];

const REQUIRED_PATTERNS = [
  /\brequired\b/i,
  /\brequire\b/i,
  /\bmust have\b/i,
  /\bmust-haves\b/i,
  /\brequirements\b/i,
  /\bessential\b/i,
  /\bminimum qualifications\b/i,
  /\byou need\b/i,
];

const PREFERRED_PATTERNS = [
  /\bpreferred\b/i,
  /\bnice to have\b/i,
  /\bbonus\b/i,
  /\bdesirable\b/i,
  /\bgood to have\b/i,
  /\bit would be great\b/i,
];

const EXPERIENCE_PATTERN = /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp\.?)?/i;

function unique(values: string[]): string[] {
  return [...new Set(values.map((s) => s.toLowerCase().trim()).filter(Boolean))];
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractResponsibilities(text: string): string[] {
  const sentences = text
    .split(/[.;\n]+/)
    .map((s) => s.trim().replace(/^[-•*\d\)\s]+/, ""))
    .filter((s) => s.length > 6 && s.length < 240);

  const responsibilities: string[] = [];
  for (const sentence of sentences) {
    const first = sentence.toLowerCase().split(" ").slice(0, 2).join(" ");
    if (RESPONSIBILITY_HINTS.some((hint) => first.includes(hint) || sentence.toLowerCase().startsWith(hint + " "))) {
      responsibilities.push(sentence);
    }
    if (responsibilities.length >= 12) break;
  }
  return responsibilities;
}

function extractExperience(text: string): string | null {
  const match = text.match(EXPERIENCE_PATTERN);
  if (!match) return null;
  return `${match[1]}+ years`;
}

function nearestMarker(
  lower: string,
  idx: number,
  patterns: RegExp[],
  maxLookback = 300,
): number {
  const start = Math.max(0, idx - maxLookback);
  const region = lower.slice(start, idx);
  let nearest = -1;
  for (const p of patterns) {
    const match = p.exec(region);
    if (match && match.index > nearest) nearest = match.index;
  }
  return nearest;
}

export function analyzeJob(input: { jobTitle?: string; company?: string; description: string }): AnalyzedJob {
  const description = input.description.trim();
  const lower = description.toLowerCase();

  const analysis: AnalyzedJob = {
    jobTitle: input.jobTitle?.trim() || "Job posting",
    company: input.company?.trim() || "",
    requiredSkills: [],
    preferredSkills: [],
    technologies: [],
    responsibilities: extractResponsibilities(description),
    keywords: [],
    experience: extractExperience(description),
    requiredKeywords: [],
    preferredKeywords: [],
    normalized: lower,
    error: null,
    method: "heuristic",
  };

  for (const skill of COMMON_SKILLS) {
    const regex = new RegExp(`\\b${escapeRegex(skill)}\\b`, "i");
    if (!regex.test(lower)) continue;

    const idx = lower.indexOf(skill);
    const requiredIdx = nearestMarker(lower, idx, REQUIRED_PATTERNS);
    const preferredIdx = nearestMarker(lower, idx, PREFERRED_PATTERNS);

    if (requiredIdx !== -1 && (preferredIdx === -1 || requiredIdx > preferredIdx)) {
      analysis.requiredSkills.push(skill);
      analysis.requiredKeywords.push(skill);
    } else if (preferredIdx !== -1 && (requiredIdx === -1 || preferredIdx > requiredIdx)) {
      analysis.preferredSkills.push(skill);
      analysis.preferredKeywords.push(skill);
    } else {
      analysis.technologies.push(skill);
      if (COMMON_TECHS.includes(skill)) analysis.keywords.push(skill);
    }
  }

  const realSkills = [...analysis.requiredSkills, ...analysis.preferredSkills];
  const cleanup = (list: string[]) =>
    unique(list).filter((s) => {
      // Drop a skill when a more specific (longer) skill from the combined list covers it.
      return !realSkills.some(
        (other) => other !== s && other.length > s.length && (s === other.replace(/\.|#|\+/g, "") || other.includes(s)),
      );
    });

  analysis.requiredSkills = cleanup(analysis.requiredSkills);
  analysis.preferredSkills = cleanup(analysis.preferredSkills);
  analysis.technologies = unique(analysis.technologies);
  analysis.keywords = unique(analysis.keywords);
  analysis.requiredKeywords = unique(analysis.requiredKeywords);
  analysis.preferredKeywords = unique(analysis.preferredKeywords);

  return analysis;
}

export function skillMatches(candidateSkills: string[], jobSkills: string[]): {
  matchingSkills: string[];
  gapSkills: string[];
} {
  const normalized = candidateSkills.map((s) => s.toLowerCase().trim());
  const matchingSkills: string[] = [];
  const gapSkills: string[] = [];

  for (const jobSkill of jobSkills) {
    const j = jobSkill.toLowerCase().trim();
    if (
      normalized.some((c) => c === j || c.includes(j) || j.includes(c))
    ) {
      matchingSkills.push(j);
    } else {
      gapSkills.push(j);
    }
  }
  return { matchingSkills, gapSkills };
}