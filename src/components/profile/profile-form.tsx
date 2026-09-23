"use client";

import { useState } from "react";
import { updateProfileAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Alert, Spinner } from "@/components/ui/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AtSign, Globe, Link2 } from "lucide-react";

interface ActionResult {
  error?: string;
}

interface ProfileFormProps {
  initialData: {
    headline?: string | null;
    location?: string | null;
    bio?: string | null;
    githubUrl?: string | null;
    linkedinUrl?: string | null;
    websiteUrl?: string | null;
  } | null;
  user: { id: string; name: string; email: string };
}

export function ProfileForm({ initialData, user }: ProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateProfileAction(undefined, formData);
    if (result.error) {
      setError(result.error);
      setPending(false);
    } else {
      router.push("/profile");
      router.refresh();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
          <p className="text-slate-500 dark:text-slate-400">{user.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <Alert variant="danger">{error}</Alert>}

            <Field label="Headline" htmlFor="headline">
              <Input
                id="headline"
                name="headline"
                defaultValue={initialData?.headline ?? ""}
                placeholder="Senior Fullstack Engineer | React & Node.js"
                maxLength={200}
                disabled={pending}
              />
            </Field>

            <Field label="Location" htmlFor="location">
              <Input
                id="location"
                name="location"
                defaultValue={initialData?.location ?? ""}
                placeholder="San Francisco, CA"
                maxLength={120}
                disabled={pending}
              />
            </Field>

            <Field label="Bio" htmlFor="bio">
              <Textarea
                id="bio"
                name="bio"
                defaultValue={initialData?.bio ?? ""}
                placeholder="Tell recruiters about yourself..."
                rows={4}
                maxLength={2000}
                disabled={pending}
              />
            </Field>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Social Links</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="GitHub" htmlFor="githubUrl">
                  <Input
                    id="githubUrl"
                    name="githubUrl"
                    type="url"
                    defaultValue={initialData?.githubUrl ?? ""}
                    placeholder="https://github.com/username"
                    maxLength={300}
                    disabled={pending}
                  />
                </Field>
                <Field label="LinkedIn" htmlFor="linkedinUrl">
                  <Input
                    id="linkedinUrl"
                    name="linkedinUrl"
                    type="url"
                    defaultValue={initialData?.linkedinUrl ?? ""}
                    placeholder="https://linkedin.com/in/username"
                    maxLength={300}
                    disabled={pending}
                  />
                </Field>
                <Field label="Website" htmlFor="websiteUrl">
                  <Input
                    id="websiteUrl"
                    name="websiteUrl"
                    type="url"
                    defaultValue={initialData?.websiteUrl ?? ""}
                    placeholder="https://yourwebsite.com"
                    maxLength={300}
                    disabled={pending}
                  />
                </Field>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Link href="/resume" className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
              <div className="flex-1" />
              <Button type="submit" disabled={pending}>
                {pending ? <Spinner className="h-4 w-4" /> : null}
                {pending ? "Saving…" : "Save profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Change Password</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Update your password</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile/password">Change</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}