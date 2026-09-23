import { getSessionUser } from "@/lib/auth";
import { getApplicationById } from "@/services/application-service";
import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/application/application-form";
import { updateApplicationAction } from "@/app/actions/applications";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditApplicationPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) return null;

  const { id } = await params;
  const app = await getApplicationById(user.id, id);
  if (!app) notFound();

  const initialData = {
    ...app,
    appliedAt: app.appliedAt instanceof Date ? app.appliedAt.toISOString().split("T")[0] : app.appliedAt,
  };

  return (
    <ApplicationForm
      initialData={initialData}
      action={updateApplicationAction}
      applicationId={id}
      onSuccessRedirect={`/applications/${id}`}
    />
  );
}