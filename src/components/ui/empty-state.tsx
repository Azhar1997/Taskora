import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="flex min-h-[220px] flex-col items-start justify-center gap-4 border-dashed">
      <div className="space-y-2">
        <p className="text-lg font-semibold">{title}</p>
        <p className="max-w-xl text-sm text-[var(--muted-foreground)]">{description}</p>
      </div>
      {action}
    </Card>
  );
}
