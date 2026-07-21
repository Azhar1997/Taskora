"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/data/workspaces";
import { prisma } from "@/lib/prisma";
import { canInviteMembers, canManageWorkspace } from "@/lib/permissions";
import { slugify } from "@/lib/utils";
import { inviteSchema, workspaceSchema } from "@/lib/validators";
import { redirect } from "next/navigation";

export async function createWorkspace(formData: FormData) {
  const user = await requireUser();
  const parsed = workspaceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid workspace");
  }

  const slugBase = slugify(parsed.data.name);
  const slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;

  const workspace = await prisma.workspace.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });

  revalidatePath("/dashboard");
  redirect(`/workspace/${workspace.slug}`);
}

export async function updateWorkspace(formData: FormData) {
  const user = await requireUser();
  const parsed = workspaceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid workspace");
  }

  const workspaceId = String(formData.get("workspaceId"));
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: user.id,
    },
  });

  if (!membership || !canManageWorkspace(membership.role)) {
    throw new Error("You do not have permission to update this workspace.");
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
    },
  });

  await prisma.activityLog.create({
    data: {
      workspaceId,
      actorId: user.id,
      type: "WORKSPACE_UPDATED",
      description: `Updated workspace settings for ${parsed.data.name}.`,
    },
  });

  revalidatePath("/dashboard");
}

export async function inviteMember(formData: FormData) {
  const user = await requireUser();
  const parsed = inviteSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid invitation");
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: parsed.data.workspaceId,
      userId: user.id,
    },
  });

  if (!membership || !canInviteMembers(membership.role)) {
    throw new Error("You do not have permission to invite members.");
  }

  await prisma.workspaceInvitation.create({
    data: {
      workspaceId: parsed.data.workspaceId,
      inviterId: user.id,
      email: parsed.data.email,
      role: parsed.data.role,
    },
  });

  await prisma.activityLog.create({
    data: {
      workspaceId: parsed.data.workspaceId,
      actorId: user.id,
      type: "MEMBER_INVITED",
      description: `Created a pending invitation for ${parsed.data.email}.`,
      metadata: {
        role: parsed.data.role,
      },
    },
  });

  revalidatePath("/dashboard");
}
