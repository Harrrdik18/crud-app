"use client";

import { formatRelative, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { deleteInterviewAction, updateInterviewAction } from "@/app/actions/interviews-followups";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User, MapPin, CheckCircle2, XCircle, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { INTERVIEW_TYPES, INTERVIEW_RESULTS, STATUS_COLORS } from "@/lib/application-constants";

type UpdateInterviewAction = (interviewId: string, prev: unknown, formData: FormData) => Promise<{ error?: string }>;
type DeleteInterviewAction = (interviewId: string) => Promise<void>;

const updateInterview: UpdateInterviewAction = updateInterviewAction as UpdateInterviewAction;
const deleteInterview: DeleteInterviewAction = deleteInterviewAction as DeleteInterviewAction;

interface InterviewDetailProps {
  interview: {
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
  };
}

export function InterviewDetail({ interview }: InterviewDetailProps) {
  const [deleting, setDeleting] = useState(false);

  const typeLabel = INTERVIEW_TYPES.find((t) => t.value === interview.type)?.label ?? interview.type;
  const resultLabel = INTERVIEW_RESULTS.find((r) => r.value === interview.result)?.label ?? interview.result;
  const resultColor = interview.result === "passed" ? "success" : interview.result === "failed" ? "danger" : "default";

  const handleDelete = async () => {
    if (confirm("Delete this interview? This cannot be undone.")) {
      setDeleting(true);
      await deleteInterview(interview.id);
      setDeleting(false);
    }
  };

  const handleResultChange = async (newResult: string) => {
    const formData = new FormData();
    formData.append("result", newResult);
    await updateInterview(interview.id, undefined, formData);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/interviews" className="text-slate-500 hover:text-slate-700 dark:text-slate-400">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{interview.company}</h1>
            <Badge variant={resultColor}>{resultLabel}</Badge>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-300">{interview.title}</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Interview Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>
                  <strong>Scheduled:</strong> {formatRelative(interview.scheduledAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>
                  <strong>Duration:</strong> {interview.durationMinutes ?? "—"} min
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="h-4 w-4 text-slate-400" />
                <span>
                  <strong>Type:</strong> {INTERVIEW_TYPES.find((t) => t.value === interview.type)?.label ?? interview.type}
                </span>
              </div>
              {interview.interviewer && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <User className="h-4 w-4 text-slate-400" />
                  <span>
                    <strong>Interviewer:</strong> {interview.interviewer}
                  </span>
                </div>
              )}
              {interview.location && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>
                    <strong>Location:</strong> {interview.location}
                  </span>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Result & Feedback</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {INTERVIEW_RESULTS.map((r) => (
                <Button
                  key={r.value}
                  variant={interview.result === r.value ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    interview.result === r.value &&
                      (r.value === "passed" ? "bg-emerald-600 text-white hover:bg-emerald-700" :
                       r.value === "failed" ? "bg-red-600 text-white hover:bg-red-700" :
                       r.value === "cancelled" ? "bg-slate-600 text-white hover:bg-slate-700" :
                       "bg-primary-600 text-white hover:bg-primary-700")
                  )}
                  onClick={() => handleResultChange(r.value)}
                >
                  {r.label}
                </Button>
              ))}
            </div>

            {interview.feedback && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Feedback</h4>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{interview.feedback}</p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex gap-2">
              <Link href={`/interviews/${interview.id}/edit`}>
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
                {deleting ? "Deleting…" : "Delete interview"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {interview.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Preparation Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate max-w-none dark:prose-invert whitespace-pre-wrap text-sm">
              {interview.notes}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}