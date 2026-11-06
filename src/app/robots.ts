import { type MetadataRoute } from "next";
import { isStaging } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo/routes";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // Staging: keep the whole copy out of the index, and do not advertise a
  // sitemap that would invite crawling anyway.
  if (isStaging) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /products is excluded from the sitemap and carries a noindex tag
        // until it has content. It is *not* disallowed here, because a
        // disallowed URL is never crawled and its noindex is never read.
        disallow: ["/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
