"use client";

import { useState } from "react";
import { changePasswordAction, type AuthFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert, Spinner } from "@/components/ui/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ChangePasswordForm() {
  const router = useRouter();
  const [state, setState] = useState<AuthFormState | undefined>();
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState(undefined);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    const result = await changePasswordAction(undefined, formData);
    setState(result);
    setPending(false);
    if (!result.error) {
      router.push("/login?changed=1");
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 pb-4">
        <Link href="/profile" className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400">
          <ArrowLeft className="h-4 w-4" /> Back to profile
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {state?.error && <Alert variant="danger">{state.error}</Alert>}

            <Field label="Current password" htmlFor="currentPassword" required hint="We'll sign you out of all sessions after this.">
              <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required maxLength={128} disabled={pending} />
            </Field>

            <Field label="New password" htmlFor="newPassword" required hint="At least 8 characters.">
              <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={128} disabled={pending} />
            </Field>

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button type="submit" disabled={pending}>
                {pending ? <Spinner className="h-4 w-4" /> : null}
                {pending ? "Updating…" : "Update password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}