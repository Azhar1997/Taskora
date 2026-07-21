import { getUserWorkspaces, getWorkspaceBySlug, requireUser } from "@/data/workspaces";
import { WorkspaceSidebar } from "@/components/layout/workspace-sidebar";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}) {
  const user = await requireUser();
  const { workspaceSlug } = await params;
  const [workspaces, workspace] = await Promise.all([
    getUserWorkspaces(user.id),
    getWorkspaceBySlug(workspaceSlug, user.id),
  ]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(260px,300px)_minmax(0,1fr)]">
      <WorkspaceSidebar workspaces={workspaces} workspace={workspace} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
