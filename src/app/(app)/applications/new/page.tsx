import { getSessionUser } from "@/lib/auth";
import { ApplicationForm } from "@/components/applications/application-form";
import { createApplicationAction } from "@/app/actions/applications";

export default async function NewApplicationPage() {
  const user = await getSessionUser();
  if (!user) return null;

  return (
    <ApplicationForm
      action={createApplicationAction}
      onSuccessRedirect="/applications"
    />
  );
}