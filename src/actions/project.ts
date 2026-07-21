"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/data/workspaces";
import { prisma } from "@/lib/prisma";
import { canManageProjects } from "@/lib/permissions";
import { projectSchema } from "@/lib/validators";

function normalizeDate(value?: string) {
  return value ? new Date(value) : null;
}

export async function saveProject(formData: FormData) {
  const user = await requireUser();
  const parsed = projectSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    projectId: formData.get("projectId") || undefined,
    name: formData.get("name"),
    description: formData.get("description"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    ownerId: formData.get("ownerId"),
    startDate: formData.get("startDate"),
    dueDate: formData.get("dueDate"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid project");
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: parsed.data.workspaceId,
      userId: user.id,
    },
  });

  if (!membership || !canManageProjects(membership.role)) {
    throw new Error("You do not have permission to manage projects.");
  }

  if (parsed.data.projectId) {
    await prisma.project.update({
      where: { id: parsed.data.projectId },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        status: parsed.data.status,
        priority: parsed.data.priority,
        ownerId: parsed.data.ownerId,
        startDate: normalizeDate(parsed.data.startDate),
        dueDate: normalizeDate(parsed.data.dueDate),
      },
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: parsed.data.workspaceId,
        actorId: user.id,
        projectId: parsed.data.projectId,
        type: "PROJECT_UPDATED",
        description: `Updated project ${parsed.data.name}.`,
      },
    });
  } else {
    const project = await prisma.project.create({
      data: {
        workspaceId: parsed.data.workspaceId,
        name: parsed.data.name,
        description: parsed.data.description,
        status: parsed.data.status,
        priority: parsed.data.priority,
        ownerId: parsed.data.ownerId,
        startDate: normalizeDate(parsed.data.startDate),
        dueDate: normalizeDate(parsed.data.dueDate),
      },
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: parsed.data.workspaceId,
        actorId: user.id,
        projectId: project.id,
        type: "PROJECT_CREATED",
        description: `Created project ${parsed.data.name}.`,
      },
    });
  }

  revalidatePath("/dashboard");
}

export async function deleteProject(formData: FormData) {
  const user = await requireUser();
  const workspaceId = String(formData.get("workspaceId"));
  const projectId = String(formData.get("projectId"));

  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: user.id,
    },
  });

  if (!membership || !canManageProjects(membership.role)) {
    throw new Error("You do not have permission to delete this project.");
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  revalidatePath("/dashboard");
}
