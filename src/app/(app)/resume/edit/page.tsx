import { getSessionUser } from "@/lib/auth";
import { getResume, getSkills } from "@/services/profile-service";
import { ResumeEditForm } from "@/components/resume/resume-edit-form";

export default async function ResumeEditPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const [resume, skills] = await Promise.all([
    getResume(user.id),
    getSkills(user.id),
  ]);

  return <ResumeEditForm resume={resume} skills={skills} />;
}