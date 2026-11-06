import { type ReactNode } from "react";
import { type ServiceIcon as IconName } from "@/lib/content/schemas";
import { cn } from "@/lib/utils/cn";

const paths: Record<IconName, ReactNode> = {
  speed: (
    <>
      <path d="M12 21a9 9 0 1 1 9-9" />
      <path d="M12 12l5-4" />
      <path d="M12 12h.01" />
    </>
  ),
  wordpress: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 9h6M14.5 9h6M8 9l3 10 3-8 3 8 2.5-10" />
    </>
  ),
  woocommerce: (
    <>
      <path d="M3 5h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L20.5 8H6.2" />
      <circle cx="10" cy="20" r="1.3" />
      <circle cx="17" cy="20" r="1.3" />
    </>
  ),
  plugin: (
    <>
      <path d="M9 3v4M15 3v4" />
      <path d="M6 7h12v6a6 6 0 0 1-6 6 6 6 0 0 1-6-6z" />
      <path d="M12 19v3" />
    </>
  ),
  react: (
    <>
      <circle cx="12" cy="12" r="2" />
      <ellipse cx="12" cy="12" rx="9.5" ry="4" />
      <ellipse cx="12" cy="12" rx="9.5" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9.5" ry="4" transform="rotate(120 12 12)" />
    </>
  ),
  extension: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M14 9v11" />
    </>
  ),
};

export function ServiceIcon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("size-6", className)}
    >
      {paths[name]}
    </svg>
  );
}
