"use client";

import { ApplicationCard } from "./application-card";
import type { ApplicationWithRelations } from "@/services/application-service";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/application-constants";

interface PipelineColumnProps {
  status: string;
  applications: ApplicationWithRelations[];
  onStatusChange: (appId: string, newStatus: string) => void;
  onDelete: (appId: string) => void;
  onView: (appId: string) => void;
  pendingId: string | null;
}

export function PipelineColumn({ status, applications, onStatusChange, onDelete, onView, pendingId }: PipelineColumnProps) {
  return (
    <div className="flex flex-col min-w-[300px] max-w-[340px] w-full">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {STATUS_LABELS[status] ?? status}
        </h3>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {applications.length}
        </span>
      </div>
      <div className="space-y-3 min-h-[200px]">
        {applications.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center dark:border-slate-700">
            <p className="text-sm text-slate-400 dark:text-slate-500">Drop applications here</p>
          </div>
        ) : (
          applications.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              pendingId={pendingId}
            />
          ))
        )}
      </div>
    </div>
  );
}