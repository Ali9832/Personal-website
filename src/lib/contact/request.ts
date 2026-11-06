import { siteUrl } from "@/lib/site";

export const MAX_CONTACT_BYTES = 32 * 1024;

export function allowedContactOrigin(headers: Headers): boolean {
  if (headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = headers.get("origin");
  if (!origin) return false;
  try {
    const from = new URL(origin);
    // Accept the bare and www host alike, so the form still works if the
    // panel serves both before one is redirected to the other.
    const bare = (host: string) => host.toLowerCase().replace(/^www\./, "");

    const site = new URL(siteUrl);
    if (from.protocol === site.protocol && bare(from.host) === bare(site.host)) return true;

    // Same-origin fallback: the page was served by this very host. Keeps the
    // form working even if the baked-in site URL is wrong for this deploy.
    const host = headers.get("x-forwarded-host")?.split(",")[0]?.trim() || headers.get("host");
    return Boolean(host) && bare(from.host) === bare(host!);
  } catch {
    return false;
  }
}

export async function readContactBody(request: Request): Promise<Uint8Array> {
  if (Number(request.headers.get("content-length")) > MAX_CONTACT_BYTES) {
    throw new RangeError("Contact body too large");
  }
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_CONTACT_BYTES) {
        await reader.cancel();
        throw new RangeError("Contact body too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}
