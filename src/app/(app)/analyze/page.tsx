import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { listApplications } from "@/services/application-service";
import { AnalyzeForm } from "@/components/analyze/analyze-form";

export const metadata: Metadata = { title: "Job Match" };

export default async function AnalyzePage({
  searchParams,
}: {
  searchParams: Promise<{ app?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) return null;

  const { app } = await searchParams;
  const apps = await listApplications(user.id, {
    q: null,
    status: null,
    location: null,
    from: null,
    to: null,
    sort: "newest",
    page: 1,
    pageSize: 50,
  });

  const options = apps.data.map((a) => ({
    id: a.id,
    label: `${a.company} — ${a.title}`,
    description: a.description ?? "",
  }));

  return <AnalyzeForm options={options} initialAppId={app ?? null} />;
}