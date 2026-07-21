import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <Card className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{label}</p>
      <div className="space-y-1">
        <p className="text-3xl font-semibold">{value}</p>
        <p className="text-sm text-[var(--muted-foreground)]">{hint}</p>
      </div>
    </Card>
  );
}
