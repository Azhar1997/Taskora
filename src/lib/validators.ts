import { projectPriorities, projectStatuses, taskPriorities, taskStatuses, workspaceRoles } from "@/lib/constants";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const signupSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters."),
});

export const workspaceSchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(280).optional().or(z.literal("")),
});

export const inviteSchema = z.object({
  workspaceId: z.string().min(1),
  email: z.email(),
  role: z.enum(workspaceRoles),
});

export const projectSchema = z.object({
  workspaceId: z.string().min(1),
  projectId: z.string().optional(),
  name: z.string().min(2).max(80),
  description: z.string().max(1000).optional().or(z.literal("")),
  status: z.enum(projectStatuses),
  priority: z.enum(projectPriorities),
  ownerId: z.string().min(1),
  startDate: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
});

export const taskSchema = z.object({
  workspaceId: z.string().min(1),
  projectId: z.string().min(1),
  taskId: z.string().optional(),
  title: z.string().min(2).max(120),
  description: z.string().max(2000).optional().or(z.literal("")),
  status: z.enum(taskStatuses),
  priority: z.enum(taskPriorities),
  assigneeId: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  labels: z.array(z.string()).default([]),
});

export const commentSchema = z.object({
  taskId: z.string().min(1),
  body: z.string().min(2).max(1500),
});
