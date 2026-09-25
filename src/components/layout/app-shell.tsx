"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Briefcase,
  CalendarClock,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  ScanText,
  Settings,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { DeveloperFooter } from "@/components/brand/developer-footer";
import { Button } from "@/components/ui/button";
import { cn, initials } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";

interface AppShellProps {
  user: { id: string; name: string; email: string };
  children: React.ReactNode;
}

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/interviews", label: "Interviews", icon: CalendarClock },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/analyze", label: "Job Match", icon: ScanText },
  { href: "/profile", label: "Profile & Settings", icon: Settings },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-1 px-3" aria-label="Main navigation">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
            )}
            aria-current={active ? "page" : undefined}
          >
            <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ user, children }: AppShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  void pathname;

  const sidebar = (
    <div className="flex h-full flex-col py-6">
      <Link href="/" className="px-6" aria-label="JobHunt OS home">
        <Logo />
      </Link>
      <div className="mt-6">
        <NavLinks onNavigate={() => setOpen(false)} />
      </div>
      <div className="mt-auto px-3">
        <div className="mb-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white"
              aria-hidden="true"
            >
              {initials(user.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">{user.email}</p>
            </div>
          </div>
          <form action={logoutAction} className="mt-3">
            <Button type="submit" variant="secondary" size="sm" className="w-full justify-start">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Log out
            </Button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-svh bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl dark:bg-slate-900">
            <button
              className="absolute right-3 top-6 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      ) : null}

      {/* Top bar (mobile) */}
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden dark:border-slate-800 dark:bg-slate-900">
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
        <Logo markClassName="h-7 w-7 rounded-md" />
      </header>

      <main id="main" className="lg:pl-64">
        <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-10">
          <div className="flex-1">{children}</div>
          <DeveloperFooter className="mt-10 border-t border-slate-200 pt-5 dark:border-slate-800" />
        </div>
      </main>
    </div>
  );
}