import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** Wrapper for MDX output. Styles live in src/styles/typography.css. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("prose", className)}>{children}</div>;
}
