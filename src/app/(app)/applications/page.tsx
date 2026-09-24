import { getSessionUser } from "@/lib/auth";
import { listApplications } from "@/services/application-service";
import { ApplicationsList } from "@/components/applications/applications-list";
import { applicationQuerySchema, type ApplicationQuery } from "@/lib/validation/schemas";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ApplicationsPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  if (!user) return null;

  const params = await searchParams;
  const parsed = applicationQuerySchema.safeParse({
    q: params.q,
    status: params.status,
    location: params.location,
    from: params.from,
    to: params.to,
    sort: params.sort,
    page: params.page ? Number(params.page) : undefined,
    pageSize: params.pageSize ? Number(params.pageSize) : undefined,
  });

  const query = parsed.success ? parsed.data : applicationQuerySchema.parse({});
  const result = await listApplications(user.id, query);

  return <ApplicationsList result={result} query={query} />;
}