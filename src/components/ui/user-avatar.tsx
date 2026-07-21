import * as Avatar from "@radix-ui/react-avatar";
import { getInitials } from "@/lib/utils";

export function UserAvatar({
  user,
  className = "",
}: {
  user: {
    name?: string | null;
    image?: string | null;
  };
  className?: string;
}) {
  return (
    <Avatar.Root className={`inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border bg-[var(--card-strong)] ${className}`}>
      {user.image ? <Avatar.Image src={user.image} alt={user.name ?? "User"} className="h-full w-full object-cover" /> : null}
      <Avatar.Fallback className="text-sm font-semibold text-[var(--muted-foreground)]">
        {getInitials(user.name ?? "U")}
      </Avatar.Fallback>
    </Avatar.Root>
  );
}
