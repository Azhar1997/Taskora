import { updateWorkspace } from "@/actions/workspace";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getWorkspaceBySlug, requireUser } from "@/data/workspaces";
import { canManageWorkspace } from "@/lib/permissions";

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const user = await requireUser();
  const { workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug, user.id);

  return (
    <div className="space-y-6">
      <Card className="max-w-3xl space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Settings</p>
          <h1 className="mt-2 text-3xl font-semibold">Workspace configuration</h1>
          <p className="mt-2 text-[var(--muted-foreground)] leading-7">Update the workspace&apos;s positioning, description, and owner-facing details.</p>
        </div>
        {canManageWorkspace(workspace.member.role) ? (
          <form action={updateWorkspace} className="space-y-4">
            <input type="hidden" name="workspaceId" value={workspace.id} />
            <div className="space-y-2">
              <label className="text-sm font-medium">Workspace name</label>
              <Input name="name" defaultValue={workspace.name} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea name="description" defaultValue={workspace.description ?? ""} />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Save settings
            </Button>
          </form>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">You have read-only access to workspace settings.</p>
        )}
      </Card>
    </div>
  );
}
