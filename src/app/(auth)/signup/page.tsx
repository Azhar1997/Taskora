import Link from "next/link";
import { signupAction } from "@/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { Card } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-96px)] max-w-5xl items-center px-4 py-10 sm:px-6 sm:py-12">
      <div className="grid w-full gap-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Create your workspace</p>
          <h1 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">Launch a clean planning environment for your projects in minutes.</h1>
          <p className="max-w-xl text-lg text-[var(--muted-foreground)]">
            Signing up creates a default owner workspace, secure password record, and protected account session.
          </p>
        </div>
        <Card className="space-y-5 p-6 sm:p-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Sign up</h2>
            <p className="text-sm text-[var(--muted-foreground)]">Built with React Hook Form, Zod, and Auth.js-compatible credentials.</p>
          </div>
          <AuthForm action={signupAction} mode="signup" />
          <p className="text-sm text-[var(--muted-foreground)]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--primary)]">
              Log in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
