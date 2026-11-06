export function CheckList({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <svg
            viewBox="0 0 24 24"
            className="mt-1 size-4 shrink-0 text-accent"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 12.5l5 5L20 6.5" />
          </svg>
          <span className="text-sm">{item}</span>
        </li>
      ))}
    </ul>
  );
}
