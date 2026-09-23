import { getSessionUser } from "@/lib/auth";
import { getResume, getSkills } from "@/services/profile-service";
import { ResumeView } from "@/components/profile/resume-view";

export default async function ResumePage() {
  const user = await getSessionUser();
  if (!user) return null;

  const [resume, skills] = await Promise.all([
    getResume(user.id),
    getSkills(user.id),
  ]);

  return <ResumeView resume={resume} skills={skills} />;
}