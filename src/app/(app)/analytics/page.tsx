import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import {
  getApplicationsByStatus,
  getApplicationsBySource,
  getTopSkillsFromJobs,
  getCompaniesApplied,
  getApplicationsByWeek,
  getFunnelData,
  getDashboardStats,
} from "@/services/dashboard-service";
import { AnalyticsView } from "@/components/analytics/analytics-view";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const [byStatus, bySource, topSkills, companies, byWeek, funnel, stats] =
    await Promise.all([
      getApplicationsByStatus(user.id),
      getApplicationsBySource(user.id),
      getTopSkillsFromJobs(user.id),
      getCompaniesApplied(user.id),
      getApplicationsByWeek(user.id),
      getFunnelData(user.id),
      getDashboardStats(user.id),
    ]);

  return (
    <AnalyticsView
      stats={stats}
      byStatus={byStatus}
      bySource={bySource}
      topSkills={topSkills}
      companies={companies}
      byWeek={byWeek}
      funnel={funnel}
    />
  );
}