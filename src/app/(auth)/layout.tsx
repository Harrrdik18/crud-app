import { redirect } from "next/navigation";
import Link from "next/link";
import { optionalUser } from "@/lib/auth";
import { Logo } from "@/components/brand/logo";
import { DeveloperFooter } from "@/components/brand/developer-footer";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await optionalUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-svh flex-col bg-gradient-to-b from-primary-50/60 to-white dark:from-slate-900 dark:to-slate-950">
      <header className="mx-auto flex w-full max-w-md items-center justify-between px-4 pt-8">
        <Link href="/" aria-label="JobHunt OS home">
          <Logo />
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          ← Back to site
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">{children}</main>
      <DeveloperFooter className="mx-auto w-full max-w-md px-4 pb-8" />
    </div>
  );
}