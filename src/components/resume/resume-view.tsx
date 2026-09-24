"use client";

import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Experience, Education, Project, skills as skillsTable } from "@/db/schema";

type SkillRow = typeof skillsTable.$inferSelect;

interface ResumeViewProps {
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
  skills: SkillRow[];
}

export function ResumeView({ resume, skills }: ResumeViewProps) {
  const hasResume = resume && (resume.experiences.length > 0 || resume.education.length > 0 || resume.projects.length > 0 || resume.summary);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Resume</h1>
          <p className="text-slate-500 dark:text-slate-400">Your professional profile for job matching</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile">
              <Plus className="h-4 w-4 mr-1" /> Edit Profile
            </Link>
          </Button>
          <Button asChild>
            <Link href="/resume/edit">
              <Plus className="h-4 w-4 mr-1" /> Edit Resume
            </Link>
          </Button>
        </div>
      </div>

      {!hasResume ? (
        <EmptyState
          icon={<Plus className="h-8 w-8" />}
          title="No resume yet"
          description="Add your experience, education, projects, and skills to unlock job matching."
          action={
            <Button asChild>
              <Link href="/resume/edit">Create your resume</Link>
            </Button>
          }
        />
      ) : (
        <>
          {resume!.summary && (
            <Card>
              <CardHeader>
                <CardTitle>Professional Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="prose prose-slate dark:prose-invert">{resume!.summary}</p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Skills</CardTitle>
                <Button size="sm" asChild variant="ghost">
                  <Link href="/resume/edit">Edit</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {skills.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No skills added yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <Badge key={s.id} variant="outline" className="text-xs">
                        {s.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {resume!.targetRole && (
              <Card>
                <CardHeader>
                  <CardTitle>Target Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-slate-900 dark:text-white">{resume!.targetRole}</p>
                  {resume!.targetLocation && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">{resume!.targetLocation}</p>
                  )}
                  {resume!.yearsExperience && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">{resume!.yearsExperience} years experience</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {resume!.experiences.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Experience</CardTitle>
                <Button size="sm" asChild variant="ghost">
                  <Link href="/resume/edit">Edit</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resume!.experiences.map((exp, i) => (
                    <div key={exp.id ?? i} className="border-l-2 border-primary-200 dark:border-primary-800 pl-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{exp.role}</p>
                          <p className="text-slate-600 dark:text-slate-300">{exp.company}</p>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate ?? "")}
                        </div>
                      </div>
                      {exp.description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{exp.description}</p>}
                      {exp.technologies.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {exp.technologies.map((t) => (
                            <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {resume!.education.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Education</CardTitle>
                <Button size="sm" asChild variant="ghost">
                  <Link href="/resume/edit">Edit</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resume!.education.map((edu, i) => (
                    <div key={edu.id ?? i} className="border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{edu.institution}</p>
                      {edu.degree && <p className="text-sm text-slate-600 dark:text-slate-300">{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</p>}
                      {edu.startDate || edu.endDate ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {edu.startDate ? formatDate(edu.startDate) : ""} — {edu.endDate ? formatDate(edu.endDate) : "Present"}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {resume!.projects.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Projects</CardTitle>
                <Button size="sm" asChild variant="ghost">
                  <Link href="/resume/edit">Edit</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resume!.projects.map((proj, i) => (
                    <div key={proj.id ?? i} className="border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{proj.name}</p>
                          {proj.url && (
                            <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline">
                              View project
                            </a>
                          )}
                        </div>
                      </div>
                      {proj.description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{proj.description}</p>}
                      {proj.technologies.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {proj.technologies.map((t) => (
                            <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}