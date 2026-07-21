import type { WorkspaceRole } from "@prisma/client";

export function canManageWorkspace(role: WorkspaceRole) {
  return role === "OWNER" || role === "ADMIN";
}

export function canManageProjects(role: WorkspaceRole) {
  return role === "OWNER" || role === "ADMIN";
}

export function canInviteMembers(role: WorkspaceRole) {
  return role === "OWNER" || role === "ADMIN";
}

export function canManageTasks(role: WorkspaceRole) {
  return role === "OWNER" || role === "ADMIN" || role === "MEMBER";
}
