import { saveTask } from "@/actions/task";
import { KanbanBoard } from "@/components/board/kanban-board";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getWorkspaceBySlug, requireUser } from "@/data/workspaces";
import { priorityLabels, taskPriorities, taskStatusLabels, taskStatuses } from "@/lib/constants";

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{ q?: string; status?: string; priority?: string; assignee?: string; label?: string; due?: string }>;
}) {
  const user = await requireUser();
  const { workspaceSlug } = await params;
  const filters = await searchParams;
  const workspace = await getWorkspaceBySlug(workspaceSlug, user.id);
  const now = new Date();
  const thisWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const filteredTasks = workspace.tasks.filter((task) => {
    const matchesSearch =
      !filters.q ||
      task.title.toLowerCase().includes(filters.q.toLowerCase()) ||
      task.description?.toLowerCase().includes(filters.q.toLowerCase());
    const matchesStatus = !filters.status || filters.status === "ALL" || task.status === filters.status;
    const matchesPriority = !filters.priority || filters.priority === "ALL" || task.priority === filters.priority;
    const matchesAssignee = !filters.assignee || filters.assignee === "ALL" || task.assigneeId === filters.assignee;
    const matchesLabel = !filters.label || filters.label === "ALL" || task.labels.some((entry) => entry.labelId === filters.label);
    const matchesDue =
      !filters.due ||
      filters.due === "ALL" ||
      (filters.due === "OVERDUE" && Boolean(task.dueDate && new Date(task.dueDate) < now && task.status !== "DONE")) ||
      (filters.due === "THIS_WEEK" && Boolean(task.dueDate && new Date(task.dueDate) <= thisWeek));
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesLabel && matchesDue;
  });

  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Kanban board</p>
          <h1 className="mt-2 max-w-4xl text-3xl font-semibold leading-tight">Move work through execution with optimistic drag-and-drop.</h1>
        </div>
        <form className="grid gap-3 md:grid-cols-2 2xl:grid-cols-[minmax(0,1.2fr)_repeat(5,minmax(0,0.7fr))_auto]">
          <Input name="q" placeholder="Search tasks..." defaultValue={filters.q ?? ""} className="min-w-0" />
          <Select name="status" defaultValue={filters.status ?? "ALL"}>
            <option value="ALL">All statuses</option>
            {taskStatuses.map((status) => (
              <option key={status} value={status}>
                {taskStatusLabels[status]}
              </option>
            ))}
          </Select>
          <Select name="priority" defaultValue={filters.priority ?? "ALL"}>
            <option value="ALL">All priorities</option>
            {taskPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {priorityLabels[priority]}
              </option>
            ))}
          </Select>
          <Select name="assignee" defaultValue={filters.assignee ?? "ALL"}>
            <option value="ALL">All assignees</option>
            {workspace.members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.user.name}
              </option>
            ))}
          </Select>
          <Select name="label" defaultValue={filters.label ?? "ALL"}>
            <option value="ALL">All labels</option>
            {workspace.labels.map((label) => (
              <option key={label.id} value={label.id}>
                {label.name}
              </option>
            ))}
          </Select>
          <Select name="due" defaultValue={filters.due ?? "ALL"}>
            <option value="ALL">Any due date</option>
            <option value="OVERDUE">Overdue</option>
            <option value="THIS_WEEK">Due this week</option>
          </Select>
          <Button type="submit" variant="secondary" className="w-full 2xl:w-auto">
            Filter
          </Button>
        </form>
        <form action={saveTask} className="grid gap-4 md:grid-cols-2 2xl:grid-cols-12">
          <input type="hidden" name="workspaceId" value={workspace.id} />
          <div className="space-y-2 md:col-span-2 2xl:col-span-4">
            <label className="text-sm font-medium">Task title</label>
            <Input name="title" placeholder="Polish workspace analytics widgets" required />
          </div>
          <div className="space-y-2 md:col-span-2 2xl:col-span-4">
            <label className="text-sm font-medium">Description</label>
            <Textarea name="description" className="min-h-[104px]" placeholder="What needs to happen?" />
          </div>
          <div className="space-y-2 2xl:col-span-2">
            <label className="text-sm font-medium">Project</label>
            <Select name="projectId">
              {workspace.projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select name="status" defaultValue="BACKLOG">
              {taskStatuses.map((status) => (
                <option key={status} value={status}>
                  {taskStatusLabels[status]}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select name="priority" defaultValue="MEDIUM">
              {taskPriorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priorityLabels[priority]}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Assignee</label>
            <Select name="assigneeId" defaultValue="">
              <option value="">Unassigned</option>
              {workspace.members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.user.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Due date</label>
            <Input type="date" name="dueDate" />
          </div>
          <div className="space-y-2 md:col-span-2 2xl:col-span-6">
            <label className="text-sm font-medium">Labels</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {workspace.labels.map((label) => (
                <label key={label.id} className="surface-section flex items-center gap-3 rounded-2xl px-3 py-3 text-sm">
                  <input type="checkbox" name="labels" value={label.id} className="shrink-0" />
                  <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: label.color }} />
                  {label.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-end md:col-span-2 2xl:col-span-12">
            <Button type="submit" className="w-full sm:w-auto">
              Create task
            </Button>
          </div>
        </form>
      </Card>
      <KanbanBoard tasks={filteredTasks} workspaceId={workspace.id} members={workspace.members} labels={workspace.labels} projects={workspace.projects} />
    </div>
  );
}
