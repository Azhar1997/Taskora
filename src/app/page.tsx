import Link from "next/link";
import { ArrowRight, CheckCircle2, LayoutDashboard, KanbanSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const featureCards = [
  {
    title: "Workspace-first collaboration",
    description: "Organize teams into dedicated workspaces with members, roles, projects, and workspace settings.",
    icon: LayoutDashboard,
  },
  {
    title: "Project and task orchestration",
    description: "Track deadlines, priorities, ownership, comments, labels, and activity history in one place.",
    icon: KanbanSquare,
  },
  {
    title: "Secure full-stack architecture",
    description: "Built with Auth.js, Prisma, PostgreSQL, server actions, optimistic updates, and schema validation.",
    icon: ShieldCheck,
  },
];

const highlights = [
  "Protected dashboard routes with credential auth",
  "Workspace switching, member roles, and invite placeholders",
  "Project filtering, task CRUD, and Kanban drag-and-drop",
  "Activity feed, comments, analytics, seed data, and dark mode",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6">
        <header className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[var(--primary)] font-mono text-sm font-semibold text-[var(--primary-foreground)]">
              TK
            </div>
            <div className="min-w-0">
              <p className="font-semibold">Taskora</p>
              <p className="text-sm text-[var(--muted)]">Project management for product, engineering, and operations teams</p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Button asChild variant="ghost" className="w-full sm:w-auto">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </header>

        <main className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[var(--muted-foreground)]">
              Next.js / Prisma / Auth.js / Tailwind / dnd-kit
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl xl:text-6xl">
                A polished operating system for projects, product planning, and team execution.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--muted-foreground)]">
                Taskora is a production-style project management web application inspired by Linear, Jira, and Trello.
                It brings planning, prioritization, collaboration, and delivery tracking into a single workspace for modern teams.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/signup" className="gap-2">
                  Create workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {highlights.map((highlight) => (
                <div key={highlight} className="landing-highlight flex items-start gap-3 rounded-3xl border px-4 py-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" />
                  <span className="text-sm text-[var(--muted-foreground)]">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="rounded-[32px] p-6">
                  <div className="space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold">{feature.title}</h2>
                      <p className="text-sm leading-7 text-[var(--muted-foreground)]">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
            <Card className="overflow-hidden p-0">
              <div className="border-b px-6 py-4">
                <p className="text-sm font-semibold">Sample credentials</p>
                <p className="text-sm text-[var(--muted-foreground)]">Use the seeded workspace and team data to explore the product.</p>
              </div>
              <div className="grid gap-0 divide-y text-sm">
                <div className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <span>Ava</span>
                  <code className="break-all">ava@taskora.dev</code>
                </div>
                <div className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <span>Password</span>
                  <code>Password123!</code>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </section>
    </div>
  );
}
