import Link from "next/link";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Card with a stretched link: the whole surface is clickable, but only the
 * title is in the tab order and read out as the link, so keyboard and screen
 * reader users get one target instead of five.
 */
export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}) {
  return (
    <Tag
      className={cn(
        "group relative flex flex-col rounded-(--radius-lg) border border-border bg-surface",
        "transition-colors duration-(--dur) ease-(--ease-out-soft) hover:border-border-strong",
        "focus-within:border-accent",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function CardLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="no-underline after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
    >
      {children}
    </Link>
  );
}
