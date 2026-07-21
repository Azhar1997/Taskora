import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { requireUser } from "@/data/workspaces";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      memberships: {
        include: {
          workspace: true,
        },
      },
    },
  });

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <UserAvatar user={profile} className="h-20 w-20 rounded-[28px]" />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">{profile.name}</h1>
          <p className="text-[var(--muted-foreground)]">{profile.jobTitle ?? "Product builder"}</p>
          <p className="max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">{profile.bio ?? "Add a richer bio in a future enhancement."}</p>
        </div>
      </Card>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="space-y-4">
          <h2 className="text-2xl font-semibold">Account</h2>
          <div className="space-y-3 text-sm">
            <div className="surface-soft rounded-3xl p-4">
              <p className="font-semibold">Email</p>
              <p className="mt-1 text-[var(--muted-foreground)]">{profile.email}</p>
            </div>
            <div className="surface-soft rounded-3xl p-4">
              <p className="font-semibold">Timezone</p>
              <p className="mt-1 text-[var(--muted-foreground)]">{profile.timezone}</p>
            </div>
          </div>
        </Card>
        <Card className="space-y-4">
          <h2 className="text-2xl font-semibold">Workspace memberships</h2>
          <div className="space-y-3">
            {profile.memberships.map((membership) => (
              <div key={membership.id} className="surface-soft rounded-3xl p-4">
                <p className="font-semibold">{membership.workspace.name}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{membership.role}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
