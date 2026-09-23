"use client";

import { formatDate, salaryLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Briefcase, MapPin, DollarSign, Calendar } from "lucide-react";
import type { ApplicationWithRelations } from "@/services/application-service";
import { STATUS_COLORS } from "@/lib/application-constants";

interface ApplicationCardProps {
  app: ApplicationWithRelations;
  onStatusChange: (appId: string, status: string) => void;
  onDelete: (appId: string) => void;
  pendingId: string | null;
}

export function ApplicationCard({ app, onStatusChange, onDelete, pendingId }: ApplicationCardProps) {
  const statusColor = STATUS_COLORS[app.status] ?? "default";
  const isPending = pendingId === app.id;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900 truncate dark:text-white">{app.company}</h3>
            <Badge variant={statusColor}>{app.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600 truncate dark:text-slate-300">{app.title}</p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            {app.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {app.location}
              </span>
            )}
            {salaryLabel(app) && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" aria-hidden="true" />
                {salaryLabel(app)!}
              </span>
            )}
            {app.employmentType && (
              <Badge variant="outline" className="text-[10px]">
                {app.employmentType.replace("_", " ")}
              </Badge>
            )}
          </div>

          {app.appliedAt && (
            <p className="mt-2 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              Applied {formatDate(app.appliedAt)}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
            {app.interviewsCount && app.interviewsCount > 0 && (
              <Badge variant="outline" className="gap-1 text-[10px] h-5">
                <Briefcase className="h-3 w-3" /> {app.interviewsCount} interview{app.interviewsCount > 1 ? "s" : ""}
              </Badge>
            )}
            {app.followUpsCount && app.followUpsCount > 0 && (
              <Badge variant="outline" className="gap-1 text-[10px] h-5" style={{ color: "#f59e0b" }}>
                {app.followUpsCount} follow-up{app.followUpsCount > 1 ? "s" : ""}
              </Badge>
            )}
            {app.notesCount && app.notesCount > 0 && (
              <Badge variant="outline" className="gap-1 text-[10px] h-5">
                {app.notesCount} note{app.notesCount > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" disabled={isPending} onClick={() => onStatusChange(app.id, app.status)} className="text-slate-500 hover:text-slate-700">
            <MoreVertical className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" disabled={isPending} onClick={() => onDelete(app.id)} className="text-red-500 hover:text-red-700">
            <MoreVertical className="h-4 w-4 rotate-90" />
          </Button>
        </div>
      </div>
    </article>
  );
}