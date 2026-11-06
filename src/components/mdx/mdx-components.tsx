import Link from "next/link";
import { type ComponentPropsWithoutRef } from "react";
import { type MDXComponents } from "mdx/types";
import { Callout } from "./Callout";
import { Picture } from "@/components/ui/Picture";

function Anchor({ href = "", children, ...rest }: ComponentPropsWithoutRef<"a">) {
  const internal = href.startsWith("/") || href.startsWith("#");
  if (internal) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}

export const mdxComponents: MDXComponents = {
  a: Anchor,
  img: ({ src, alt, width, height }: ComponentPropsWithoutRef<"img">) => (
    <Picture
      src={typeof src === "string" ? src : ""}
      alt={alt ?? ""}
      width={typeof width === "number" ? width : undefined}
      height={typeof height === "number" ? height : undefined}
      sizes="(min-width: 768px) 68ch, 100vw"
    />
  ),
  Callout,
};
