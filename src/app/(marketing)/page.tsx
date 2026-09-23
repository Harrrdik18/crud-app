import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  KanbanSquare,
  ScanText,
  CheckCircle2,
  PieChart,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Understand your job search. Not just your applications.",
  description:
    "JobHunt OS is a command center for job seekers — track opportunities, analyze job descriptions against your resume, and understand what's actually working.",
  openGraph: {
    title: "JobHunt OS",
    description: "The command center for a smarter job search.",
    type: "website",
  },
};

function HeroPreview() {
  const columns = [
    { name: "Saved", color: "bg-slate-400", apps: [["Acme", "Senior Engineer"], ["Globex", "Product Designer"]] },
    { name: "Applied", color: "bg-sky-500", apps: [["Initech", "Backend Engineer"], ["Umbrella", "React Dev"]] },
    { name: "Interview", color: "bg-indigo-500", apps: [["Stark", "Staff Engineer"]] },
    { name: "Offer", color: "bg-emerald-500", apps: [["Wayne Co", "Fullstack Dev"]] },
  ];
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-2xl shadow-primary-900/10 backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/80">
      <div className="flex items-center gap-2 rounded-t-xl border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <span className="ml-3 text-xs font-medium text-slate-400">jobhunt.os/dashboard</span>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
        {columns.map((col) => (
          <div key={col.name} className="space-y-2">
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${col.color}`} />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {col.name}
              </span>
              <span className="ml-auto rounded-full bg-slate-100 px-1.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {col.apps.length}
              </span>
            </div>
            {col.apps.map(([company, role], i) => (
              <div
                key={company}
                className={`rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-800 ${i > 0 ? "opacity-75" : ""}`}
              >
                <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{company}</p>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{role}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 border-t border-slate-100 p-4 sm:grid-cols-4 dark:border-slate-800">
        {[
          ["Interview rate", "42%", "text-sky-600"],
          ["Response rate", "38%", "text-indigo-600"],
          ["Applications", "24", "text-slate-700"],
          ["Offers", "3", "text-emerald-600"],
        ].map(([label, value, color]) => (
          <div key={label}>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{label}</p>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const features = [
  {
    icon: KanbanSquare,
    title: "A pipeline that actually moves",
    body: "Drag-free, status-driven kanban boards for every stage — Saved → Applied → Screening → Interview → Offer. Each move is recorded in a full application history.",
  },
  {
    icon: ScanText,
    title: "Resume ↔ job matching",
    body: "Paste any job description and see an estimated profile-to-job similarity: matching skills, gaps, and an experience assessment. Clearly labeled as an estimate, never a promise.",
  },
  {
    icon: BarChart3,
    title: "Analytics from your data",
    body: "Response rates, interview conversion, sources that work, and funnel insights — computed from your actual applications, not generic advice.",
  },
  {
    icon: BrainCircuit,
    title: "AI that helps, not hijacks",
    body: "Extract skills and requirements from job posts and surface patterns in your search. Fully optional — the product works without an API key.",
  },
  {
    icon: Target,
    title: "Interviews & follow-ups",
    body: "Upcoming interviews and follow-up reminders keep the ball rolling — and the dashboard makes sure you never miss a thank-you email again.",
  },
  {
    icon: PieChart,
    title: "Your profile, your resume",
    body: "Maintain skills, experience, education, and projects once. Every future match and analysis uses that single source of truth.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-white dark:bg-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary-50 via-white to-white dark:from-primary-950/40 dark:via-slate-950 dark:to-slate-950" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="flex flex-col items-center text-center">
            <Badge variant="primary" className="mb-5">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Your job search, in one operating system
            </Badge>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
              Understand your job search.
              <span className="block text-slate-400 dark:text-slate-500">Not just your applications.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              Track opportunities, analyze job descriptions against your skills, and understand
              what&apos;s actually working in your search.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  Start searching smarter <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/login">Log in</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
              Free to start · No credit card · Your data stays yours
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-4xl">
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-4 py-10 sm:grid-cols-4 sm:px-6">
          {[
            ["7", "pipeline stages"],
            ["24", "search metrics tracked"],
            ["1", "resume, matched across every job"],
            ["∞", "apps you can track"],
          ].map(([big, small]) => (
            <div key={small} className="text-center">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{big}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{small}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            Why JobHunt OS
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Built for the way people actually job search
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Not a spreadsheet. Not a to-do list. A command center that turns messy
            applications into decisions.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white dark:bg-primary-950 dark:text-primary-400 dark:group-hover:bg-primary-600 dark:group-hover:text-white">
                <f.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Matching demo section */}
      <section className="border-y border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <Badge variant="success" className="mb-4">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Job match
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              See how your profile stacks up — honestly
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              Every job description gets an estimated profile-to-job similarity based on your
              actual resume. Matching skills, real gaps, experience assessment. No inflated
              scores — because a match score can&apos;t measure how well you&apos;ll perform
              in an interview.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Structured output: skills, gaps, experience, keywords",
                "Works offline with deterministic analysis, or AI-refined",
                "Every result stored with its source and method",
              ].map((li) => (
                <li key={li} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                  {li}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-primary-900/5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Senior Fullstack Engineer</p>
                <p className="text-xs text-slate-400">Acme Corp</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">78%</span>
                <span className="text-xs text-slate-400">
                  estimated
                  <br />
                  match
                </span>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm dark:border-emerald-900 dark:bg-emerald-950">
                <span className="font-medium text-emerald-700 dark:text-emerald-300">Matching skills</span>
                <span className="text-emerald-600 dark:text-emerald-400">React · Node.js · PostgreSQL</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-900 dark:bg-amber-950">
                <span className="font-medium text-amber-700 dark:text-amber-300">Potential gaps</span>
                <span className="text-amber-600 dark:text-amber-400">Docker · GraphQL</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm dark:border-sky-900 dark:bg-sky-950">
                <span className="font-medium text-sky-700 dark:text-sky-300">Experience</span>
                <span className="text-sky-600 dark:text-sky-400">Meets 5+ years requirement</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics demo section */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-primary-900/5 lg:order-1 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary-600" aria-hidden="true" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Applications this week</p>
            </div>
            <div className="mt-4 flex h-36 items-end gap-2">
              {[35, 55, 40, 70, 50, 85, 65].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-md bg-primary-200 dark:bg-primary-800" style={{ height: `${h}%` }} />
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Weekly application volume from your data — spot trends, don&apos;t guess.
            </p>
          </div>
          <div className="order-1 lg:order-2">
            <Badge variant="info" className="mb-4">
              <BarChart3 className="h-3 w-3" aria-hidden="true" /> Analytics
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Insights you can act on
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              Which sources produce interviews? Where are applications stalling in your funnel?
              What skills do companies keep asking for? If the data doesn&apos;t support an
              insight, the product won&apos;t invent it.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-slate-950 py-20 dark:bg-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.25),transparent_60%)]" />
        <div className="relative mx-auto w-full max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Stop juggling spreadsheets and tabs.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
            Start your search with a system that understands it.
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg" className="text-base">
              <Link href="/register">
                Create your free account <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}