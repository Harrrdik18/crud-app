"use client";

import { useState } from "react";
import { createInterviewAction, updateInterviewAction } from "@/app/actions/interviews-followups";

type CreateInterviewAction = (prev: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;
type UpdateInterviewAction = (interviewId: string, prev: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;

const createInterview = createInterviewAction as unknown as CreateInterviewAction;
const updateInterview = updateInterviewAction as unknown as UpdateInterviewAction;

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { Alert, Spinner } from "@/components/ui/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { INTERVIEW_TYPES, INTERVIEW_RESULTS } from "@/lib/application-constants";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User, MapPin } from "lucide-react";

interface ActionResult {
  error?: string;
}

interface InterviewFormProps {
  initialData?: {
    applicationId: string;
    type: string;
    scheduledAt: string;
    durationMinutes?: number | null;
    interviewer?: string | null;
    location?: string | null;
    notes?: string | null;
    result?: string;
    feedback?: string | null;
  };
  interviewId?: string;
  onSuccessRedirect: string;
}

const defaultScheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

export function InterviewForm({ initialData, interviewId, onSuccessRedirect }: InterviewFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    let result: ActionResult;
    if (interviewId) {
      result = await updateInterview(interviewId, undefined, formData);
    } else {
      result = await createInterview(undefined, formData);
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
        <CardTitle>{initialData ? "Edit Interview" : "Schedule Interview"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert variant="danger">{error}</Alert>}

          <Field label="Application" htmlFor="applicationId" required>
            <Select
              id="applicationId"
              name="applicationId"
              defaultValue={initialData?.applicationId ?? ""}
              disabled={pending || !!interviewId}
              required
            >
              <option value="">— Select application —</option>
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Interview type" htmlFor="type" required>
              <Select
                id="type"
                name="type"
                defaultValue={initialData?.type ?? "video"}
                disabled={pending}
                required
              >
                {INTERVIEW_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </Field>

            <Field label="Scheduled date & time" htmlFor="scheduledAt" required>
              <Input
                id="scheduledAt"
                name="scheduledAt"
                type="datetime-local"
                defaultValue={initialData?.scheduledAt ?? defaultScheduledAt}
                required
                disabled={pending}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Duration (minutes)" htmlFor="durationMinutes">
              <Input
                id="durationMinutes"
                name="durationMinutes"
                type="number"
                defaultValue={initialData?.durationMinutes ?? 60}
                placeholder="60"
                min="5"
                max="600"
                disabled={pending}
              />
            </Field>

            <Field label="Interviewer" htmlFor="interviewer">
              <Input
                id="interviewer"
                name="interviewer"
                defaultValue={initialData?.interviewer ?? ""}
                placeholder="Jane Smith"
                maxLength={150}
                disabled={pending}
              />
            </Field>
          </div>

          <Field label="Location" htmlFor="location">
            <Input
              id="location"
              name="location"
              defaultValue={initialData?.location ?? ""}
              placeholder="Zoom link / Office address"
              maxLength={200}
              disabled={pending}
            />
          </Field>

          <Field label="Notes" htmlFor="notes">
            <Textarea
              id="notes"
              name="notes"
              defaultValue={initialData?.notes ?? ""}
              placeholder="Preparation notes, questions to ask..."
              rows={3}
              maxLength={5000}
              disabled={pending}
            />
          </Field>

          <Field label="Result" htmlFor="result">
            <Select
              id="result"
              name="result"
              defaultValue={initialData?.result ?? "unknown"}
              disabled={pending}
            >
              {INTERVIEW_RESULTS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Select>
          </Field>

          <Field label="Feedback" htmlFor="feedback">
            <Textarea
              id="feedback"
              name="feedback"
              defaultValue={initialData?.feedback ?? ""}
              placeholder="Post-interview feedback..."
              rows={3}
              maxLength={5000}
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
              {pending ? "Saving…" : initialData ? "Save changes" : "Schedule interview"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

interface ActionResult {
  error?: string;
}