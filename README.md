# Taskora

Taskora is a production-style project management SaaS built with Next.js App Router, React, TypeScript, Tailwind CSS, Prisma, PostgreSQL, and Auth.js.

It is designed to feel like a simplified blend of Linear, Jira, and Trello while still showing real full-stack architecture choices suitable for a portfolio.

## Features

- Secure credential-based authentication with Auth.js and protected dashboard routes
- Workspace creation, switching, settings, member roles, and invite placeholder flow
- Project CRUD with owner, status, priority, timeline, filtering, and search
- Task CRUD with assignees, labels, comments, activity history, due dates, and attachment placeholder
- Drag-and-drop Kanban board using `dnd-kit` with optimistic status updates
- Dashboard analytics for projects, open tasks, completed tasks, overdue tasks, recent activity, and assigned work
- Global search for projects and tasks
- Task filtering by status, priority, assignee, label, and due date
- Responsive SaaS UI with dark mode, empty states, loading states, and destructive-action confirmation
- Realistic Prisma seed data for portfolio demos and screenshots

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma ORM
- PostgreSQL
- Auth.js
- Zod
- React Hook Form
- TanStack Query
- dnd-kit
- Recharts
- Radix UI primitives

## Demo Credentials

After seeding the database:

- Email: `ava@taskora.dev`
- Password: `Password123!`

## Project Structure

```text
src/
  app/
    (auth)/             login and signup
    (app)/              protected dashboard and workspace routes
    api/auth/           Auth.js route handler
  actions/              server actions for auth, workspaces, projects, tasks, comments
  components/           UI system, board, auth, analytics, layout
  data/                 server-side query helpers
  lib/                  auth, prisma, validation, permissions, utilities
  types/                shared app types
prisma/
  schema.prisma         normalized PostgreSQL schema
  seed.ts               realistic demo seed data
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local env file from `.env.example` and update the database URL:

```bash
cp .env.example .env
```

3. Generate the Prisma client:

```bash
npm run db:generate
```

4. Push the schema to PostgreSQL:

```bash
npm run db:push
```

5. Seed demo data:

```bash
npm run db:seed
```

6. Start the app:

```bash
npm run dev
```

7. Open `http://localhost:3000`

## Database Schema

The schema is intentionally normalized and includes:

- `User`
- `Password`
- `Workspace`
- `WorkspaceMember`
- `WorkspaceInvitation`
- `Project`
- `Task`
- `Comment`
- `Label`
- `TaskLabel`
- `ActivityLog`
- Auth.js tables: `Account`, `Session`, `VerificationToken`

Key modeling choices:

- Workspace membership is separated from users to support roles and future team features
- Password hashes are stored in a dedicated one-to-one model
- Labels are workspace-scoped and attached through a join table
- Activities are first-class records so task and project histories can be rendered chronologically

## Screenshots

Add screenshots for:

- Landing page
- Dashboard analytics
- Workspace projects view
- Kanban board
- Task detail modal
- Members and settings pages

Suggested folder:

```text
docs/screenshots/
```

## Verification

The following checks were run successfully in this workspace:

- `npm run lint`
- `npm run build`

## Future Improvements

- Email delivery and invitation acceptance flow
- File uploads for attachments
- Real-time updates with websockets or Supabase channels
- Richer RBAC and audit controls
- Pagination and advanced saved views
- Notifications and inbox workflows
- Calendar and timeline views

## Notes

- Prisma is configured for PostgreSQL and seeded with realistic sample data for demos.
- The UI is intentionally custom rather than generator-heavy so the architecture and component decisions stay visible.
