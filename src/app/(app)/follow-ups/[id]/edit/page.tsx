import { getSessionUser } from "@/lib/auth";
import { getFollowUpById } from "@/services/followup-service";
import { notFound } from "next/navigation";
import { FollowUpForm } from "@/components/follow-ups/follow-up-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFollowUpPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) return null;

  const { id } = await params;
  const followUp = await getFollowUpById(user.id, id);
  if (!followUp) notFound();

  const initialData = {
    applicationId: followUp.applicationId,
    title: followUp.title,
    dueAt: followUp.dueAt instanceof Date ? followUp.dueAt.toISOString().split("T")[0] : followUp.dueAt,
    status: followUp.status,
    notes: followUp.notes,
  };

  return (
    <FollowUpForm
      initialData={initialData}
      followUpId={id}
      onSuccessRedirect={`/follow-ups/${id}`}
    />
  );
}