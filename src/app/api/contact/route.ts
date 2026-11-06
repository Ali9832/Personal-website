import { NextResponse, type NextRequest } from "next/server";
import { handleContact } from "@/lib/contact/handle";
import { allowedContactOrigin, readContactBody } from "@/lib/contact/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The stable contract. The contact form reaches this through a server action
 * (so it works without JavaScript), and anything else — a future mobile
 * client, a landing page elsewhere — can post here directly.
 */
export async function POST(request: NextRequest) {
  if (!allowedContactOrigin(request.headers)) {
    return NextResponse.json({ status: "error", reason: "server" }, { status: 403 });
  }
  let form: Record<string, string>;

  const contentType = request.headers.get("content-type") ?? "";
  const mediaType = contentType.split(";")[0]?.trim().toLowerCase();
  if (!["application/json", "multipart/form-data", "application/x-www-form-urlencoded"].includes(mediaType ?? "")) {
    return NextResponse.json({ status: "error", reason: "server" }, { status: 415 });
  }
  try {
    const body = await readContactBody(request);
    const parsedRequest = new Response(body as BodyInit, { headers: { "Content-Type": contentType } });
    if (mediaType === "application/json") {
      const data: unknown = await parsedRequest.json();
      if (!data || typeof data !== "object" || Array.isArray(data) ||
          Object.values(data).some((value) => typeof value !== "string")) {
        return NextResponse.json({ status: "error", reason: "server" }, { status: 400 });
      }
      form = data as Record<string, string>;
    } else {
      const data = await parsedRequest.formData();
      if ([...data.values()].some((value) => typeof value !== "string")) {
        return NextResponse.json({ status: "error", reason: "server" }, { status: 400 });
      }
      form = Object.fromEntries(
        [...data.entries()].map(([key, value]) => [key, String(value)]),
      );
    }
  } catch (error) {
    return NextResponse.json({ status: "error", reason: "server" }, { status: error instanceof RangeError ? 413 : 400 });
  }

  const result = await handleContact(form, request.headers);

  const status =
    result.status === "success"
      ? 200
      : result.reason === "validation"
        ? 422
        : result.reason === "rate-limited"
          ? 429
          : 500;

  return NextResponse.json(result, { status });
}
