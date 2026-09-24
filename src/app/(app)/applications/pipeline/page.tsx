import { getSessionUser } from "@/lib/auth";
import { getApplicationsByStatus } from "@/services/application-service";
import { PipelineView } from "@/components/applications/pipeline-view";

export default async function PipelinePage() {
  const user = await getSessionUser();
  if (!user) return null; // middleware handles redirect

  const grouped = await getApplicationsByStatus(user.id);
  return <PipelineView grouped={grouped} userId={user.id} />;
}