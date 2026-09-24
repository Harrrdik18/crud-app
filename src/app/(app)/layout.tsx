import { AppShell } from "@/components/layout/app-shell";
import { optionalUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await optionalUser();
  if (!user) {
    // This should not happen due to middleware, but guard anyway
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p>Redirecting...</p>
      </div>
    );
  }
  return <AppShell user={user}>{children}</AppShell>;
}