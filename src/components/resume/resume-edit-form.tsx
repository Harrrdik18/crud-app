"use client";

import { useState } from "react";
import { updateResumeAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Alert, Spinner } from "@/components/ui/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import type { Experience, Education, Project } from "@/db/schema";

interface ResumeEditFormProps {
  resume: {
    title: string;
    summary?: string | null;
    yearsExperience?: number | null;
    targetRole?: string | null;
    targetLocation?: string | null;
    experiences: Experience[];
    education: Education[];
    projects: Project[];
  } | null;
  skills: { name: string; kind: string; level?: string | null }[];
}

const emptyExperience = (): Experience => ({
  role: "",
  company: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
  technologies: [],
});

const emptyEducation = (): Education => ({
  institution: "",
  degree: "",
  field: "",
  startDate: "",
  endDate: "",
});

const emptyProject = (): Project => ({
  name: "",
  description: "",
  url: "",
  technologies: [],
});

export function ResumeEditForm({ resume, skills }: ResumeEditFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  const [experiences, setExperiences] = useState<Experience[]>(
    resume?.experiences?.length ? resume.experiences : [emptyExperience()],
  );
  const [education, setEducation] = useState<Education[]>(
    resume?.education?.length ? resume.education : [emptyEducation()],
  );
  const [projects, setProjects] = useState<Project[]>(
    resume?.projects?.length ? resume.projects : [emptyProject()],
  );
  const [skillNames] = useState<string>(
    skills.map((s) => s.name).join(", "),
  );

  const updateExperience = (i: number, patch: Partial<Experience>) =>
    setExperiences((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));

  const updateEducation = (i: number, patch: Partial<Education>) =>
    setEducation((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));

  const updateProject = (i: number, patch: Partial<Project>) =>
    setProjects((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setPending(true);

    const formData = new FormData();
    const techToList = (t: unknown): string[] =>
      Array.isArray(t)
        ? t
        : typeof t === "string" && t.trim()
          ? t.split(",").map((s) => s.trim()).filter(Boolean)
          : [];

    formData.set("title", (e.currentTarget.elements.namedItem("title") as HTMLInputElement)?.value ?? "My Resume");
    formData.set("summary", (e.currentTarget.elements.namedItem("summary") as HTMLTextAreaElement)?.value ?? "");
    formData.set("yearsExperience", (e.currentTarget.elements.namedItem("yearsExperience") as HTMLInputElement)?.value ?? "");
    formData.set("targetRole", (e.currentTarget.elements.namedItem("targetRole") as HTMLInputElement)?.value ?? "");
    formData.set("targetLocation", (e.currentTarget.elements.namedItem("targetLocation") as HTMLInputElement)?.value ?? "");

    formData.set("experiences", JSON.stringify(experiences.map((x) => ({ ...x, technologies: techToList(x.technologies) }))));
    formData.set("education", JSON.stringify(education));
    formData.set("projects", JSON.stringify(projects.map((x) => ({ ...x, url: x.url || null, technologies: techToList(x.technologies) }))));
    formData.set("skills", skillNames);

    const result = await updateResumeAction(undefined, formData);
    if (result.error) {
      setError(result.error);
      setPending(false);
    } else {
      router.push("/resume");
      router.refresh();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/resume" className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex-1" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Edit Resume</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <Alert variant="danger">{error}</Alert>}

        <Card>
          <CardHeader>
            <CardTitle>Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Resume title" htmlFor="title">
                <Input id="title" name="title" defaultValue={resume?.title ?? "My Resume"} maxLength={100} disabled={pending} />
              </Field>
              <Field label="Years of experience" htmlFor="yearsExperience">
                <Input id="yearsExperience" name="yearsExperience" type="number" min={0} max={100} defaultValue={resume?.yearsExperience ?? ""} placeholder="5" disabled={pending} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Target role" htmlFor="targetRole">
                <Input id="targetRole" name="targetRole" defaultValue={resume?.targetRole ?? ""} placeholder="Senior Frontend Engineer" maxLength={150} disabled={pending} />
              </Field>
              <Field label="Target location" htmlFor="targetLocation">
                <Input id="targetLocation" name="targetLocation" defaultValue={resume?.targetLocation ?? ""} placeholder="Remote (US)" maxLength={150} disabled={pending} />
              </Field>
            </div>
            <Field label="Summary" htmlFor="summary">
              <Textarea id="summary" name="summary" defaultValue={resume?.summary ?? ""} rows={4} maxLength={8000} placeholder="Brief professional summary..." disabled={pending} />
            </Field>
            <Field label="Skills" htmlFor="skills" hint="Comma-separated list, e.g. TypeScript, React, Node.js, PostgreSQL">
              <Textarea id="skills" name="skills" defaultValue={skillNames} rows={2} maxLength={3000} placeholder="TypeScript, React, Node.js, PostgreSQL" disabled={pending} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Experience</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => setExperiences((p) => [...p, emptyExperience()])} disabled={pending}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {experiences.map((exp, i) => (
              <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Experience {i + 1}</p>
                  <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => setExperiences((p) => p.filter((_, idx) => idx !== i))} disabled={pending}>
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Role" required>
                    <Input name={`exp-role-${i}`} value={exp.role} onChange={(e) => updateExperience(i, { role: e.target.value })} placeholder="Senior Engineer" maxLength={150} disabled={pending} />
                  </Field>
                  <Field label="Company" required>
                    <Input name={`exp-company-${i}`} value={exp.company} onChange={(e) => updateExperience(i, { company: e.target.value })} placeholder="Acme Inc." maxLength={150} disabled={pending} />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Start date">
                    <Input name={`exp-start-${i}`} type="date" value={exp.startDate} onChange={(e) => updateExperience(i, { startDate: e.target.value })} disabled={pending} />
                  </Field>
                  <Field label="End date" hint={exp.current ? "Currently working here" : undefined}>
                    <Input name={`exp-end-${i}`} type="date" value={exp.current ? "" : (exp.endDate ?? "")} onChange={(e) => updateExperience(i, { endDate: e.target.value })} disabled={pending || exp.current} />
                  </Field>
                  <label className="flex items-center gap-2 pt-6 text-sm text-slate-700 dark:text-slate-300">
                    <input type="checkbox" name={`exp-current-${i}`} checked={exp.current} onChange={(e) => updateExperience(i, { current: e.target.checked, endDate: e.target.checked ? null : exp.endDate })} disabled={pending} />
                    <span>Current</span>
                  </label>
                </div>
                <Field label="Technologies" hint="Comma-separated">
                  <Input name={`exp-tech-${i}`} value={Array.isArray(exp.technologies) ? exp.technologies.join(", ") : ""} onChange={(e) => updateExperience(i, { technologies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="React, TypeScript" maxLength={300} disabled={pending} />
                </Field>
                <Field label="Description">
                  <Textarea name={`exp-desc-${i}`} value={exp.description ?? ""} onChange={(e) => updateExperience(i, { description: e.target.value })} rows={3} maxLength={4000} placeholder="Key accomplishments..." disabled={pending} />
                </Field>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Education</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => setEducation((p) => [...p, emptyEducation()])} disabled={pending}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {education.map((edu, i) => (
              <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Education {i + 1}</p>
                  <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => setEducation((p) => p.filter((_, idx) => idx !== i))} disabled={pending}>
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                </div>
                <Field label="Institution" required>
                  <Input value={edu.institution} onChange={(e) => updateEducation(i, { institution: e.target.value })} placeholder="University of..." maxLength={150} disabled={pending} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Degree">
                    <Input value={edu.degree ?? ""} onChange={(e) => updateEducation(i, { degree: e.target.value })} placeholder="BSc" maxLength={150} disabled={pending} />
                  </Field>
                  <Field label="Field">
                    <Input value={edu.field ?? ""} onChange={(e) => updateEducation(i, { field: e.target.value })} placeholder="Computer Science" maxLength={150} disabled={pending} />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Start date">
                    <Input type="date" value={edu.startDate ?? ""} onChange={(e) => updateEducation(i, { startDate: e.target.value })} disabled={pending} />
                  </Field>
                  <Field label="End date">
                    <Input type="date" value={edu.endDate ?? ""} onChange={(e) => updateEducation(i, { endDate: e.target.value })} disabled={pending} />
                  </Field>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Projects</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => setProjects((p) => [...p, emptyProject()])} disabled={pending}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {projects.map((proj, i) => (
              <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Project {i + 1}</p>
                  <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => setProjects((p) => p.filter((_, idx) => idx !== i))} disabled={pending}>
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name" required>
                    <Input value={proj.name} onChange={(e) => updateProject(i, { name: e.target.value })} placeholder="JobHunt OS" maxLength={150} disabled={pending} />
                  </Field>
                  <Field label="URL">
                    <Input value={proj.url ?? ""} onChange={(e) => updateProject(i, { url: e.target.value })} placeholder="https://github.com/you/project" maxLength={300} disabled={pending} />
                  </Field>
                </div>
                <Field label="Technologies" hint="Comma-separated">
                  <Input value={Array.isArray(proj.technologies) ? proj.technologies.join(", ") : ""} onChange={(e) => updateProject(i, { technologies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="Next.js, PostgreSQL" maxLength={300} disabled={pending} />
                </Field>
                <Field label="Description">
                  <Textarea value={proj.description ?? ""} onChange={(e) => updateProject(i, { description: e.target.value })} rows={3} maxLength={3000} placeholder="What did you build?" disabled={pending} />
                </Field>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <div className="flex-1" />
          <Button type="submit" disabled={pending}>
            {pending ? <Spinner className="h-4 w-4" /> : null}
            {pending ? "Saving…" : "Save resume"}
          </Button>
        </div>
      </form>
    </div>
  );
}