import { canManageWorkspace } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { WorkspaceBundle, WorkspaceSummary } from "@/types";
import { Layers3, LayoutDashboard, Settings, UsersRound, FolderKanban } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const navItems = [
  { href: "", label: "Overview", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/board", label: "Kanban", icon: Layers3 },
  { href: "/members", label: "Members", icon: UsersRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function WorkspaceSidebar({
  workspaces,
  workspace,
}: {
  workspaces: WorkspaceSummary[];
  workspace: WorkspaceBundle;
}) {
  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
      <Card className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Workspace</p>
          <div>
            <h1 className="break-words text-2xl font-semibold leading-tight">{workspace.name}</h1>
            <p className="mt-2 break-words text-sm leading-7 text-[var(--muted-foreground)]">{workspace.description}</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Switch workspace</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {workspaces.map((entry) => {
              const active = entry.id === workspace.id;
              return (
                <Link
                  key={entry.id}
                  href={`/workspace/${entry.slug}`}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-sm hover:border-[var(--primary)]",
                    active && "border-[var(--primary)] bg-white/10",
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{entry.name}</p>
                    <p className="text-xs text-[var(--muted)]">{entry._count.projects} projects</p>
                  </div>
                  {active ? <Badge className="border-[var(--primary)] text-[var(--primary)]">Active</Badge> : null}
                </Link>
              );
            })}
          </div>
        </div>
      </Card>
      <Card className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Navigate</p>
        <nav className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href || "overview"}
                href={`/workspace/${workspace.slug}${item.href}`}
                className="flex min-h-12 items-center gap-3 rounded-2xl px-3 py-3 text-sm text-[var(--muted-foreground)] hover:bg-white/10 hover:text-[var(--foreground)]"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </Card>
      <Card className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Access</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--muted-foreground)]">Your role</span>
          <Badge>{workspace.member.role}</Badge>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">
          {canManageWorkspace(workspace.member.role)
            ? "You can manage workspace settings, projects, and member invitations."
            : "You can contribute to tasks and collaborate across active projects."}
        </p>
      </Card>
    </aside>
  );
}
