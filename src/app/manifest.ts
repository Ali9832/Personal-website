import { type MetadataRoute } from "next";
import { defaultLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { href } from "@/lib/seo/routes";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const dict = getDictionary(defaultLocale);
  return {
    name: `${dict.meta.siteName} — ${dict.meta.role}`,
    short_name: dict.meta.siteName,
    description: dict.meta.description,
    start_url: href(defaultLocale),
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#d97706",
    dir: "rtl",
    lang: "fa",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
