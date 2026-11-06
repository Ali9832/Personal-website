import localFont from "next/font/local";

/**
 * Self-hosted variable fonts. next/font emits them under /_next/static/media
 * with an immutable hash, inlines the @font-face rules into the document head,
 * and adds a preload link — so there is no render-blocking stylesheet and no
 * third-party connection to negotiate before first paint.
 */

export const vazirmatn = localFont({
  src: "../assets/fonts/vazirmatn-arabic-var.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-vazirmatn",
  display: "swap",
  preload: true,
  // The metric-compensated fallback next/font generates is tuned for Latin
  // metrics and shifts Persian text on swap; Tahoma is close enough to
  // Vazirmatn's proportions to keep CLS at zero without it.
  adjustFontFallback: false,
  fallback: ["Tahoma", "Segoe UI", "system-ui", "sans-serif"],
});

export const inter = localFont({
  src: "../assets/fonts/inter-latin-var.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-inter",
  display: "swap",
  // Not preloaded: the LCP element on the Persian pages — the default locale —
  // is always Persian text, so preloading Inter would only take bandwidth from
  // Vazirmatn. The @font-face rule is still inlined in <head>, so English
  // pages start fetching it as soon as styles resolve.
  preload: false,
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});

export const jetbrainsMono = localFont({
  src: "../assets/fonts/jetbrains-mono-latin-var.woff2",
  weight: "100 800",
  style: "normal",
  variable: "--font-mono",
  display: "swap",
  preload: false, // code blocks are never the LCP element
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const fontVariables = [
  vazirmatn.variable,
  inter.variable,
  jetbrainsMono.variable,
].join(" ");
