import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "./mdx-components";

/**
 * Code is highlighted at build time by Shiki with a light and a dark theme
 * emitted side by side as CSS variables — the theme switch is a CSS rule, and
 * no highlighter ever reaches the browser.
 */
const prettyCode: PrettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark-dimmed" },
  keepBackground: false,
  defaultLang: { block: "text", inline: "text" },
};

export function Mdx({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        parseFrontmatter: false,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [rehypePrettyCode, prettyCode],
            [
              rehypeAutolinkHeadings,
              {
                behavior: "append",
                properties: { className: ["heading-anchor"], ariaHidden: true, tabIndex: -1 },
                content: { type: "text", value: "#" },
              },
            ],
          ],
        },
      }}
    />
  );
}
