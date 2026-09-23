import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { Alert } from "@/components/ui/feedback";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ changed?: string }>;
}) {
  const { changed } = await searchParams;

  return (
    <>
      {changed === "1" && (
        <div className="mb-4">
          <Alert variant="success">Password updated. Please log in with your new password.</Alert>
        </div>
      )}
      <LoginForm />
    </>
  );
}