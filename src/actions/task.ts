"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/data/workspaces";
import { prisma } from "@/lib/prisma";
import { canManageTasks } from "@/lib/permissions";
import { taskSchema } from "@/lib/validators";

function normalizeDate(value?: string) {
  return value ? new Date(value) : null;
}

async function ensureTaskPermission(workspaceId: string, userId: string) {
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
    },
  });

  if (!membership || !canManageTasks(membership.role)) {
    throw new Error("You do not have permission to manage tasks in this workspace.");
  }
}

export async function saveTask(formData: FormData) {
  const user = await requireUser();
  const parsed = taskSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    projectId: formData.get("projectId"),
    taskId: formData.get("taskId") || undefined,
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    assigneeId: formData.get("assigneeId"),
    dueDate: formData.get("dueDate"),
    labels: formData.getAll("labels").map(String),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid task");
  }

  await ensureTaskPermission(parsed.data.workspaceId, user.id);

  if (parsed.data.taskId) {
    const previous = await prisma.task.findUnique({
      where: { id: parsed.data.taskId },
      select: { status: true, priority: true, assigneeId: true },
    });

    const task = await prisma.task.update({
      where: { id: parsed.data.taskId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        status: parsed.data.status,
        priority: parsed.data.priority,
        assigneeId: parsed.data.assigneeId || null,
        dueDate: normalizeDate(parsed.data.dueDate),
        labels: {
          deleteMany: {},
          create: parsed.data.labels.map((labelId) => ({
            labelId,
          })),
        },
      },
    });

    const events = [];
    if (previous?.status !== parsed.data.status) {
      events.push({
        type: "TASK_STATUS_CHANGED" as const,
        description: `Moved ${parsed.data.title} to ${parsed.data.status.replaceAll("_", " ")}.`,
      });
    }
    if (previous?.priority !== parsed.data.priority) {
      events.push({
        type: "TASK_PRIORITY_CHANGED" as const,
        description: `Updated ${parsed.data.title} priority to ${parsed.data.priority}.`,
      });
    }
    if (previous?.assigneeId !== (parsed.data.assigneeId || null)) {
      events.push({
        type: "TASK_ASSIGNEE_CHANGED" as const,
        description: `Changed the assignee for ${parsed.data.title}.`,
      });
    }
    if (!events.length) {
      events.push({
        type: "TASK_UPDATED" as const,
        description: `Updated task ${parsed.data.title}.`,
      });
    }

    await prisma.activityLog.createMany({
      data: events.map((event) => ({
        workspaceId: parsed.data.workspaceId,
        actorId: user.id,
        projectId: parsed.data.projectId,
        taskId: task.id,
        type: event.type,
        description: event.description,
      })),
    });
  } else {
    const order = await prisma.task.count({
      where: {
        workspaceId: parsed.data.workspaceId,
        status: parsed.data.status,
      },
    });

    const task = await prisma.task.create({
      data: {
        workspaceId: parsed.data.workspaceId,
        projectId: parsed.data.projectId,
        title: parsed.data.title,
        description: parsed.data.description,
        status: parsed.data.status,
        priority: parsed.data.priority,
        assigneeId: parsed.data.assigneeId || null,
        dueDate: normalizeDate(parsed.data.dueDate),
        sortOrder: order,
        labels: {
          create: parsed.data.labels.map((labelId) => ({
            labelId,
          })),
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: parsed.data.workspaceId,
        actorId: user.id,
        projectId: parsed.data.projectId,
        taskId: task.id,
        type: "TASK_CREATED",
        description: `Created task ${parsed.data.title}.`,
      },
    });
  }

  revalidatePath("/dashboard");
}

export async function deleteTask(formData: FormData) {
  const user = await requireUser();
  const workspaceId = String(formData.get("workspaceId"));
  const taskId = String(formData.get("taskId"));

  await ensureTaskPermission(workspaceId, user.id);
  await prisma.task.delete({
    where: {
      id: taskId,
    },
  });

  revalidatePath("/dashboard");
}

export async function moveTaskStatus(input: {
  taskId: string;
  workspaceId: string;
  status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  sortOrder: number;
}) {
  const user = await requireUser();
  await ensureTaskPermission(input.workspaceId, user.id);

  const task = await prisma.task.update({
    where: { id: input.taskId },
    data: {
      status: input.status,
      sortOrder: input.sortOrder,
    },
    include: {
      project: {
        select: {
          id: true,
        },
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      workspaceId: input.workspaceId,
      actorId: user.id,
      projectId: task.project.id,
      taskId: input.taskId,
      type: "TASK_STATUS_CHANGED",
      description: `Moved ${task.title} to ${input.status.replaceAll("_", " ")}.`,
    },
  });

  revalidatePath("/dashboard");
}
