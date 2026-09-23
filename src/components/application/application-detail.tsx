"use client";

import { formatDate, formatDateTime, salaryLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { changeStatusAction, deleteApplicationAction } from "@/app/actions/applications";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, DollarSign, Briefcase, Calendar, Clock, BriefcaseBusiness } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, STATUS_ORDER, STATUS_COLORS, EMPLOYMENT_TYPES } from "@/lib/application-constants";
import type { ApplicationWithRelations } from "@/services/application-service";

interface ApplicationDetailProps {
  app: ApplicationWithRelations;
  statusOrder: readonly string[];
}

export function ApplicationDetail({ app, statusOrder }: ApplicationDetailProps) {
  const [deleting, setDeleting] = useState(false);

  const statusColor = STATUS_COLORS[app.status] ?? "default";
  const currentIndex = statusOrder.indexOf(app.status);
  const canAdvance = currentIndex < statusOrder.length - 1;
  const nextStatus = canAdvance ? statusOrder[currentIndex + 1] : null;

  const handleAdvance = async () => {
    if (nextStatus) {
      const formData = new FormData();
      formData.append("status", nextStatus);
      await changeStatusAction(app.id, undefined, formData);
    }
  };

  const handleDelete = async () => {
    if (confirm("Delete this application? This cannot be undone.")) {
      setDeleting(true);
      await deleteApplicationAction(app.id);
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/applications" className="text-slate-500 hover:text-slate-700 dark:text-slate-400">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{app.company}</h1>
            <Badge variant={statusColor}>{app.status}</Badge>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-300">{app.title}</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {app.url && (
              <a href={app.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-600 hover:underline">
                View job posting
              </a>
            )}

            <dl className="space-y-3 text-sm">
              {app.location && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>{app.location}</span>
                </div>
              )}
              {salaryLabel(app) && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <span>{salaryLabel(app)!}</span>
                </div>
              )}
              {app.employmentType && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <BriefcaseBusiness className="h-4 w-4 text-slate-400" />
                  <span>{EMPLOYMENT_TYPES.find((t) => t.value === app.employmentType)?.label ?? app.employmentType}</span>
                </div>
              )}
              {app.experience && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>Experience: {app.experience}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Applied {formatDate(app.appliedAt)}</span>
              </div>
              {app.source && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span>Source: {app.source.replace("_", " ")}</span>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Progression</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {statusOrder.map((status, idx) => {
                const isCurrent = status === app.status;
                const isPassed = idx < currentIndex;
                return (
                  <div
                    key={status}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                      isCurrent && "bg-primary-50 dark:bg-primary-950/50",
                      isPassed && "bg-emerald-50 dark:bg-emerald-950/50",
                    )}
                  >
                    <div
                      className={cn(
                        "h-3 w-3 rounded-full border-2 flex-shrink-0",
                        isCurrent ? "bg-primary-600 border-primary-600" :
                        isPassed ? "bg-emerald-500 border-emerald-500" :
                        "border-slate-300 dark:border-slate-600"
                      )}
                    />
                    <span className={cn(
                      "text-sm font-medium",
                      isCurrent ? "text-primary-700 dark:text-primary-300" :
                      isPassed ? "text-emerald-700 dark:text-emerald-300" :
                      "text-slate-500 dark:text-slate-400"
                    )}>
                      {STATUS_LABELS[status] ?? status}
                    </span>
                    {isCurrent && (
                      <span className="ml-auto text-xs text-primary-600 dark:text-primary-400">Current</span>
                    )}
                    {isPassed && (
                      <span className="ml-auto text-xs text-emerald-600 dark:text-emerald-400">Completed</span>
                    )}
                  </div>
                );
              })}
            </div>

            {canAdvance && (
              <Button onClick={handleAdvance} variant="outline" className="w-full">
                Advance to {STATUS_LABELS[nextStatus!] ?? nextStatus}
              </Button>
            )}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete application"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {app.description && (
        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate max-w-none dark:prose-invert whitespace-pre-wrap text-sm">
              {app.description}
            </div>
          </CardContent>
        </Card>
      )}

      {app.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate max-w-none dark:prose-invert whitespace-pre-wrap text-sm">
              {app.notes}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}