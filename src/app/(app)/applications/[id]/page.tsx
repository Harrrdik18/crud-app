import { getSessionUser } from "@/lib/auth";
import { getApplicationById } from "@/services/application-service";
import { notFound } from "next/navigation";
import { ApplicationDetail } from "@/components/application/application-detail";
import { STATUS_ORDER } from "@/lib/application-constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) return null;

  const { id } = await params;
  const app = await getApplicationById(user.id, id);
  if (!app) notFound();

  return <ApplicationDetail app={app} statusOrder={STATUS_ORDER} />;
}