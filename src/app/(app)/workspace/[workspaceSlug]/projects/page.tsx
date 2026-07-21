import { deleteProject, saveProject } from "@/actions/project";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getWorkspaceBySlug, requireUser } from "@/data/workspaces";
import { priorityLabels, projectPriorities, projectStatusLabels, projectStatuses } from "@/lib/constants";
import { formatDateInput } from "@/lib/utils";
import Link from "next/link";

export default async function ProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{ q?: string; status?: string; owner?: string }>;
}) {
  const user = await requireUser();
  const { workspaceSlug } = await params;
  const filters = await searchParams;
  const workspace = await getWorkspaceBySlug(workspaceSlug, user.id);

  const projects = workspace.projects.filter((project) => {
    const matchesSearch =
      !filters.q ||
      project.name.toLowerCase().includes(filters.q.toLowerCase()) ||
      project.description?.toLowerCase().includes(filters.q.toLowerCase());
    const matchesStatus = !filters.status || filters.status === "ALL" || project.status === filters.status;
    const matchesOwner = !filters.owner || filters.owner === "ALL" || project.ownerId === filters.owner;
    return matchesSearch && matchesStatus && matchesOwner;
  });

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Projects</p>
          <h1 className="text-3xl font-semibold leading-tight">Plan and deliver work with clean project structure.</h1>
        </div>
        <form className="grid gap-3 md:grid-cols-2 2xl:grid-cols-[minmax(0,1.2fr)_repeat(2,minmax(0,0.7fr))_auto]">
          <Input name="q" placeholder="Search projects..." defaultValue={filters.q ?? ""} />
          <Select name="status" defaultValue={filters.status ?? "ALL"}>
            <option value="ALL">All statuses</option>
            {projectStatuses.map((status) => (
              <option key={status} value={status}>
                {projectStatusLabels[status]}
              </option>
            ))}
          </Select>
          <Select name="owner" defaultValue={filters.owner ?? "ALL"}>
            <option value="ALL">All owners</option>
            {workspace.members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.user.name}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary" className="w-full 2xl:w-auto">
            Apply filters
          </Button>
        </form>
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Create project</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Add a new initiative to this workspace with timeline, owner, and priority settings.</p>
        </div>
        <form action={saveProject} className="grid gap-4 md:grid-cols-2 2xl:grid-cols-12">
          <input type="hidden" name="workspaceId" value={workspace.id} />
          <div className="space-y-2 md:col-span-2 2xl:col-span-6">
            <label className="text-sm font-medium">Project name</label>
            <Input name="name" required placeholder="Platform Reliability Sprint" />
          </div>
          <div className="space-y-2 md:col-span-2 2xl:col-span-6">
            <label className="text-sm font-medium">Description</label>
            <Textarea name="description" placeholder="What outcome does this project drive?" />
          </div>
          <div className="space-y-2 2xl:col-span-3">
            <label className="text-sm font-medium">Status</label>
            <Select name="status" defaultValue="PLANNING">
              {projectStatuses.map((status) => (
                <option key={status} value={status}>
                  {projectStatusLabels[status]}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2 2xl:col-span-3">
            <label className="text-sm font-medium">Priority</label>
            <Select name="priority" defaultValue="MEDIUM">
              {projectPriorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priorityLabels[priority]}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2 2xl:col-span-3">
            <label className="text-sm font-medium">Owner</label>
            <Select name="ownerId" defaultValue={workspace.member.userId}>
              {workspace.members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.user.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Start date</label>
            <Input type="date" name="startDate" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Due date</label>
            <Input type="date" name="dueDate" />
          </div>
          <div className="md:col-span-2 2xl:col-span-12">
            <Button type="submit" className="w-full sm:w-auto">
              Save project
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-4">
        {projects.map((project) => {
          const openTasks = project.tasks.filter((task) => task.status !== "DONE").length;
          return (
            <Card key={project.id} className="space-y-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="break-words text-2xl font-semibold">{project.name}</h3>
                    <span className="rounded-full border px-2 py-1 text-xs text-[var(--muted-foreground)]">{projectStatusLabels[project.status]}</span>
                  </div>
                  <p className="max-w-3xl break-words text-sm leading-7 text-[var(--muted-foreground)]">{project.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
                    <span>Owner: {project.owner.name}</span>
                    <span>Priority: {priorityLabels[project.priority]}</span>
                    <span>Tasks: {project._count.tasks}</span>
                    <span>Open: {openTasks}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button asChild variant="secondary" className="w-full sm:w-auto">
                    <Link href={`/workspace/${workspace.slug}/projects/${project.id}`}>Open project</Link>
                  </Button>
                  <form action={deleteProject}>
                    <input type="hidden" name="workspaceId" value={workspace.id} />
                    <input type="hidden" name="projectId" value={project.id} />
                    <ConfirmButton
                      type="submit"
                      variant="danger"
                      className="w-full sm:w-auto"
                      confirmationMessage={`Delete project "${project.name}"? This also removes its tasks.`}
                    >
                      Delete
                    </ConfirmButton>
                  </form>
                </div>
              </div>

              <form action={saveProject} className="grid gap-4 border-t pt-4 md:grid-cols-2 2xl:grid-cols-12">
                <input type="hidden" name="workspaceId" value={workspace.id} />
                <input type="hidden" name="projectId" value={project.id} />
                <div className="space-y-2 md:col-span-2 2xl:col-span-6">
                  <label className="text-sm font-medium">Edit project name</label>
                  <Input name="name" defaultValue={project.name} />
                </div>
                <div className="space-y-2 md:col-span-2 2xl:col-span-6">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea name="description" defaultValue={project.description ?? ""} />
                </div>
                <div className="space-y-2 2xl:col-span-3">
                  <label className="text-sm font-medium">Status</label>
                  <Select name="status" defaultValue={project.status}>
                    {projectStatuses.map((status) => (
                      <option key={status} value={status}>
                        {projectStatusLabels[status]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2 2xl:col-span-3">
                  <label className="text-sm font-medium">Priority</label>
                  <Select name="priority" defaultValue={project.priority}>
                    {projectPriorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priorityLabels[priority]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2 2xl:col-span-3">
                  <label className="text-sm font-medium">Owner</label>
                  <Select name="ownerId" defaultValue={project.ownerId}>
                    {workspace.members.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.user.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2 2xl:col-span-3">
                  <label className="text-sm font-medium">Timeline</label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input type="date" name="startDate" defaultValue={formatDateInput(project.startDate)} />
                    <Input type="date" name="dueDate" defaultValue={formatDateInput(project.dueDate)} />
                  </div>
                </div>
                <div className="md:col-span-2 2xl:col-span-12">
                  <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                    Update project
                  </Button>
                </div>
              </form>
            </Card>
          );
        })}
        {!projects.length ? (
          <EmptyState title="No projects matched" description="Try broadening your filters or create a new project for this workspace." />
        ) : null}
      </div>
    </div>
  );
}
