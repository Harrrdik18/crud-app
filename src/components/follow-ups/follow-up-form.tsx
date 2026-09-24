"use client";

import { useState } from "react";
import { createFollowUpAction, updateFollowUpAction } from "@/app/actions/interviews-followups";

type CreateFollowUpAction = (prev: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;
type UpdateFollowUpAction = (followUpId: string, prev: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;

const createFollowUp = createFollowUpAction as unknown as CreateFollowUpAction;
const updateFollowUp = updateFollowUpAction as unknown as UpdateFollowUpAction;

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { Alert, Spinner } from "@/components/ui/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ActionResult {
  error?: string;
}

interface FollowUpFormProps {
  initialData?: {
    applicationId?: string | null;
    title: string;
    dueAt: string;
    status: string;
    notes?: string | null;
  };
  followUpId?: string;
  onSuccessRedirect: string;
}

export function FollowUpForm({ initialData, followUpId, onSuccessRedirect }: FollowUpFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    let result: ActionResult;
    if (followUpId) {
      result = await updateFollowUp(followUpId, undefined, formData);
    } else {
      result = await createFollowUp(undefined, formData);
    }
    if (result.error) {
      setError(result.error);
      setPending(false);
    } else {
      router.push(onSuccessRedirect);
      router.refresh();
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? "Edit Follow-up" : "New Follow-up"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert variant="danger">{error}</Alert>}

          <Field label="Application" htmlFor="applicationId">
            <Select
              id="applicationId"
              name="applicationId"
              defaultValue={initialData?.applicationId ?? ""}
              disabled={pending}
            >
              <option value="">— No application —</option>
            </Select>
          </Field>

          <Field label="Title" htmlFor="title" required>
            <Input
              id="title"
              name="title"
              defaultValue={initialData?.title ?? ""}
              placeholder="Send thank-you email"
              required
              maxLength={150}
              disabled={pending}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Due date" htmlFor="dueAt" required>
              <Input
                id="dueAt"
                name="dueAt"
                type="date"
                defaultValue={initialData?.dueAt ?? new Date().toISOString().split("T")[0]}
                required
                disabled={pending}
              />
            </Field>

            <Field label="Status" htmlFor="status" required>
              <Select
                id="status"
                name="status"
                defaultValue={initialData?.status ?? "pending"}
                required
                disabled={pending}
              >
                <option value="pending">Pending</option>
                <option value="done">Done</option>
                <option value="skipped">Skipped</option>
              </Select>
            </Field>
          </div>

          <Field label="Notes" htmlFor="notes">
            <Textarea
              id="notes"
              name="notes"
              defaultValue={initialData?.notes ?? ""}
              placeholder="Additional notes..."
              rows={3}
              maxLength={2000}
              disabled={pending}
            />
          </Field>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Link href={onSuccessRedirect} className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <div className="flex-1" />
            <Button type="submit" disabled={pending}>
              {pending ? <Spinner className="h-4 w-4" /> : null}
              {pending ? "Saving…" : initialData ? "Save changes" : "Create follow-up"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}