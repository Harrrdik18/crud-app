import { getSessionUser } from "@/lib/auth";
import { InterviewForm } from "@/components/interviews/interview-form";

export default async function NewInterviewPage() {
  const user = await getSessionUser();
  if (!user) return null;

  return (
    <InterviewForm
      onSuccessRedirect="/interviews"
    />
  );
}