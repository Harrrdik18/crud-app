"use client";

import { formatRelative, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteFollowUpAction, updateFollowUpAction } from "@/app/actions/interviews-followups";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/application-constants";

interface FollowUpDetailProps {
  followUp: {
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
  };
}

export function FollowUpDetail({ followUp }: FollowUpDetailProps) {
  const [deleting, setDeleting] = useState(false);

  const statusColor = STATUS_COLORS[followUp.status] ?? "default";

  const handleDelete = async () => {
    if (confirm("Delete this follow-up? This cannot be undone.")) {
      setDeleting(true);
      await deleteFollowUpAction(followUp.id);
      setDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    const formData = new FormData();
    formData.append("status", newStatus);
    await updateFollowUpAction(followUp.id, undefined, formData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/follow-ups" className="text-slate-500 hover:text-slate-700 dark:text-slate-400">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{followUp.title}</h1>
            <Badge variant={statusColor}>{followUp.status === "pending" ? "Pending" : followUp.status === "done" ? "Done" : "Skipped"}</Badge>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Follow-up Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {followUp.company && followUp.appTitle && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>
                <strong>Application:</strong> {followUp.company} — {followUp.appTitle}
              </span>
            </div>
          )}

          <dl className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>
                <strong>Due:</strong> {formatRelative(followUp.dueAt)} ({formatDate(followUp.dueAt)})
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="h-4 w-4 text-slate-400" />
              <span>
                <strong>Status:</strong> {followUp.status === "pending" ? "Pending" : followUp.status === "done" ? "Done" : "Skipped"}
              </span>
            </div>
            {followUp.completedAt && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>
                  <strong>Completed:</strong> {formatRelative(followUp.completedAt)}
                </span>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Update Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "pending", label: "Pending", color: "default" },
              { value: "done", label: "Done", color: "success" },
              { value: "skipped", label: "Skipped", color: "warning" },
            ].map((s) => (
              <Button
                key={s.value}
                variant={followUp.status === s.value ? "default" : "outline"}
                size="sm"
                className={cn(
                  followUp.status === s.value &&
                    (s.color === "success" ? "bg-emerald-600 text-white hover:bg-emerald-700" :
                     s.color === "warning" ? "bg-amber-600 text-white hover:bg-amber-700" :
                     "bg-primary-600 text-white hover:bg-primary-700")
                )}
                onClick={() => handleStatusChange(s.value)}
              >
                {s.label}
              </Button>
            ))}
          </div>

          {followUp.notes && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Notes</h4>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{followUp.notes}</p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex gap-2">
            <Link href={`/follow-ups/${followUp.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete follow-up"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}