const MAX_BODY_BYTES = 32 * 1024;

// `detail` only ever reaches the authenticated caller (the Next.js server,
// which logs it). It never contains secrets: just which check failed, or
// Telegram's own error description.
function reply(status, code = 200, detail) {
  return Response.json(detail ? { status, detail } : { status }, {
    status: code,
    headers: { "Cache-Control": "no-store" },
  });
}

function constantTimeEqual(left, right) {
  if (left.byteLength !== right.byteLength) return false;
  let difference = 0;
  for (let index = 0; index < left.byteLength; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

async function readJson(request) {
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
    throw new RangeError("Body too large");
  }
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing body");
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new RangeError("Body too large");
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
  return JSON.parse(new TextDecoder().decode(body));
}

function validPayload(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  const limits = { name: [2, 80], email: [3, 160], subject: [3, 140], message: [30, 5000] };
  for (const [field, [minimum, maximum]] of Object.entries(limits)) {
    if (typeof data[field] !== "string" || data[field].trim().length < minimum || data[field].length > maximum) {
      return false;
    }
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) &&
    ["fa", "en"].includes(data.locale) &&
    (data.budget === undefined || (typeof data.budget === "string" && data.budget.length <= 60));
}

export default {
  async fetch(request, env) {
    if (request.method !== "POST") return reply("error", 405);
    if (new URL(request.url).pathname !== "/") return reply("error", 404);
    const missing = [
      (!env.CONTACT_WORKER_SECRET || env.CONTACT_WORKER_SECRET.length < 32) && "CONTACT_WORKER_SECRET",
      !env.TELEGRAM_BOT_TOKEN && "TELEGRAM_BOT_TOKEN",
      !env.TELEGRAM_CHAT_ID && "TELEGRAM_CHAT_ID",
    ].filter(Boolean);
    if (missing.length > 0) return reply("error", 503, `worker misconfigured: ${missing.join(", ")}`);

    const encoder = new TextEncoder();
    const supplied = encoder.encode(request.headers.get("authorization") ?? "");
    const expected = encoder.encode(`Bearer ${env.CONTACT_WORKER_SECRET}`);
    if (!constantTimeEqual(supplied, expected)) {
      return reply("error", 401, "secret mismatch");
    }
    if (request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() !== "application/json") {
      return reply("error", 415);
    }

    let data;
    try {
      data = await readJson(request);
    } catch (error) {
      return reply("error", error instanceof RangeError ? 413 : 400);
    }
    if (!validPayload(data)) return reply("error", 422, "invalid payload");

    const text = [
      `پیام جدید از سایت · ${data.locale}`,
      `نام: ${data.name}`,
      `ایمیل: ${data.email}`,
      `موضوع: ${data.subject}`,
      ...(data.budget ? [`بودجه: ${data.budget}`] : []),
      "",
      data.message,
    ].join("\n");
    const parts = [];
    let part = "";
    for (const character of text) {
      if (part.length + character.length > 3500) {
        parts.push(part);
        part = "";
      }
      part += character;
    }
    if (part) parts.push(part);

    try {
      const signal = AbortSignal.timeout(10000);
      for (const message of parts) {
        const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text: message,
            disable_web_page_preview: true,
          }),
          // Workers only accept "follow" or "manual"; "error" throws a
          // TypeError before the request is even sent. Telegram never
          // redirects, so a 3xx simply fails the ok check below.
          redirect: "manual",
          signal,
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.ok !== true) {
          // e.g. "Bad Request: chat not found" when TELEGRAM_CHAT_ID is an
          // @username instead of the numeric id, or the user never pressed
          // Start on the bot; "Unauthorized" for a wrong bot token.
          return reply("error", 502, `telegram ${response.status}: ${result.description ?? "unknown"}`);
        }
      }
      return reply("success");
    } catch (error) {
      return reply("error", 502, `telegram unreachable: ${error?.name ?? "Error"}: ${error?.message ?? ""}`.trim());
    }
  },
};
