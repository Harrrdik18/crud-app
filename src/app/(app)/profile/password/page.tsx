import { getSessionUser } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/profile/change-password-form";

export default async function ChangePasswordPage() {
  const user = await getSessionUser();
  if (!user) return null;

  return <ChangePasswordForm />;
}