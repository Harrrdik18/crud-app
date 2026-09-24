import { getSessionUser } from "@/lib/auth";
import { getInterviewById } from "@/services/interview-service";
import { notFound } from "next/navigation";
import { InterviewForm } from "@/components/interviews/interview-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInterviewPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) return null;

  const { id } = await params;
  const interview = await getInterviewById(user.id, id);
  if (!interview) notFound();

  const initialData = {
    applicationId: interview.applicationId,
    type: interview.type,
    scheduledAt: interview.scheduledAt instanceof Date ? interview.scheduledAt.toISOString().slice(0, 16) : interview.scheduledAt,
    durationMinutes: interview.durationMinutes,
    interviewer: interview.interviewer,
    location: interview.location,
    notes: interview.notes,
    result: interview.result,
    feedback: interview.feedback,
  };

  return (
    <InterviewForm
      initialData={initialData}
      interviewId={id}
      onSuccessRedirect={`/interviews/${id}`}
    />
  );
}