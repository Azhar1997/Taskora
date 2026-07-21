export const workspaceRoles = ["OWNER", "ADMIN", "MEMBER"] as const;
export const projectStatuses = ["PLANNING", "ACTIVE", "AT_RISK", "COMPLETED", "ON_HOLD"] as const;
export const projectPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export const taskStatuses = ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as const;
export const taskPriorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export const taskStatusLabels: Record<(typeof taskStatuses)[number], string> = {
  BACKLOG: "Backlog",
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

export const projectStatusLabels: Record<(typeof projectStatuses)[number], string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  AT_RISK: "At Risk",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
};

export const priorityLabels = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
  CRITICAL: "Critical",
} as const;
