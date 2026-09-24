"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/feedback";
import { Badge } from "@/components/ui/badge";
import { PaginatedResult } from "@/services/application-service";
import { ApplicationQuery, ApplicationStatus } from "@/lib/validation/schemas";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/application-constants";
import { formatDate, salaryLabel } from "@/lib/utils";
import { Search, X, ChevronLeft, ChevronRight, Briefcase, MapPin, DollarSign } from "lucide-react";
import { useState } from "react";

interface ApplicationsListProps {
  result: PaginatedResult<{
    id: string;
    userId: string;
    company: string;
    title: string;
    url: string | null;
    location: string | null;
    employmentType: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    salaryCurrency: string | null;
    salaryInterval: string | null;
    experience: string | null;
    description: string | null;
    status: ApplicationStatus;
    appliedAt: Date;
    source: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    interviewsCount?: number;
    followUpsCount?: number;
    notesCount?: number;
  }>;
  query: ApplicationQuery;
}

type FormQuery = {
  q: string;
  status: string;
  location: string;
  from: string;
  to: string;
  sort: string;
  page: number;
  pageSize: number;
};

const STATUSES: ApplicationStatus[] = ["saved", "applied", "screening", "interview", "offer", "rejected", "withdrawn"];

function toFormQuery(q: ApplicationQuery): FormQuery {
  return {
    q: q.q ?? "",
    status: q.status ?? "",
    location: q.location ?? "",
    from: q.from ?? "",
    to: q.to ?? "",
    sort: q.sort ?? "newest",
    page: q.page ?? 1,
    pageSize: q.pageSize ?? 12,
  };
}

export function ApplicationsList({ result, query }: ApplicationsListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [localQuery, setLocalQuery] = useState<FormQuery>(() => toFormQuery(query));

  const updateQuery = (key: string, value: string | number | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === undefined || value === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(localQuery).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
    });
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/applications");
  };

  const hasFilters = Boolean(localQuery.q || localQuery.status || localQuery.location || localQuery.from || localQuery.to);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Applications</h1>
        <Button asChild>
          <Link href="/applications/new">New Application</Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Search" htmlFor="q">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="q"
                name="q"
                placeholder="Company or title..."
                value={localQuery.q}
                onChange={(e) => setLocalQuery({ ...localQuery, q: e.target.value })}
                className="pl-10"
              />
            </div>
          </Field>

          <Field label="Status" htmlFor="status">
            <Select
              id="status"
              name="status"
              value={localQuery.status}
              onChange={(e) => setLocalQuery({ ...localQuery, status: e.target.value })}
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </Select>
          </Field>

          <Field label="Location" htmlFor="location">
            <Input
              id="location"
              name="location"
              placeholder="City, State"
              value={localQuery.location}
              onChange={(e) => setLocalQuery({ ...localQuery, location: e.target.value })}
            />
          </Field>

          <Field label="Applied from" htmlFor="from">
            <Input
              id="from"
              name="from"
              type="date"
              value={localQuery.from}
              onChange={(e) => setLocalQuery({ ...localQuery, from: e.target.value })}
            />
          </Field>

          <Field label="Applied to" htmlFor="to">
            <Input
              id="to"
              name="to"
              type="date"
              value={localQuery.to}
              onChange={(e) => setLocalQuery({ ...localQuery, to: e.target.value })}
            />
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Field label="Sort" htmlFor="sort" className="w-auto">
            <Select
              id="sort"
              name="sort"
              value={localQuery.sort}
              onChange={(e) => setLocalQuery({ ...localQuery, sort: e.target.value })}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="company">Company A-Z</option>
              <option value="status">Status</option>
            </Select>
          </Field>

          {hasFilters && (
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-3 w-3 mr-1" /> Clear filters
            </Button>
          )}

          <div className="flex-1" />
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {result.total} application{result.total !== 1 ? "s" : ""}
          </span>
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
        {result.data.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="h-8 w-8" />}
            title="No applications found"
            description={hasFilters ? "Try adjusting your filters or search terms." : "Start tracking your job applications."}
            action={
              <Button asChild>
                <Link href="/applications/new">Create your first application</Link>
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
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Salary</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Applied</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {result.data.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 dark:text-white">{app.company}</div>
                        {app.url && (
                          <a href={app.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline">
                            View posting
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{app.title}</td>
                      <td className="px-4 py-3">
                        {app.location ? (
                          <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                            <MapPin className="h-3 w-3" /> {app.location}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {salaryLabel(app) ? (
                          <span className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                            <DollarSign className="h-3 w-3" /> {salaryLabel(app)!}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_COLORS[app.status] ?? "default"}>
                          {STATUS_LABELS[app.status] ?? app.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(app.appliedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a href={`/applications/${app.id}`} className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
                          View
                        </a>
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
                    onClick={() => updateQuery("page", result.page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={result.page === result.totalPages}
                    onClick={() => updateQuery("page", result.page + 1)}
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