/**
 * Minimal class joiner. No clsx/tailwind-merge: nothing in this codebase
 * conditionally overrides the same utility twice, so a merge pass would be
 * ~3 kB of client JS solving a problem we do not have.
 */
export type ClassValue = string | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
