"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/feedback";
import { Badge } from "@/components/ui/badge";
import { PaginatedResult } from "@/services/interview-service";
import { INTERVIEW_TYPES, INTERVIEW_RESULTS, STATUS_COLORS } from "@/lib/application-constants";
import { formatDate, formatRelative, cn } from "@/lib/utils";
import { Calendar, Clock, CheckCircle2, XCircle, Search, X, ChevronLeft, ChevronRight, Plus, Filter } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface InterviewsListProps {
  result: PaginatedResult<{
    id: string;
    applicationId: string;
    userId: string;
    type: string;
    scheduledAt: Date;
    durationMinutes: number | null;
    interviewer: string | null;
    location: string | null;
    notes: string | null;
    result: string;
    feedback: string | null;
    createdAt: Date;
    updatedAt: Date;
    company: string;
    title: string;
  }>;
  query: {
    page: number;
    pageSize: number;
    from?: string;
    to?: string;
    applicationId?: string;
  };
}

export function InterviewsList({ result, query }: InterviewsListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [localQuery, setLocalQuery] = useState({
    from: query.from ?? "",
    to: query.to ?? "",
    applicationId: query.applicationId ?? "",
  });

  const updateQuery = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === undefined || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/interviews");
  };

  const hasFilters = Boolean(localQuery.from || localQuery.to || localQuery.applicationId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Interviews</h1>
        <Button asChild>
          <Link href="/interviews/new">New Interview</Link>
        </Button>
      </div>

      <form className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="From" htmlFor="from">
            <Input
              id="from"
              name="from"
              type="date"
              value={localQuery.from}
              onChange={(e) => setLocalQuery({ ...localQuery, from: e.target.value })}
            />
          </Field>
          <Field label="To" htmlFor="to">
            <Input
              id="to"
              name="to"
              type="date"
              value={localQuery.to}
              onChange={(e) => setLocalQuery({ ...localQuery, to: e.target.value })}
            />
          </Field>
          <Field label="Application" htmlFor="applicationId">
            <Select
              id="applicationId"
              name="applicationId"
              value={localQuery.applicationId}
              onChange={(e) => setLocalQuery({ ...localQuery, applicationId: e.target.value })}
            >
              <option value="">All applications</option>
            </Select>
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {hasFilters && (
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-3 w-3 mr-1" /> Clear filters
            </Button>
          )}
          <div className="flex-1" />
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {result.total} interview{result.total !== 1 ? "s" : ""}
          </span>
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
        {result.data.length === 0 ? (
          <EmptyState
            icon={<Calendar className="h-8 w-8" />}
            title="No interviews scheduled"
            description={hasFilters ? "Try adjusting your filters." : "Schedule your first interview to get started."}
            action={
              <Button asChild>
                <Link href="/interviews/new">Schedule interview</Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Scheduled</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Result</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {result.data.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 dark:text-white">{i.company}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{i.title}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {formatRelative(i.scheduledAt)}
                        </div>
                        {i.durationMinutes && (
                          <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {i.durationMinutes} min
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                        {INTERVIEW_TYPES.find((t) => t.value === i.type)?.label ?? i.type}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={i.result === "passed" ? "success" : i.result === "failed" ? "danger" : "default"}>
                          {INTERVIEW_RESULTS.find((r) => r.value === i.result)?.label ?? i.result}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/interviews/${i.id}`} className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {result.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Page {result.page} of {result.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={result.page === 1}
                    onClick={() => updateQuery("page", String(result.page - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={result.page === result.totalPages}
                    onClick={() => updateQuery("page", String(result.page + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}