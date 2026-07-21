import { inviteMember } from "@/actions/workspace";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getWorkspaceBySlug, requireUser } from "@/data/workspaces";
import { canInviteMembers } from "@/lib/permissions";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const user = await requireUser();
  const { workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug, user.id);

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Team members</p>
          <h1 className="mt-2 text-3xl font-semibold">Roles, access, and pending invitations.</h1>
        </div>
        {canInviteMembers(workspace.member.role) ? (
          <form action={inviteMember} className="grid gap-4 md:grid-cols-2 2xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.7fr)_auto]">
            <input type="hidden" name="workspaceId" value={workspace.id} />
            <div className="space-y-2 md:col-span-2 2xl:col-span-1">
              <label className="text-sm font-medium">Invite by email</label>
              <Input name="email" type="email" placeholder="person@company.com" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select name="role" defaultValue="MEMBER">
                <option value="OWNER">Owner</option>
                <option value="ADMIN">Admin</option>
                <option value="MEMBER">Member</option>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full sm:w-auto">
                Create invite
              </Button>
            </div>
          </form>
        ) : null}
      </Card>

      <div className="grid gap-6 2xl:grid-cols-[1fr_1fr]">
        <Card className="space-y-4">
          <h2 className="text-2xl font-semibold">Workspace roster</h2>
          <div className="space-y-3">
            {workspace.members.map((member) => (
              <div key={member.id} className="surface-soft flex flex-col gap-3 rounded-3xl p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold">{member.user.name}</p>
                  <p className="break-all text-sm text-[var(--muted-foreground)]">{member.user.email}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-semibold">{member.role}</p>
                  <p className="text-xs text-[var(--muted)]">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-4">
          <h2 className="text-2xl font-semibold">Pending invites</h2>
          <div className="space-y-3">
            {workspace.invitations.map((invite) => (
              <div key={invite.id} className="surface-soft flex flex-col gap-3 rounded-3xl p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="break-all font-semibold">{invite.email}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Invitation delivery flow can be connected to your email provider.</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-semibold">{invite.role}</p>
                  <p className="text-xs text-[var(--muted)]">{invite.status}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
