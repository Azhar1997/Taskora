import { createWorkspace } from "@/actions/workspace";
import { ProgressChart } from "@/components/analytics/progress-chart";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getDashboardData, requireUser } from "@/data/workspaces";
import { formatRelativeDate } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const data = await getDashboardData(user.id);
  const filters = await searchParams;
  const q = filters.q?.trim().toLowerCase() ?? "";
  const matchingProjects = q
    ? data.searchableProjects.filter(
        (project) => project.name.toLowerCase().includes(q) || project.description?.toLowerCase().includes(q),
      )
    : [];
  const matchingTasks = q
    ? data.tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(q) ||
          task.description?.toLowerCase().includes(q) ||
          task.project.name.toLowerCase().includes(q),
      )
    : [];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Main dashboard</p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Keep delivery visible across every workspace.</h1>
            <p className="max-w-2xl text-[var(--muted-foreground)] leading-7">
              Monitor open work, completed delivery, overdue items, and your active assignments from one central dashboard.
            </p>
          </div>
          <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <Input name="q" placeholder="Global search for projects and tasks..." defaultValue={filters.q ?? ""} />
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Projects" value={data.totalProjects} hint="Total projects across your workspaces." />
            <StatCard label="Open tasks" value={data.openTasks.length} hint="Tasks that still need action." />
            <StatCard label="Completed" value={data.completedTasks.length} hint="Finished tasks shipped by the team." />
            <StatCard label="Overdue" value={data.overdueTasks.length} hint="Unfinished tasks past their due date." />
          </div>
        </Card>
        <Card className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Create workspace</p>
            <h2 className="mt-2 text-2xl font-semibold">Spin up a new team space</h2>
          </div>
          <form action={createWorkspace} className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Workspace name</label>
              <Input name="name" placeholder="Client Delivery" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea name="description" placeholder="What kind of work happens here?" />
            </div>
            <Button type="submit" className="w-full">
              Create workspace
            </Button>
          </form>
        </Card>
      </section>

      {q ? (
        <section className="grid gap-6 2xl:grid-cols-[1fr_1fr]">
          <Card className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Project matches</p>
              <h2 className="mt-2 text-2xl font-semibold">{matchingProjects.length} project results</h2>
            </div>
            <div className="space-y-3">
              {matchingProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/workspace/${project.workspace.slug}/projects/${project.id}`}
                  className="block rounded-3xl border bg-[var(--card-strong)] p-4 hover:border-[var(--primary)]"
                >
                  <p className="font-semibold">{project.name}</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{project.description}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">{project.workspace.name}</p>
                </Link>
              ))}
              {!matchingProjects.length ? (
                <EmptyState title="No project matches" description="Try a broader phrase, owner name, or project theme." />
              ) : null}
            </div>
          </Card>
          <Card className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Task matches</p>
              <h2 className="mt-2 text-2xl font-semibold">{matchingTasks.length} task results</h2>
            </div>
            <div className="space-y-3">
              {matchingTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/workspace/${task.project.workspace.slug}/projects/${task.project.id}`}
                  className="block rounded-3xl border bg-[var(--card-strong)] p-4 hover:border-[var(--primary)]"
                >
                  <p className="font-semibold">{task.title}</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{task.description}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">{task.project.name}</p>
                </Link>
              ))}
              {!matchingTasks.length ? (
                <EmptyState title="No task matches" description="Search by task title, description, or project name." />
              ) : null}
            </div>
          </Card>
        </section>
      ) : null}

      <section className="grid gap-6 2xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Task progress</p>
              <h2 className="mt-2 text-2xl font-semibold">Work distribution</h2>
            </div>
          </div>
          <ProgressChart data={data.backlogMix} />
        </Card>
        <Card className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Assigned to you</p>
            <h2 className="mt-2 text-2xl font-semibold">Current focus</h2>
          </div>
          <div className="space-y-3">
            {data.assignedToMe.slice(0, 5).map((task) => (
              <div key={task.id} className="rounded-3xl border bg-[var(--card-strong)] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold">{task.title}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{task.project.name}</p>
                  </div>
                  <Link
                    href={`/workspace/${task.project.workspace.slug}/projects/${task.project.id}`}
                    className="text-sm font-semibold text-[var(--primary)]"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
            {!data.assignedToMe.length ? (
              <EmptyState title="No tasks assigned yet" description="Once tasks are assigned to your account they'll appear here for quick access." />
            ) : null}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Recent activity</p>
            <h2 className="mt-2 text-2xl font-semibold">Latest changes</h2>
          </div>
          <div className="space-y-3">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="surface-soft rounded-3xl p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words font-semibold">{activity.description}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {activity.actor.name} in {activity.workspace.name}
                    </p>
                  </div>
                  <p className="text-xs text-[var(--muted)]">{formatRelativeDate(activity.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Your workspaces</p>
            <h2 className="mt-2 text-2xl font-semibold">Jump back in</h2>
          </div>
          <div className="space-y-3">
            {data.workspaces.map((workspace) => (
              <Link key={workspace.id} href={`/workspace/${workspace.slug}`} className="surface-soft block rounded-3xl p-4 hover:border-[var(--primary)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold">{workspace.name}</p>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{workspace.description}</p>
                  </div>
                  <span className="text-xs text-[var(--muted)]">{workspace._count.projects} projects</span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
