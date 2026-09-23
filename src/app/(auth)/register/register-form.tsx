"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type AuthFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert, Spinner } from "@/components/ui/feedback";
import { Card, CardContent } from "@/components/ui/card";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    registerAction,
    {} as AuthFormState,
  );

  return (
    <Card className="w-full max-w-md shadow-xl shadow-primary-900/5">
      <CardContent className="p-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Start organizing your job search in under a minute.
        </p>

        <form action={formAction} className="mt-8 space-y-5">
          {state?.error ? (
            <Alert variant="danger" title="Could not create your account">
              {state.error}
            </Alert>
          ) : null}

          <Field label="Full name" htmlFor="name" required>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              placeholder="Ada Lovelace"
              required
              maxLength={80}
              disabled={pending}
            />
          </Field>

          <Field label="Email" htmlFor="email" required>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              disabled={pending}
            />
          </Field>

          <Field
            label="Password"
            htmlFor="password"
            required
            hint="At least 8 characters."
          >
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              required
              minLength={8}
              maxLength={128}
              disabled={pending}
            />
          </Field>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Spinner className="h-4 w-4" /> : null}
            {pending ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
