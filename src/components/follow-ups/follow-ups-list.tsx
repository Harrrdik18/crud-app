"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/feedback";
import { Badge } from "@/components/ui/badge";
import { PaginatedResult } from "@/services/followup-service";
import { STATUS_COLORS } from "@/lib/application-constants";
import { formatDate, formatRelative } from "@/lib/utils";
import { Calendar, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface FollowUpsListProps {
  result: PaginatedResult<{
    id: string;
    applicationId: string | null;
    userId: string;
    title: string;
    dueAt: Date;
    status: string;
    notes: string | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    company: string | null;
    appTitle: string | null;
  }>;
  query: {
    page: number;
    pageSize: number;
    status?: string;
    applicationId?: string;
  };
}

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "done", label: "Done" },
  { value: "skipped", label: "Skipped" },
];

export function FollowUpsList({ result, query }: FollowUpsListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [localQuery, setLocalQuery] = useState({
    status: query.status ?? "",
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
    router.push("/follow-ups");
  };

  const hasFilters = Boolean(localQuery.status || localQuery.applicationId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Follow-ups</h1>
        <Button asChild>
          <Link href="/follow-ups/new">New Follow-up</Link>
        </Button>
      </div>

      <form className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Status" htmlFor="status">
            <Select
              id="status"
              name="status"
              value={localQuery.status}
              onChange={(e) => setLocalQuery({ ...localQuery, status: e.target.value })}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
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
            {result.total} follow-up{result.total !== 1 ? "s" : ""}
          </span>
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
        {result.data.length === 0 ? (
          <EmptyState
            icon={<Calendar className="h-8 w-8" />}
            title="No follow-ups found"
            description={hasFilters ? "Try adjusting your filters." : "Add follow-ups from application details."}
            action={
              <Button asChild>
                <Link href="/follow-ups/new">Create follow-up</Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Application</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Due</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {result.data.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{f.title}</td>
                      <td className="px-4 py-3">
                        {f.company && f.appTitle ? (
                          <div className="text-sm text-slate-600 dark:text-slate-300">{f.company} — {f.appTitle}</div>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {formatRelative(f.dueAt)}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">{formatDate(f.dueAt)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_COLORS[f.status] ?? "default"}>
                          {f.status === "pending" ? "Pending" : f.status === "done" ? "Done" : "Skipped"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/follow-ups/${f.id}`} className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
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