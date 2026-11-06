import { type Thing, type WithContext } from "schema-dts";

/**
 * Structured data is rendered as a plain <script> in the server output — no
 * client component, no hydration cost. `</` is escaped because a string in
 * the payload could otherwise close the script tag early.
 */
export function JsonLd({ data }: { data: WithContext<Thing> | WithContext<Thing>[] }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <>
      {payload.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
