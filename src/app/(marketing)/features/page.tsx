import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Features" };

const groups = [
  {
    name: "Track",
    items: [
      ["Application pipeline", "Kanban-style boards for every stage with full status history."],
      ["Interviews", "Schedule, log progress, and record results and feedback."],
      ["Follow-ups", "Reminders tied to applications so nothing falls through the cracks."],
      ["Notes & details", "Job URLs, salary, sources, and per-application notes."],
    ],
  },
  {
    name: "Understand",
    items: [
      ["Dashboard", "Response rate, interview conversion, funnel, and what's due next."],
      ["Analytics", "Trends by week, status distribution, source performance, skill demand."],
      ["Search & filters", "URL-driven filtering, sorting, and pagination over your applications."],
    ],
  },
  {
    name: "Match",
    items: [
      ["Resume profile", "Skills, experience, education, and projects in one place."],
      ["Job analysis", "Structured extraction of requirements, skills, and keywords."],
      ["Match scores", "Estimated profile-to-job similarity with gaps and experience checks."],
    ],
  },
  {
    name: "Trust",
    items: [
      ["Private by design", "Every record owned by and scoped to your account."],
      ["Secure sessions", "Signed httpOnly cookies and scrypt-hashed passwords."],
      ["Honest AI", "AI is optional, labeled as an estimate, and never authoritative."],
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Features</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
        Everything you need to run a job search like a system — not a scramble.
      </p>
      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        {groups.map((g) => (
          <div key={g.name} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">{g.name}</h2>
            <ul className="mt-4 space-y-4">
              {g.items.map(([title, body]) => (
                <li key={title}>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-12 flex justify-center">
        <Button asChild>
          <Link href="/register">
            Try it free <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}