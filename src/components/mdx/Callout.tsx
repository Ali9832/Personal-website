import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const tones = {
  note: "border-border bg-surface-sunk",
  tip: "border-accent-border bg-accent-wash",
  warn: "border-negative/40 bg-negative/8",
} as const;

export function Callout({
  children,
  type = "note",
  title,
}: {
  children: ReactNode;
  type?: keyof typeof tones;
  title?: string;
}) {
  return (
    <aside
      className={cn(
        "rounded-(--radius-md) border p-4 text-sm",
        "border-s-3",
        tones[type],
      )}
    >
      {title && <p className="font-semibold">{title}</p>}
      <div className={cn(title && "mt-1", "[&>p+p]:mt-2")}>{children}</div>
    </aside>
  );
}
