import type { ActivityLog, Comment, Label, Project, ProjectStatus, Task, TaskLabel, TaskPriority, TaskStatus, User, Workspace, WorkspaceInvitation, WorkspaceMember } from "@prisma/client";

export type MemberWithUser = WorkspaceMember & {
  user: User;
};

export type WorkspaceSummary = Workspace & {
  members: MemberWithUser[];
  _count: {
    projects: number;
    members: number;
  };
};

export type ProjectWithStats = Project & {
  owner: Pick<User, "id" | "name" | "email">;
  tasks: Array<Pick<Task, "id" | "status" | "dueDate">>;
  _count: {
    tasks: number;
  };
};

export type TaskWithRelations = Task & {
  assignee: Pick<User, "id" | "name" | "email" | "image"> | null;
  project: Pick<Project, "id" | "name" | "status">;
  labels: Array<TaskLabel & { label: Label }>;
  comments: Array<
    Comment & {
      author: Pick<User, "id" | "name" | "email">;
    }
  >;
  activities: Array<
    ActivityLog & {
      actor: Pick<User, "id" | "name" | "email">;
    }
  >;
};

export type WorkspaceBundle = Workspace & {
  member: WorkspaceMember;
  members: MemberWithUser[];
  labels: Label[];
  invitations: WorkspaceInvitation[];
  projects: ProjectWithStats[];
  tasks: TaskWithRelations[];
  activities: Array<
    ActivityLog & {
      actor: Pick<User, "id" | "name" | "email">;
      project: Pick<Project, "id" | "name"> | null;
      task: Pick<Task, "id" | "title" | "status"> | null;
    }
  >;
};

export type SelectOption = {
  label: string;
  value: string;
};

export type ProjectFilterState = {
  q?: string;
  status?: ProjectStatus | "ALL";
  owner?: string | "ALL";
};

export type TaskFilterState = {
  q?: string;
  status?: TaskStatus | "ALL";
  priority?: TaskPriority | "ALL";
  assignee?: string | "ALL";
  label?: string | "ALL";
  due?: "ALL" | "OVERDUE" | "THIS_WEEK";
};
