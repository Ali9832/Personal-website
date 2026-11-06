export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-(--radius-md) focus:bg-accent-strong focus:px-4 focus:py-2 focus:text-on-accent focus:no-underline"
    >
      {label}
    </a>
  );
}
