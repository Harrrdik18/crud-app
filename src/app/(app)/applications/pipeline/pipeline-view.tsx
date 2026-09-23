"use client";

import { useState } from "react";
import { changeStatusAction, deleteApplicationAction } from "@/app/actions/applications";
import { PipelineColumn } from "@/components/application/pipeline-column";
import { ApplicationWithRelations } from "@/services/application-service";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { STATUS_ORDER } from "@/lib/application-constants";

interface PipelineViewProps {
  grouped: Record<string, ApplicationWithRelations[]>;
  userId: string;
}

export function PipelineView({ grouped, userId }: PipelineViewProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  return (
    <div className="min-h-[calc(100vh-200px)]">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Application Pipeline</h1>
        <Link href="/applications/new">
          <Button>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Application
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {STATUS_ORDER.map((status) => (
            <PipelineColumn
              key={status}
              status={status}
              applications={grouped[status] ?? []}
              onStatusChange={async (appId, newStatus) => {
                setPendingId(appId);
                const formData = new FormData();
                formData.append("status", newStatus);
                await changeStatusAction(appId, undefined, formData);
                setPendingId(null);
              }}
              onDelete={async (appId) => {
                if (confirm("Delete this application?")) {
                  setPendingId(appId);
                  await deleteApplicationAction(appId);
                  setPendingId(null);
                }
              }}
              onView={() => {}}
              pendingId={pendingId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}