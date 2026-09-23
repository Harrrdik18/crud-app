import { getSessionUser } from "@/lib/auth";
import { getFollowUpById } from "@/services/followup-service";
import { notFound } from "next/navigation";
import { FollowUpDetail } from "@/components/followup/followup-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FollowUpDetailPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) return null;

  const { id } = await params;
  const followUp = await getFollowUpById(user.id, id);
  if (!followUp) notFound();

  return <FollowUpDetail followUp={followUp} />;
}