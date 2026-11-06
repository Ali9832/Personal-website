import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Container({
  children,
  className,
  size = "default",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  size?: "default" | "narrow";
  as?: "div" | "section" | "article" | "header" | "footer" | "nav" | "main";
}) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-(--gutter)",
        size === "narrow" ? "max-w-(--container-narrow)" : "max-w-(--container)",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
