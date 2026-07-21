"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { addComment } from "@/actions/comment";
import { deleteTask, saveTask } from "@/actions/task";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { taskPriorities, taskStatuses } from "@/lib/constants";
import { formatDateInput, formatRelativeDate } from "@/lib/utils";
import type { ProjectWithStats, TaskWithRelations, WorkspaceBundle } from "@/types";

export function TaskDetailDialog({
  task,
  members,
  labels,
  projects,
  open,
  onOpenChange,
  isSaving,
}: {
  task: TaskWithRelations | null;
  members: WorkspaceBundle["members"];
  labels: WorkspaceBundle["labels"];
  projects: ProjectWithStats[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaving?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-auto z-50 flex max-h-[92vh] flex-col rounded-t-[32px] border bg-[var(--card)] p-4 shadow-2xl sm:inset-3 sm:max-h-none sm:rounded-[32px] xl:left-auto xl:w-[min(860px,calc(100vw-24px))] xl:p-6">
          <div className="mb-4 flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4 sm:mb-6 sm:pb-6">
            <div className="min-w-0">
              <Dialog.Title className="text-2xl font-semibold">{task?.title ?? "Task details"}</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-[var(--muted-foreground)]">
                Comments, labels, activity, and assignment history all live here.
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-full border p-2 text-[var(--muted-foreground)] hover:border-[var(--primary)]">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {task ? (
            <div className="grid min-h-0 flex-1 gap-6 overflow-hidden xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
              <div className="min-h-0 space-y-6 overflow-y-auto pr-1 sm:pr-2">
                <form action={saveTask} className="space-y-4">
                  <input type="hidden" name="taskId" value={task.id} />
                  <input type="hidden" name="workspaceId" value={task.workspaceId} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input name="title" defaultValue={task.title} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea name="description" defaultValue={task.description ?? ""} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Project</label>
                      <Select name="projectId" defaultValue={task.projectId}>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select name="status" defaultValue={task.status}>
                        {taskStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status.replaceAll("_", " ")}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority</label>
                      <Select name="priority" defaultValue={task.priority}>
                        {taskPriorities.map((priority) => (
                          <option key={priority} value={priority}>
                            {priority}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Assignee</label>
                      <Select name="assigneeId" defaultValue={task.assigneeId ?? ""}>
                        <option value="">Unassigned</option>
                        {members.map((member) => (
                          <option key={member.userId} value={member.userId}>
                            {member.user.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Due date</label>
                      <Input type="date" name="dueDate" defaultValue={formatDateInput(task.dueDate)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Labels</label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {labels.map((label) => (
                          <label key={label.id} className="surface-section flex items-center gap-3 rounded-2xl px-3 py-3 text-sm">
                            <input
                              type="checkbox"
                              name="labels"
                              value={label.id}
                              defaultChecked={task.labels.some((entry) => entry.labelId === label.id)}
                            />
                            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: label.color }} />
                            {label.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                    <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                      Save task
                    </Button>
                    <span className="text-xs text-[var(--muted)]">Attachment support can be connected to object storage in a follow-up pass.</span>
                  </div>
                </form>

                <section className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold">Comments</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">Chronological discussion for this task.</p>
                  </div>
                  <form action={addComment} className="space-y-3">
                    <input type="hidden" name="taskId" value={task.id} />
                    <Textarea name="body" placeholder="Share context, blockers, or handoff notes..." />
                    <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                      Add comment
                    </Button>
                  </form>
                  <div className="space-y-3">
                    {task.comments.map((comment) => (
                      <div key={comment.id} className="rounded-3xl border bg-[var(--card-strong)] p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="font-semibold">{comment.author.name}</p>
                          <p className="text-xs text-[var(--muted)]">{formatRelativeDate(comment.createdAt)}</p>
                        </div>
                        <p className="mt-2 break-words text-sm text-[var(--muted-foreground)]">{comment.body}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="min-h-0 space-y-6 overflow-y-auto pr-1 sm:pr-2">
                <section className="space-y-3">
                  <h3 className="text-lg font-semibold">Activity</h3>
                  <div className="space-y-3">
                    {task.activities.map((activity) => (
                      <div key={activity.id} className="rounded-3xl border bg-[var(--card-strong)] p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm font-semibold">{activity.actor.name}</p>
                          <p className="text-xs text-[var(--muted)]">{formatRelativeDate(activity.createdAt)}</p>
                        </div>
                        <p className="mt-2 break-words text-sm text-[var(--muted-foreground)]">{activity.description}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-semibold">Danger zone</h3>
                  <form action={deleteTask}>
                    <input type="hidden" name="workspaceId" value={task.workspaceId} />
                    <input type="hidden" name="taskId" value={task.id} />
                    <ConfirmButton
                      type="submit"
                      variant="danger"
                      className="w-full sm:w-auto"
                      confirmationMessage={`Delete task "${task.title}"? This cannot be undone.`}
                    >
                      Delete task
                    </ConfirmButton>
                  </form>
                </section>
              </div>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
