import { PrismaClient, ProjectPriority, ProjectStatus, TaskPriority, TaskStatus, WorkspaceRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  await prisma.taskLabel.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workspaceInvitation.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.label.deleteMany();
  await prisma.password.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 12);

  const [ava, mason, riley] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Ava Thompson",
        email: "ava@taskora.dev",
        jobTitle: "Engineering Manager",
        bio: "Keeps product delivery on track and loves crisp backlog grooming.",
        timezone: "Europe/Amsterdam",
        password: { create: { hash: passwordHash } },
      },
    }),
    prisma.user.create({
      data: {
        name: "Mason Lee",
        email: "mason@taskora.dev",
        jobTitle: "Frontend Engineer",
        bio: "Builds polished UI systems and turns complex workflows into smooth interactions.",
        timezone: "America/Los_Angeles",
        password: { create: { hash: passwordHash } },
      },
    }),
    prisma.user.create({
      data: {
        name: "Riley Chen",
        email: "riley@taskora.dev",
        jobTitle: "Product Designer",
        bio: "Design systems, prototypes, and all things collaborative.",
        timezone: "America/New_York",
        password: { create: { hash: passwordHash } },
      },
    }),
  ]);

  const workspace = await prisma.workspace.create({
    data: {
      name: "Taskora Labs",
      slug: "taskora-labs",
      description: "Internal operating workspace for product, engineering, and design delivery.",
      ownerId: ava.id,
      members: {
        create: [
          { userId: ava.id, role: WorkspaceRole.OWNER },
          { userId: mason.id, role: WorkspaceRole.ADMIN },
          { userId: riley.id, role: WorkspaceRole.MEMBER },
        ],
      },
      labels: {
        create: [
          { name: "Design", color: "#f59e0b" },
          { name: "Backend", color: "#0f766e" },
          { name: "Bug", color: "#dc2626" },
          { name: "DX", color: "#2563eb" },
        ],
      },
      invitations: {
        create: [
          {
            email: "candidate@example.com",
            inviterId: ava.id,
            role: WorkspaceRole.MEMBER,
          },
        ],
      },
    },
    include: {
      labels: true,
    },
  });

  const [platform, marketing] = await Promise.all([
    prisma.project.create({
      data: {
        workspaceId: workspace.id,
        ownerId: ava.id,
        name: "Platform Rebuild",
        description: "Modernize the workspace shell, permissions model, and performance budget.",
        status: ProjectStatus.ACTIVE,
        priority: ProjectPriority.URGENT,
        startDate: subDays(new Date(), 14),
        dueDate: addDays(new Date(), 20),
      },
    }),
    prisma.project.create({
      data: {
        workspaceId: workspace.id,
        ownerId: riley.id,
        name: "Launch Campaign",
        description: "Coordinate product storytelling, polished assets, and demo capture.",
        status: ProjectStatus.AT_RISK,
        priority: ProjectPriority.HIGH,
        startDate: subDays(new Date(), 5),
        dueDate: addDays(new Date(), 12),
      },
    }),
  ]);

  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        workspaceId: workspace.id,
        projectId: platform.id,
        assigneeId: mason.id,
        title: "Build authenticated workspace shell",
        description: "Create the protected layout, workspace switcher, and adaptive sidebar navigation.",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: addDays(new Date(), 3),
        sortOrder: 1,
      },
    }),
    prisma.task.create({
      data: {
        workspaceId: workspace.id,
        projectId: platform.id,
        assigneeId: ava.id,
        title: "Model activity events in Prisma",
        description: "Capture status changes, assignee changes, comments, and project updates in a normalized way.",
        status: TaskStatus.IN_REVIEW,
        priority: TaskPriority.CRITICAL,
        dueDate: addDays(new Date(), 1),
        sortOrder: 2,
      },
    }),
    prisma.task.create({
      data: {
        workspaceId: workspace.id,
        projectId: platform.id,
        assigneeId: riley.id,
        title: "Refresh empty states across dashboard",
        description: "Design clear illustrations and concise copy for new or idle workspaces.",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: addDays(new Date(), 6),
        sortOrder: 1,
      },
    }),
    prisma.task.create({
      data: {
        workspaceId: workspace.id,
        projectId: marketing.id,
        assigneeId: riley.id,
        title: "Ship launch teaser visuals",
        description: "Finalize hero mockups and supporting social snippets.",
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.HIGH,
        dueDate: addDays(new Date(), 10),
        sortOrder: 1,
      },
    }),
    prisma.task.create({
      data: {
        workspaceId: workspace.id,
        projectId: marketing.id,
        assigneeId: mason.id,
        title: "Capture realistic product screenshots",
        description: "Use seeded data and polished layouts for portfolio-ready demo assets.",
        status: TaskStatus.DONE,
        priority: TaskPriority.MEDIUM,
        dueDate: subDays(new Date(), 1),
        sortOrder: 1,
      },
    }),
  ]);

  await prisma.taskLabel.createMany({
    data: [
      { taskId: tasks[0].id, labelId: workspace.labels.find((label) => label.name === "Backend")!.id },
      { taskId: tasks[0].id, labelId: workspace.labels.find((label) => label.name === "DX")!.id },
      { taskId: tasks[2].id, labelId: workspace.labels.find((label) => label.name === "Design")!.id },
      { taskId: tasks[4].id, labelId: workspace.labels.find((label) => label.name === "Bug")!.id },
    ],
  });

  await prisma.comment.createMany({
    data: [
      {
        taskId: tasks[0].id,
        authorId: ava.id,
        body: "Let’s make sure the switcher remembers the last workspace after refresh.",
      },
      {
        taskId: tasks[1].id,
        authorId: mason.id,
        body: "Schema looks solid. I added the extra metadata field for future automation hooks.",
      },
    ],
  });

  await prisma.activityLog.createMany({
    data: [
      {
        workspaceId: workspace.id,
        actorId: ava.id,
        projectId: platform.id,
        type: "PROJECT_CREATED",
        description: "Created the Platform Rebuild project.",
      },
      {
        workspaceId: workspace.id,
        actorId: mason.id,
        taskId: tasks[0].id,
        projectId: platform.id,
        type: "TASK_STATUS_CHANGED",
        description: "Moved Build authenticated workspace shell to In Progress.",
      },
      {
        workspaceId: workspace.id,
        actorId: ava.id,
        taskId: tasks[1].id,
        projectId: platform.id,
        type: "TASK_PRIORITY_CHANGED",
        description: "Raised Model activity events in Prisma to Critical priority.",
      },
      {
        workspaceId: workspace.id,
        actorId: riley.id,
        taskId: tasks[3].id,
        projectId: marketing.id,
        type: "TASK_CREATED",
        description: "Added Ship launch teaser visuals to the launch campaign backlog.",
      },
    ],
  });

  console.log("Seeded Taskora demo data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
