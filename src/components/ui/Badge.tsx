import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "accent";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-(--radius-full) border px-2.5 py-0.5 text-xs font-medium",
        tone === "accent"
          ? "border-accent-border bg-accent-wash text-accent-text"
          : "border-border bg-surface-sunk text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
