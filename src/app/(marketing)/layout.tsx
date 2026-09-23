import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { GithubIcon, LinkedinIcon } from "@/components/brand/social-icons";
import { Mail } from "lucide-react";
import { SOCIAL_LINKS, DEVELOPER_NAME } from "@/lib/site";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-white dark:bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="JobHunt OS home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-3" aria-label="Primary">
            <Link
              href="/features"
              className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:block dark:text-slate-300 dark:hover:text-white"
            >
              Features
            </Link>
            <Link
              href="/privacy"
              className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:block dark:text-slate-300 dark:hover:text-white"
            >
              Privacy
            </Link>
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row">
          <div>
            <Logo />
            <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
              Understand your job search. Not just your applications.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 text-sm text-slate-500 dark:text-slate-400 md:items-end">
            <span>
              Built by <span className="font-medium text-slate-700 dark:text-slate-200">{DEVELOPER_NAME}</span>
            </span>
            <div className="flex items-center gap-4">
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <GithubIcon className="h-4 w-4" aria-hidden="true" /> GitHub
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <LinkedinIcon className="h-4 w-4" aria-hidden="true" /> LinkedIn
              </a>
              <a
                href={`mailto:${SOCIAL_LINKS.email}`}
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <Mail className="h-4 w-4" aria-hidden="true" /> Email
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}