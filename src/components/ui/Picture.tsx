import manifest from "@/lib/media/manifest.json";
import { cn } from "@/lib/utils/cn";

type MediaEntry = {
  width: number;
  height: number;
  widths: number[];
  avif: string;
  webp: string;
  fallback: string;
  blurDataURL: string;
};

const media = manifest as Record<string, MediaEntry>;

/**
 * Renders the responsive set produced by scripts/optimize-images.ts.
 *
 * Falls back to a plain <img> for anything not in the manifest (SVG covers,
 * external URLs), so adding an image never requires touching this component.
 * width/height are always emitted — CLS is a build-time guarantee, not a
 * runtime hope.
 */
export function Picture({
  src,
  alt,
  sizes = "100vw",
  priority = false,
  className,
  width,
  height,
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  width?: number;
  height?: number;
}) {
  const entry = media[src.replace(/\.[^./]+$/, "")] ?? media[src];

  const loading = priority ? "eager" : "lazy";
  const fetchPriority = priority ? "high" : "auto";

  if (!entry) {
    return (
      <img
        src={src}
        alt={alt}
        width={width ?? 1200}
        height={height ?? 750}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        className={cn("h-auto w-full", className)}
      />
    );
  }

  const srcSet = (template: string) =>
    entry.widths.map((w) => `${template.replace("{w}", String(w))} ${w}w`).join(", ");

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(entry.avif)} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(entry.webp)} sizes={sizes} />
      <img
        src={entry.fallback}
        alt={alt}
        width={entry.width}
        height={entry.height}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        style={{
          backgroundImage: `url(${entry.blurDataURL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className={cn("h-auto w-full", className)}
      />
    </picture>
  );
}
