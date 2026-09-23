"use client";

import { formatRelative, formatDate } from "@/lib/utils";
import { DashboardStatsGrid } from "@/components/dashboard/stats-cards";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { WeeklyApplicationsChart } from "@/components/dashboard/weekly-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import Link from "next/link";
import { Briefcase, Calendar, Clock, MapPin, TrendingUp, Plus, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/application-constants";

interface DashboardViewProps {
  stats: {
    totalApplications: number;
    applicationsThisWeek: number;
    interviews: number;
    offers: number;
    rejections: number;
    responseRate: number;
    interviewConversionRate: number;
  };
  funnel: { stage: string; count: number; percentage: number }[];
  upcomingInterviews: {
    id: string;
    applicationId: string;
    company: string;
    title: string;
    type: string;
    scheduledAt: Date;
    interviewer: string | null;
  }[];
  pendingFollowUps: {
    id: string;
    applicationId: string;
    company: string;
    title: string;
    dueAt: Date;
  }[];
  recentApplications: {
    id: string;
    company: string;
    title: string;
    status: string;
    appliedAt: Date;
  }[];
  weeklyData: { week: string; count: number }[];
}

export function DashboardView({
  stats,
  funnel,
  upcomingInterviews,
  pendingFollowUps,
  recentApplications,
  weeklyData,
}: DashboardViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Link href="/applications/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Application
            </Button>
          </Link>
        </div>
      </div>

      <DashboardStatsGrid stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <FunnelChart data={funnel} />
        <WeeklyApplicationsChart data={weeklyData} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Interviews</CardTitle>
              <Link href="/interviews" className="text-sm text-primary-600 hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingInterviews.length === 0 ? (
              <EmptyState
                icon={<Calendar className="h-8 w-8" />}
                title="No upcoming interviews"
                description="Schedule interviews from the Applications page."
              />
            ) : (
              upcomingInterviews.map((i) => (
                <Link key={i.id} href={`/applications/${i.applicationId}`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{i.company}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{i.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelative(i.scheduledAt)}
                      </span>
                      {i.interviewer && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {i.interviewer}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pending Follow-ups</CardTitle>
              <Link href="/follow-ups" className="text-sm text-primary-600 hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingFollowUps.length === 0 ? (
              <EmptyState
                icon={<Clock className="h-8 w-8" />}
                title="No pending follow-ups"
                description="Add follow-ups from application details."
              />
            ) : (
              pendingFollowUps.map((f) => (
                <Link key={f.id} href={`/applications/${f.applicationId}`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{f.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{f.company} — {f.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due {formatDate(f.dueAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Applications</CardTitle>
              <Link href="/applications" className="text-sm text-primary-600 hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentApplications.length === 0 ? (
              <EmptyState
                icon={<Briefcase className="h-8 w-8" />}
                title="No applications yet"
                description="Start tracking your job search by adding an application."
                action={
                  <Link href="/applications/new">
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                      Add Application
                    </Button>
                  </Link>
                }
              />
            ) : (
              recentApplications.map((a) => (
                <Link key={a.id} href={`/applications/${a.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{a.company}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{a.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <Badge variant={STATUS_COLORS[a.status] ?? "default"}>
                        {STATUS_LABELS[a.status] ?? a.status}
                      </Badge>
                      <span className="text-slate-400 dark:text-slate-500">
                        {formatRelative(a.appliedAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}