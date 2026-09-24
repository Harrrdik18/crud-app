import { getSessionUser } from "@/lib/auth";
import { FollowUpForm } from "@/components/follow-ups/follow-up-form";

export default async function NewFollowUpPage() {
  const user = await getSessionUser();
  if (!user) return null;

  return (
    <FollowUpForm
      onSuccessRedirect="/follow-ups"
    />
  );
}