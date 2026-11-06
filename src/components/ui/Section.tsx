import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Container } from "./Container";

type SectionProps = {
  children: ReactNode;
  title?: ReactNode;
  lead?: ReactNode;
  /** Rendered opposite the title on wide screens — usually a "view all" link. */
  action?: ReactNode;
  id?: string;
  size?: "default" | "narrow";
  tone?: "plain" | "sunk";
  className?: string;
  /** Sections after the H1 use h2; a nested group can drop to h3. */
  headingLevel?: 2 | 3;
};

export function Section({
  children,
  title,
  lead,
  action,
  id,
  size = "default",
  tone = "plain",
  className,
  headingLevel = 2,
}: SectionProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <section
      id={id}
      className={cn(
        "py-16 sm:py-20 lg:py-24",
        tone === "sunk" && "bg-surface-sunk border-y border-border",
        className,
      )}
    >
      <Container size={size}>
        {(title || lead || action) && (
          <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="measure">
              {title && (
                <Heading className="text-2xl text-balance">{title}</Heading>
              )}
              {lead && <p className="mt-3 text-muted">{lead}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
