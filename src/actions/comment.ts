"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/data/workspaces";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validators";

export async function addComment(formData: FormData) {
  const user = await requireUser();
  const parsed = commentSchema.safeParse({
    taskId: formData.get("taskId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Comment could not be posted.");
  }

  const task = await prisma.task.findUnique({
    where: { id: parsed.data.taskId },
    select: {
      id: true,
      title: true,
      workspaceId: true,
      projectId: true,
    },
  });

  if (!task) {
    throw new Error("Task not found.");
  }

  await prisma.comment.create({
    data: {
      taskId: task.id,
      authorId: user.id,
      body: parsed.data.body,
    },
  });

  await prisma.activityLog.create({
    data: {
      workspaceId: task.workspaceId,
      actorId: user.id,
      projectId: task.projectId,
      taskId: task.id,
      type: "TASK_COMMENTED",
      description: `Commented on ${task.title}.`,
    },
  });

  revalidatePath("/dashboard");
}
