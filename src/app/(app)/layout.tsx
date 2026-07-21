import { logoutAction } from "@/actions/auth";
import { requireUser } from "@/data/workspaces";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserAvatar } from "@/components/ui/user-avatar";
import Link from "next/link";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen overflow-x-clip">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[color:var(--card)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 self-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primary)] font-mono text-sm font-semibold text-[var(--primary-foreground)]">
              TK
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">Taskora</p>
              <p className="text-xs text-[var(--muted)] sm:whitespace-nowrap">Operating system for product teams</p>
            </div>
          </Link>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:gap-3 lg:w-auto lg:flex-nowrap">
            <Link
              href="/profile"
              className="inline-flex rounded-full border px-3 py-2 text-sm text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
            >
              Profile
            </Link>
            <ThemeToggle />
            <form action={logoutAction}>
              <button className="rounded-full border px-3 py-2 text-sm text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]">
                Log out
              </button>
            </form>
            <UserAvatar user={user} />
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
