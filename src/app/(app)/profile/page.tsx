import { getSessionUser } from "@/lib/auth";
import { getProfile } from "@/services/profile-service";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getProfile(user.id);

  return (
    <ProfileForm
      initialData={profile}
      user={user}
    />
  );
}