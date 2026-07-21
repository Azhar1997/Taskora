import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import type { WorkspaceBundle, WorkspaceSummary } from "@/types";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user;
}

export async function getUserWorkspaces(userId: string): Promise<WorkspaceSummary[]> {
  return prisma.workspace.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      _count: {
        select: {
          projects: true,
          members: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getWorkspaceBySlug(slug: string, userId: string): Promise<WorkspaceBundle> {
  const workspace = await prisma.workspace.findFirst({
    where: {
      slug,
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: true,
        },
        orderBy: {
          user: {
            name: "asc",
          },
        },
      },
      labels: {
        orderBy: {
          name: "asc",
        },
      },
      invitations: {
        orderBy: {
          createdAt: "desc",
        },
      },
      projects: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          tasks: {
            select: {
              id: true,
              status: true,
              dueDate: true,
            },
          },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      },
      tasks: {
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
          activities: {
            include: {
              actor: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
        orderBy: [
          {
            status: "asc",
          },
          {
            sortOrder: "asc",
          },
          {
            updatedAt: "desc",
          },
        ],
      },
      activities: {
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
        take: 15,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!workspace) notFound();

  const member = workspace.members.find((entry) => entry.userId === userId);
  if (!member) notFound();

  return { ...workspace, member };
}

export async function getProjectById(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspace: {
        members: {
          some: {
            userId,
          },
        },
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      workspace: {
        include: {
          members: {
            include: {
              user: true,
            },
            orderBy: {
              user: {
                name: "asc",
              },
            },
          },
          labels: {
            orderBy: {
              name: "asc",
            },
          },
        },
      },
      tasks: {
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          activities: {
            include: {
              actor: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
        orderBy: [{ status: "asc" }, { dueDate: "asc" }],
      },
      activities: {
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!project) notFound();
  return project;
}

export async function getDashboardData(userId: string) {
  const [workspaces, projects, searchableProjects, tasks, recentActivity] = await Promise.all([
    getUserWorkspaces(userId),
    prisma.project.count({
      where: {
        workspace: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    }),
    prisma.project.findMany({
      where: {
        workspace: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
      include: {
        workspace: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.task.findMany({
      where: {
        workspace: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            workspace: {
              select: {
                slug: true,
              },
            },
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.activityLog.findMany({
      where: {
        workspace: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        workspace: {
          select: {
            slug: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      take: 8,
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const openTasks = tasks.filter((task) => task.status !== "DONE");
  const completedTasks = tasks.filter((task) => task.status === "DONE");
  const overdueTasks = tasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE");
  const assignedToMe = tasks.filter((task) => task.assigneeId === userId);
  const backlogMix = [
    { name: "Backlog", value: tasks.filter((task) => task.status === "BACKLOG").length },
    { name: "Todo", value: tasks.filter((task) => task.status === "TODO").length },
    { name: "In Progress", value: tasks.filter((task) => task.status === "IN_PROGRESS").length },
    { name: "Review", value: tasks.filter((task) => task.status === "IN_REVIEW").length },
    { name: "Done", value: completedTasks.length },
  ];

  return {
    workspaces,
    searchableProjects,
    tasks,
    totalProjects: projects,
    openTasks,
    completedTasks,
    overdueTasks,
    assignedToMe,
    recentActivity,
    backlogMix,
  };
}
