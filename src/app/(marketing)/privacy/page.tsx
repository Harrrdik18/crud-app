import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

const sections = [
  {
    title: "Your data is yours",
    body: "Every application, interview, follow-up, note, resume detail, and analysis you create in JobHunt OS is stored under your account and scoped to you. Other users can never access it.",
  },
  {
    title: "What we store",
    body: "We store the account details you provide (name, email, hashed password) and the job-search data you enter. Passwords are hashed with scrypt; session cookies are signed and httpOnly.",
  },
  {
    title: "AI features",
    body: "AI features are optional. If you supply a job description for analysis and have enabled an AI provider, only the content you submit is sent to that provider. Analysis is presentational only — it is an estimate, not a determination.",
  },
  {
    title: "Analytics",
    body: "Product analytics only compute aggregates from your own stored data. We do not sell or share your personal data.",
  },
  {
    title: "Contact",
    body: "Questions about privacy? Reach the developer via the contact links in the footer.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Privacy</h1>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Last updated: September 2026</p>
      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{s.title}</h2>
            <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}