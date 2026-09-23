import { getSessionUser } from "@/lib/auth";
import { getInterviewById } from "@/services/interview-service";
import { notFound } from "next/navigation";
import { InterviewDetail } from "@/components/interview/interview-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InterviewDetailPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) return null;

  const { id } = await params;
  const interview = await getInterviewById(user.id, id);
  if (!interview) notFound();

  return <InterviewDetail interview={interview} />;
}