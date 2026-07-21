import Link from "next/link";
import { loginAction } from "@/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-96px)] max-w-5xl items-center px-4 py-10 sm:px-6 sm:py-12">
      <div className="grid w-full gap-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Welcome back</p>
          <h1 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">Log in to manage workspaces, projects, and execution flow.</h1>
          <p className="max-w-xl text-lg text-[var(--muted-foreground)]">
            Sign in with an existing workspace account or create a new organization in a few minutes.
          </p>
          <Card className="max-w-xl space-y-2">
            <p className="font-semibold">Sample access</p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Email: <code>ava@taskora.dev</code>
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Password: <code>Password123!</code>
            </p>
          </Card>
        </div>
        <Card className="space-y-5 p-6 sm:p-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Log in</h2>
            <p className="text-sm text-[var(--muted-foreground)]">Secure credentials authentication with protected dashboard routes.</p>
          </div>
          <AuthForm action={loginAction} mode="login" />
          <p className="text-sm text-[var(--muted-foreground)]">
            Need an account?{" "}
            <Link href="/signup" className="font-semibold text-[var(--primary)]">
              Create one
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
