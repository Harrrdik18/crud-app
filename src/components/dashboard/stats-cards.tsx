"use client";

import { formatRelative } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Briefcase, Target, Award, XCircle, BarChart3, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color: "primary" | "success" | "warning" | "danger" | "info";
}

const ICON_COLORS = {
  primary: "text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-950/50",
  success: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50",
  warning: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/50",
  danger: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/50",
  info: "text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/50",
};

export function StatCard({ label, value, icon, trend, color }: StatCardProps) {
  return (
    <Card className="flex flex-col">
      <CardContent className="flex-1 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
            {trend && (
              <div className="mt-2 flex items-center gap-1 text-sm">
                <span className={cn(trend.value >= 0 ? "text-emerald-600" : "text-red-600")}>
                  {trend.value >= 0 ? "+" : ""}{trend.value}%
                </span>
                <span className="text-slate-500 dark:text-slate-400">{trend.label}</span>
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-xl", ICON_COLORS[color])}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DashboardStats {
  totalApplications: number;
  applicationsThisWeek: number;
  interviews: number;
  offers: number;
  rejections: number;
  responseRate: number;
  interviewConversionRate: number;
}

export function DashboardStatsGrid({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Applications"
        value={stats.totalApplications}
        icon={<Briefcase className="h-6 w-6" />}
        color="primary"
      />
      <StatCard
        label="This Week"
        value={stats.applicationsThisWeek}
        icon={<Clock className="h-6 w-6" />}
        color="info"
      />
      <StatCard
        label="Interviews"
        value={stats.interviews}
        icon={<Target className="h-6 w-6" />}
        color="warning"
      />
      <StatCard
        label="Offers"
        value={stats.offers}
        icon={<Award className="h-6 w-6" />}
        color="success"
      />
      <StatCard
        label="Rejections"
        value={stats.rejections}
        icon={<XCircle className="h-6 w-6" />}
        color="danger"
      />
      <StatCard
        label="Response Rate"
        value={`${stats.responseRate}%`}
        icon={<BarChart3 className="h-6 w-6" />}
        color="primary"
      />
      <StatCard
        label="Interview Conversion"
        value={`${stats.interviewConversionRate}%`}
        icon={<TrendingUp className="h-6 w-6" />}
        color="success"
      />
    </div>
  );
}