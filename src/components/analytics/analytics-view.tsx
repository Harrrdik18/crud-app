"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, BarChart3 } from "lucide-react";
import type { DashboardStats, FunnelData } from "@/services/dashboard-service";
import { STATUS_LABELS, SOURCE_LABELS } from "@/lib/application-constants";

interface AnalyticsViewProps {
  stats: DashboardStats;
  byStatus: { status: string; count: number }[];
  bySource: { source: string; count: number }[];
  topSkills: { skill: string; count: number }[];
  companies: { company: string; count: number }[];
  byWeek: { week: string; count: number }[];
  funnel: FunnelData[];
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const w = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}

export function AnalyticsView({ stats, byStatus, bySource, topSkills, companies, byWeek, funnel }: AnalyticsViewProps) {
  const hasData = stats.totalApplications > 0;
  const maxStatus = Math.max(1, ...byStatus.map((s) => s.count));
  const maxSource = Math.max(1, ...bySource.map((s) => s.count));
  const maxWeek = Math.max(1, ...byWeek.map((w) => w.count));
  const maxSkill = Math.max(1, ...topSkills.map((s) => s.count));
  const maxCompany = Math.max(1, ...companies.map((c) => c.count));

  if (!hasData) {
    return (
      <div className="max-w-2xl mx-auto">
        <EmptyState
          icon={<BarChart3 className="h-8 w-8" />}
          title="No data yet"
          description="Add applications to start seeing hiring insights."
          action={
            <Button asChild>
              <Link href="/applications/new">
                <Briefcase className="h-4 w-4 mr-1" /> Add your first application
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Insights from your job search.</p>
      </div>

      {/* Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {funnel.map((f) => (
              <div key={f.stage} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-slate-600 dark:text-slate-300">{f.stage}</span>
                <div className="flex-1 h-4 rounded-md bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="flex h-full items-center rounded-md bg-primary-500 px-2 text-[10px] font-semibold text-white"
                    style={{ width: `${Math.max(8, f.percentage)}%` }}
                    title={`${f.count} applications`}
                  >
                    {f.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Status distribution */}
        <Card>
          <CardHeader>
            <CardTitle>By status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {byStatus.filter((s) => s.count > 0).map((s) => (
              <div key={s.status}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">{STATUS_LABELS[s.status] ?? s.status}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{s.count}</span>
                </div>
                <Bar value={s.count} max={maxStatus} color="bg-primary-500" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Source distribution */}
        <Card>
          <CardHeader>
            <CardTitle>By source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {bySource.map((s) => (
              <div key={s.source}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">{SOURCE_LABELS[s.source] ?? s.source}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{s.count}</span>
                </div>
                <Bar value={s.count} max={maxSource} color="bg-emerald-500" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly applications */}
        <Card>
          <CardHeader>
            <CardTitle>Applications per week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1.5" style={{ height: 96 }}>
              {byWeek.map((w) => (
                <div key={w.week} className="group relative flex-1 flex flex-col justify-end" title={`${w.week}: ${w.count}`}>
                  <div
                    className="rounded-t bg-sky-500 transition-all"
                    style={{ height: `${Math.max(4, (w.count / maxWeek) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">Last {byWeek.length} weeks</div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Top skills from job postings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {topSkills.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No job descriptions added yet.</p>
            ) : (
              topSkills.map((s) => (
                <div key={s.skill}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-300">{s.skill}</span>
                    <span className="font-medium text-slate-900 dark:text-white">{s.count}</span>
                  </div>
                  <Bar value={s.count} max={maxSkill} color="bg-violet-500" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Companies */}
      <Card>
        <CardHeader>
          <CardTitle>Most applied to companies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {companies.map((c) => (
            <div key={c.company}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">{c.company}</span>
                <span className="font-medium text-slate-900 dark:text-white">{c.count}</span>
              </div>
              <Bar value={c.count} max={maxCompany} color="bg-amber-500" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}