"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { Alert, Spinner } from "@/components/ui/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EMPLOYMENT_TYPES, APPLICATION_SOURCES } from "@/lib/application-constants";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type CreateAction = (prev: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;
type UpdateAction = (applicationId: string, prev: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;

interface ApplicationFormProps {
  initialData?: {
    company: string;
    title: string;
    url?: string | null;
    location?: string | null;
    employmentType?: string | null;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryCurrency?: string | null;
    salaryInterval?: string | null;
    experience?: string | null;
    description?: string | null;
    status?: string;
    appliedAt: string;
    source?: string | null;
    notes?: string | null;
  };
  action: CreateAction | UpdateAction;
  applicationId?: string;
  onSuccessRedirect: string;
}

interface ActionResult {
  error?: string;
}

export function ApplicationForm({ initialData, action, applicationId, onSuccessRedirect }: ApplicationFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    let result: ActionResult;
    if (applicationId) {
      result = await (action as UpdateAction)(applicationId, undefined, formData);
    } else {
      result = await (action as CreateAction)(undefined, formData);
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
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? "Edit Application" : "New Application"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert variant="danger">{error}</Alert>}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company" htmlFor="company" required>
              <Input
                id="company"
                name="company"
                defaultValue={initialData?.company ?? ""}
                placeholder="Acme Corp"
                required
                maxLength={150}
                disabled={pending}
              />
            </Field>
            <Field label="Job title" htmlFor="title" required>
              <Input
                id="title"
                name="title"
                defaultValue={initialData?.title ?? ""}
                placeholder="Senior Engineer"
                required
                maxLength={200}
                disabled={pending}
              />
            </Field>
          </div>

          <Field label="Job URL" htmlFor="url">
            <Input
              id="url"
              name="url"
              type="url"
              defaultValue={initialData?.url ?? ""}
              placeholder="https://example.com/job/123"
              maxLength={500}
              disabled={pending}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location" htmlFor="location">
              <Input
                id="location"
                name="location"
                defaultValue={initialData?.location ?? ""}
                placeholder="San Francisco, CA / Remote"
                maxLength={150}
                disabled={pending}
              />
            </Field>
            <Field label="Employment type" htmlFor="employmentType">
              <Select
                id="employmentType"
                name="employmentType"
                defaultValue={initialData?.employmentType ?? ""}
                disabled={pending}
              >
                <option value="">— Select —</option>
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Salary min" htmlFor="salaryMin">
              <Input
                id="salaryMin"
                name="salaryMin"
                type="number"
                defaultValue={initialData?.salaryMin ?? ""}
                placeholder="100000"
                min="0"
                max="100000000"
                disabled={pending}
              />
            </Field>
            <Field label="Salary max" htmlFor="salaryMax">
              <Input
                id="salaryMax"
                name="salaryMax"
                type="number"
                defaultValue={initialData?.salaryMax ?? ""}
                placeholder="150000"
                min="0"
                max="100000000"
                disabled={pending}
              />
            </Field>
            <Field label="Currency" htmlFor="salaryCurrency">
              <Input
                id="salaryCurrency"
                name="salaryCurrency"
                defaultValue={initialData?.salaryCurrency ?? "USD"}
                placeholder="USD"
                maxLength={8}
                disabled={pending}
              />
            </Field>
            <Field label="Interval" htmlFor="salaryInterval">
              <Select
                id="salaryInterval"
                name="salaryInterval"
                defaultValue={initialData?.salaryInterval ?? ""}
                disabled={pending}
              >
                <option value="">— Select —</option>
                <option value="year">Per year</option>
                <option value="month">Per month</option>
                <option value="hour">Per hour</option>
                <option value="one_time">One-time</option>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Experience required" htmlFor="experience">
              <Input
                id="experience"
                name="experience"
                defaultValue={initialData?.experience ?? ""}
                placeholder="3+ years"
                maxLength={200}
                disabled={pending}
              />
            </Field>
            <Field label="Date applied" htmlFor="appliedAt" required>
              <Input
                id="appliedAt"
                name="appliedAt"
                type="date"
                defaultValue={initialData?.appliedAt ?? new Date().toISOString().split("T")[0]}
                required
                disabled={pending}
              />
            </Field>
          </div>

          <Field label="Source" htmlFor="source">
            <Select
              id="source"
              name="source"
              defaultValue={initialData?.source ?? ""}
              disabled={pending}
            >
              <option value="">— Select —</option>
              {APPLICATION_SOURCES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </Field>

          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              defaultValue={initialData?.description ?? ""}
              placeholder="Paste job description here..."
              rows={6}
              maxLength={20000}
              disabled={pending}
            />
          </Field>

          <Field label="Notes" htmlFor="notes">
            <Textarea
              id="notes"
              name="notes"
              defaultValue={initialData?.notes ?? ""}
              placeholder="Internal notes..."
              rows={3}
              maxLength={10000}
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
              {pending ? "Saving…" : initialData ? "Save changes" : "Create application"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}