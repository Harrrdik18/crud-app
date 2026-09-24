import { getSessionUser } from "@/lib/auth";
import { listInterviews } from "@/services/interview-service";
import { InterviewsList } from "@/components/interviews/interviews-list";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function InterviewsPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  if (!user) return null;

  const params = await searchParams;
  const query = {
    page: params.page ? Number(params.page) : 1,
    pageSize: params.pageSize ? Number(params.pageSize) : 20,
    from: params.from as string | undefined,
    to: params.to as string | undefined,
    applicationId: params.applicationId as string | undefined,
  };

  const result = await listInterviews(user.id, query);
  return <InterviewsList result={result} query={query} />;
}