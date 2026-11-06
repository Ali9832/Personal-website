/** @type {import('next').NextConfig} */
const nextConfig = {
  // Run as a normal Next.js server on Runflare. This also enables the contact
  // API route and server actions, which are unavailable in a static export.
  output: "standalone",
  // Every internal URL (canonical, hreflang, sitemap) is generated with a
  // trailing slash by href(). Without this, Next 308s each of those URLs to
  // the slashless form and the sitemap lists nothing but redirects.
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // The platform image optimizer is deliberately off: responsive AVIF/WebP is
  // produced at build time by scripts/optimize-images.ts, so the runtime host
  // spends zero CPU on images and LCP is identical on the first hit.
  images: { unoptimized: true },

  // URL rewrites and locale handling live in src/proxy.ts.
};

export default nextConfig;
