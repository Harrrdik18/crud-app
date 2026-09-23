import { getSessionUser } from "@/lib/auth";
import { listFollowUps } from "@/services/followup-service";
import { FollowUpsList } from "./followups-list";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function FollowUpsPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  if (!user) return null;

  const params = await searchParams;
  const query = {
    page: params.page ? Number(params.page) : 1,
    pageSize: params.pageSize ? Number(params.pageSize) : 20,
    status: params.status as string | undefined,
    applicationId: params.applicationId as string | undefined,
  };

  const result = await listFollowUps(user.id, query);
  return <FollowUpsList result={result} query={query} />;
}