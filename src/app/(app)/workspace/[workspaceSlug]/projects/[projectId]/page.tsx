import { addComment } from "@/actions/comment";
import { saveTask } from "@/actions/task";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getProjectById, requireUser } from "@/data/workspaces";
import { priorityLabels, taskPriorities, taskStatusLabels, taskStatuses } from "@/lib/constants";
import { formatDateInput, formatRelativeDate } from "@/lib/utils";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const user = await requireUser();
  const { projectId } = await params;
  const project = await getProjectById(projectId, user.id);

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{project.workspace.name}</p>
          <h1 className="text-3xl font-semibold leading-tight">{project.name}</h1>
          <p className="max-w-3xl break-words text-[var(--muted-foreground)] leading-7">{project.description}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
          <span>Owner: {project.owner.name}</span>
          <span>Status: {project.status.replaceAll("_", " ")}</span>
          <span>Priority: {priorityLabels[project.priority]}</span>
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Create task</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Add delivery items with assignees, due dates, labels, and review state.</p>
        </div>
        <form action={saveTask} className="grid gap-4 md:grid-cols-2 2xl:grid-cols-12">
          <input type="hidden" name="workspaceId" value={project.workspaceId} />
          <input type="hidden" name="projectId" value={project.id} />
          <div className="space-y-2 md:col-span-2 2xl:col-span-6">
            <label className="text-sm font-medium">Title</label>
            <Input name="title" placeholder="Write migration rollout checklist" required />
          </div>
          <div className="space-y-2 md:col-span-2 2xl:col-span-6">
            <label className="text-sm font-medium">Description</label>
            <Textarea name="description" placeholder="Add key context, deliverables, and acceptance criteria." />
          </div>
          <div className="space-y-2 2xl:col-span-3">
            <label className="text-sm font-medium">Status</label>
            <Select name="status" defaultValue="BACKLOG">
              {taskStatuses.map((status) => (
                <option key={status} value={status}>
                  {taskStatusLabels[status]}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2 2xl:col-span-3">
            <label className="text-sm font-medium">Priority</label>
            <Select name="priority" defaultValue="MEDIUM">
              {taskPriorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priorityLabels[priority]}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2 2xl:col-span-3">
            <label className="text-sm font-medium">Assignee</label>
            <Select name="assigneeId" defaultValue="">
              <option value="">Unassigned</option>
              {project.workspace.members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.user.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Due date</label>
            <Input name="dueDate" type="date" />
          </div>
          <div className="space-y-2 md:col-span-2 2xl:col-span-6">
            <label className="text-sm font-medium">Labels</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {project.workspace.labels.map((label) => (
                <label key={label.id} className="surface-section flex items-center gap-3 rounded-2xl px-3 py-3 text-sm">
                  <input type="checkbox" name="labels" value={label.id} className="shrink-0" />
                  <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: label.color }} />
                  {label.name}
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 2xl:col-span-12">
            <Button type="submit" className="w-full sm:w-auto">
              Create task
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-4">
        {project.tasks.map((task) => (
          <Card key={task.id} className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="break-words text-xl font-semibold">{task.title}</h3>
                  <span className="rounded-full border px-2 py-1 text-xs text-[var(--muted-foreground)]">{taskStatusLabels[task.status]}</span>
                </div>
                <p className="mt-2 break-words text-sm leading-7 text-[var(--muted-foreground)]">{task.description || "No description provided yet."}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
                  <span>Assignee: {task.assignee?.name ?? "Unassigned"}</span>
                  <span>Priority: {priorityLabels[task.priority]}</span>
                  <span>Due: {task.dueDate ? formatDateInput(task.dueDate) : "No due date"}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {task.labels.map(({ label }) => (
                <span key={label.id} className="rounded-full px-2 py-1 text-xs font-semibold text-white" style={{ backgroundColor: label.color }}>
                  {label.name}
                </span>
              ))}
            </div>
            <div className="grid gap-4 2xl:grid-cols-[1fr_1fr]">
              <div className="space-y-3">
                <h4 className="font-semibold">Comments</h4>
                <form action={addComment} className="space-y-3">
                  <input type="hidden" name="taskId" value={task.id} />
                  <Textarea name="body" placeholder="Add a comment to this task..." />
                  <Button type="submit" variant="secondary">
                    Comment
                  </Button>
                </form>
                <div className="space-y-3">
                  {task.comments.map((comment) => (
                    <div key={comment.id} className="surface-soft rounded-3xl p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-semibold">{comment.author.name}</p>
                        <p className="text-xs text-[var(--muted)]">{formatRelativeDate(comment.createdAt)}</p>
                      </div>
                      <p className="mt-2 break-words text-sm text-[var(--muted-foreground)]">{comment.body}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Activity</h4>
                <div className="space-y-3">
                  {task.activities.map((activity) => (
                    <div key={activity.id} className="surface-soft rounded-3xl p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-semibold">{activity.actor.name}</p>
                        <p className="text-xs text-[var(--muted)]">{formatRelativeDate(activity.createdAt)}</p>
                      </div>
                      <p className="mt-2 break-words text-sm text-[var(--muted-foreground)]">{activity.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
        {!project.tasks.length ? (
          <EmptyState title="No tasks yet" description="Create the first task above and the project detail view will become the team's execution hub." />
        ) : null}
      </div>
    </div>
  );
}
