import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("surface rounded-[28px] border border-[var(--border)] p-5", className)}>{children}</div>;
}
