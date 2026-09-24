"use client";

import { useCallback, useState } from "react";
import { analyzeJobAction } from "@/app/actions/job-match";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Alert, Spinner } from "@/components/ui/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyzeFormProps {
  options: { id: string; label: string; description: string }[];
  initialAppId: string | null;
}

interface AnalysisResult {
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
}

function scoreColor(score: number): string {
  if (score >= 75) return "bg-emerald-500 text-white";
  if (score >= 50) return "bg-amber-500 text-white";
  return "bg-red-500 text-white";
}

export function AnalyzeForm({ options, initialAppId }: AnalyzeFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [appId, setAppId] = useState(initialAppId ?? "");

  const selected = options.find((o) => o.id === appId);

  const loadFromApplication = useCallback(() => {
    if (selected && selected.description) {
      const area = document.getElementById("description") as HTMLTextAreaElement | null;
      if (area) {
        area.value = selected.description;
      }
      const company = document.getElementById("company") as HTMLInputElement | null;
      if (company && selected.label.includes("—")) {
        company.value = selected.label.split("—")[0].trim();
      }
    }
  }, [selected]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setPending(true);
    setResult(null);
    const formData = new FormData(e.currentTarget);
    if (appId) formData.set("applicationId", appId);
    const res = await analyzeJobAction(undefined, formData);
    setPending(false);
    if (res.error) {
      setError(res.error);
    } else if (res.result) {
      setResult(res.result);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Job Match</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Paste a job description to analyze required skills and see how you compare.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analyze a job</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <Alert variant="danger">{error}</Alert>}

            {options.length > 0 && (
              <Field label="From an existing application" htmlFor="applicationId" hint="Optionally pre-fill from a saved application.">
                <div className="flex gap-2">
                  <Select
                    id="applicationId"
                    name="applicationId"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    disabled={pending}
                  >
                    <option value="">— Standalone paste —</option>
                    {options.map((o) => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </Select>
                  <Button type="button" variant="secondary" size="sm" onClick={loadFromApplication} disabled={pending || !selected?.description} className="shrink-0">
                    Load description
                  </Button>
                </div>
              </Field>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Job title" htmlFor="jobTitle">
                <Input id="jobTitle" name="jobTitle" placeholder="Senior Frontend Engineer" maxLength={200} disabled={pending} />
              </Field>
              <Field label="Company" htmlFor="company">
                <Input id="company" name="company" placeholder="Acme Corp" maxLength={150} disabled={pending} />
              </Field>
            </div>

            <Field label="Job description" htmlFor="description" required hint="At least 50 characters.">
              <Textarea
                id="description"
                name="description"
                rows={10}
                required
                minLength={50}
                disabled={pending}
                placeholder="Paste the full job description here..."
              />
            </Field>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={pending}>
                {pending ? <Spinner className="h-4 w-4" /> : null}
                {pending ? "Analyzing…" : "Analyze & match"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && <ResultView result={result} />}
    </div>
  );
}

function ResultView({ result }: { result: AnalysisResult }) {
  const score = result.overallScore;
  return (
    <div className="space-y-6">
      {/* Score hero */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div
              className={cn(
                "flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full",
                scoreColor(score),
              )}
            >
              <span className="text-3xl font-bold">{score}</span>
              <span className="text-xs opacity-90">match</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {result.jobTitle}
                {result.company ? <span className="text-slate-500 dark:text-slate-400"> · {result.company}</span> : null}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {result.experience ? `Experience required: ${result.experience} · ` : ""}
                Depth: {result.depthAssessment ?? "n/a"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {result.areaAssessments.map((area) => (
              <div key={area.area} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{area.area}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{area.score}<span className="text-sm font-normal text-slate-400">/100</span></p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Matching skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.matchingSkills.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No matching skills detected. Add skills to your resume!</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {result.matchingSkills.map((s) => (
                  <Badge key={s} variant="success">{s}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" /> Skills to work on
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.gapSkills.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No gaps! Great fit.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {result.gapSkills.map((s) => (
                  <Badge key={s} variant="danger">{s}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Required & preferred skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Required</p>
            <div className="flex flex-wrap gap-2">
              {result.requiredSkills.length === 0 ? (
                <span className="text-sm text-slate-500">None clearly listed</span>
              ) : (
                result.requiredSkills.map((s) => <Badge key={s}>{s}</Badge>)
              )}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Preferred</p>
            <div className="flex flex-wrap gap-2">
              {result.preferredSkills.length === 0 ? (
                <span className="text-sm text-slate-500">None clearly listed</span>
              ) : (
                result.preferredSkills.map((s) => <Badge key={s} variant="outline">{s}</Badge>)
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Experience fit</p>
            <div className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
              result.experienceMet.meets
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                : "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
            )}>
              {result.experienceMet.meets ? "You appear to meet the experience requirement." : "You may not meet the experience requirement."}
              <span className="ml-auto text-xs opacity-70">
                {result.experienceMet.required ?? "No requirement"} · candidate: {result.experienceMet.candidate}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {result.responsibilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Responsibilities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {result.responsibilities.map((r, i) => (
                <li key={i} className="text-sm text-slate-600 dark:text-slate-300">{r}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {result.disclaimer && (
        <p className="text-xs text-slate-400 dark:text-slate-500">{result.disclaimer}</p>
      )}
    </div>
  );
}