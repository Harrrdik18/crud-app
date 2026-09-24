import { getSessionUser } from "@/lib/auth";
import {
  getDashboardStats,
  getFunnelData,
  getUpcomingInterviews,
  getPendingFollowUps,
  getRecentApplications,
  getApplicationsByWeek,
} from "@/services/dashboard-service";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const [stats, funnel, upcomingInterviews, pendingFollowUps, recentApps, weeklyData] = await Promise.all([
    getDashboardStats(user.id),
    getFunnelData(user.id),
    getUpcomingInterviews(user.id, 5),
    getPendingFollowUps(user.id, 5),
    getRecentApplications(user.id, 5),
    getApplicationsByWeek(user.id, 12),
  ]);

  return (
    <DashboardView
      stats={stats}
      funnel={funnel}
      upcomingInterviews={upcomingInterviews}
      pendingFollowUps={pendingFollowUps}
      recentApplications={recentApps}
      weeklyData={weeklyData}
    />
  );
}