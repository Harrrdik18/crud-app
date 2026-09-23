import { getSessionUser } from "@/lib/auth";
import { FollowUpForm } from "@/components/followup/followup-form";

export default async function NewFollowUpPage() {
  const user = await getSessionUser();
  if (!user) return null;

  return (
    <FollowUpForm
      onSuccessRedirect="/follow-ups"
    />
  );
}