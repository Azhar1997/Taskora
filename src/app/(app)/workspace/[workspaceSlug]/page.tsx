import { ProgressChart } from "@/components/analytics/progress-chart";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { getWorkspaceBySlug, requireUser } from "@/data/workspaces";
import { formatRelativeDate } from "@/lib/utils";

export default async function WorkspaceOverviewPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const user = await requireUser();
  const { workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug, user.id);

  const openTasks = workspace.tasks.filter((task) => task.status !== "DONE");
  const doneTasks = workspace.tasks.filter((task) => task.status === "DONE");
  const overdueTasks = workspace.tasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE");
  const chartData = [
    { name: "Backlog", value: workspace.tasks.filter((task) => task.status === "BACKLOG").length },
    { name: "Todo", value: workspace.tasks.filter((task) => task.status === "TODO").length },
    { name: "In Progress", value: workspace.tasks.filter((task) => task.status === "IN_PROGRESS").length },
    { name: "In Review", value: workspace.tasks.filter((task) => task.status === "IN_REVIEW").length },
    { name: "Done", value: doneTasks.length },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Projects" value={workspace.projects.length} hint="Active initiatives inside this workspace." />
        <StatCard label="Open tasks" value={openTasks.length} hint="Tasks still moving through execution." />
        <StatCard label="Done" value={doneTasks.length} hint="Tasks that have reached completion." />
        <StatCard label="Overdue" value={overdueTasks.length} hint="Missed due dates that need triage." />
      </section>
      <section className="grid gap-6 2xl:grid-cols-[1fr_1fr]">
        <Card className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Current flow</p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight">{workspace.name}</h1>
            <p className="mt-2 max-w-2xl break-words text-[var(--muted-foreground)] leading-7">{workspace.description}</p>
          </div>
          <ProgressChart data={chartData} />
        </Card>
        <Card className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Recent activity</p>
            <h2 className="mt-2 text-2xl font-semibold">Workspace timeline</h2>
          </div>
          <div className="space-y-3">
            {workspace.activities.map((activity) => (
              <div key={activity.id} className="surface-soft rounded-3xl p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words font-semibold">{activity.description}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{activity.actor.name}</p>
                  </div>
                  <p className="text-xs text-[var(--muted)]">{formatRelativeDate(activity.createdAt)}</p>
                </div>
              </div>
            ))}
            {!workspace.activities.length ? (
              <EmptyState title="No activity yet" description="Create a project or task to start building the workspace timeline." />
            ) : null}
          </div>
        </Card>
      </section>
    </div>
  );
}
