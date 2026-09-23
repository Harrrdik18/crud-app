import { getSessionUser } from "@/lib/auth";
import { InterviewForm } from "@/components/interview/interview-form";

export default async function NewInterviewPage() {
  const user = await getSessionUser();
  if (!user) return null;

  return (
    <InterviewForm
      onSuccessRedirect="/interviews"
    />
  );
}