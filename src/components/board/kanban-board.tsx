"use client";

import { DndContext, PointerSensor, closestCorners, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { moveTaskStatus } from "@/actions/task";
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { taskStatusLabels, taskStatuses } from "@/lib/constants";
import { cn, formatRelativeDate } from "@/lib/utils";
import type { TaskWithRelations, WorkspaceBundle } from "@/types";

type BoardTask = WorkspaceBundle["tasks"][number];

function SortableTaskCard({
  task,
  onSelect,
}: {
  task: BoardTask;
  onSelect: (task: BoardTask) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "w-full rounded-3xl border bg-[var(--card-strong)] p-4 text-left shadow-sm hover:border-[var(--primary)]",
        isDragging && "opacity-70",
      )}
      onClick={() => onSelect(task)}
      {...attributes}
      {...listeners}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="line-clamp-3 break-words font-semibold leading-7">{task.title}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{task.project.name}</p>
          </div>
          <Badge className="shrink-0">{task.priority}</Badge>
        </div>
        <p className="line-clamp-3 break-words text-sm text-[var(--muted-foreground)]">{task.description || "No description yet."}</p>
        <div className="flex flex-wrap gap-2">
          {task.labels.map(({ label }) => (
            <span
              key={label.id}
              className="rounded-full px-2 py-1 text-[11px] font-semibold text-white"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
        <div className="text-xs text-[var(--muted)]">{task.dueDate ? `Due ${formatRelativeDate(task.dueDate)}` : "No due date"}</div>
      </div>
    </button>
  );
}

export function KanbanBoard({
  tasks,
  workspaceId,
  members,
  labels,
  projects,
}: {
  tasks: WorkspaceBundle["tasks"];
  workspaceId: string;
  members: WorkspaceBundle["members"];
  labels: WorkspaceBundle["labels"];
  projects: WorkspaceBundle["projects"];
}) {
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [isPending, startTransition] = useTransition();
  const [optimisticTasks, updateOptimisticTasks] = useOptimistic(tasks, (current, update: { taskId: string; status: BoardTask["status"] }) =>
    current.map((task) => (task.id === update.taskId ? { ...task, status: update.status } : task)),
  );
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const columns = useMemo(
    () =>
      taskStatuses.map((status) => ({
        id: status,
        title: taskStatusLabels[status],
        tasks: optimisticTasks.filter((task) => task.status === status),
      })),
    [optimisticTasks],
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeTask = optimisticTasks.find((task) => task.id === active.id);
    const targetStatus = String(over.id) as BoardTask["status"];
    if (!activeTask || activeTask.status === targetStatus) return;

    updateOptimisticTasks({ taskId: activeTask.id, status: targetStatus });
    startTransition(async () => {
      try {
        await moveTaskStatus({
          taskId: activeTask.id,
          workspaceId,
          status: targetStatus,
          sortOrder: columns.find((column) => column.id === targetStatus)?.tasks.length ?? 0,
        });
        toast.success(`Moved "${activeTask.title}" to ${taskStatusLabels[targetStatus]}.`);
      } catch {
        toast.error("Task movement failed. The board has been refreshed.");
      }
    });
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="kanban-scroll overflow-x-auto pb-2 xl:overflow-visible">
          <div className="grid min-w-max gap-4 md:grid-cols-2 xl:min-w-0 xl:grid-cols-3 2xl:grid-cols-5">
            {columns.map((column) => (
              <Card key={column.id} className="w-[280px] shrink-0 space-y-4 sm:w-[320px] xl:w-auto xl:min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{column.title}</p>
                    <p className="text-xs text-[var(--muted)]">{column.tasks.length} tasks</p>
                  </div>
                  <Badge className="max-w-[132px] shrink-0 text-center">{column.id.replaceAll("_", " ")}</Badge>
                </div>
                <div id={column.id} className="min-h-[340px] space-y-3 rounded-3xl border border-dashed border-white/10 p-1">
                  <SortableContext items={column.tasks.map((task) => task.id)} strategy={rectSortingStrategy}>
                    {column.tasks.length ? (
                      column.tasks.map((task) => <SortableTaskCard key={task.id} task={task} onSelect={setSelectedTask} />)
                    ) : (
                      <div className="rounded-3xl border border-dashed p-6 text-sm text-[var(--muted)]">Drop tasks here.</div>
                    )}
                  </SortableContext>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </DndContext>
      <TaskDetailDialog
        task={selectedTask}
        members={members}
        labels={labels}
        projects={projects}
        open={Boolean(selectedTask)}
        onOpenChange={(open) => {
          if (!open) setSelectedTask(null);
        }}
        isSaving={isPending}
      />
    </>
  );
}
