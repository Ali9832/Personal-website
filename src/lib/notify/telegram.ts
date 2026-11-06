import { type ContactNotification, type Notifier } from "./types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Telegram Bot API. Chosen over SMTP for phase one because it needs no mail
 * server, no deliverability tuning and no SPF/DKIM records, and because a
 * push notification reaches a phone faster than an inbox does.
 */
export class TelegramNotifier implements Notifier {
  readonly id = "telegram";

  constructor(
    private readonly token: string,
    private readonly chatId: string,
  ) {}

  async send(n: ContactNotification): Promise<void> {
    const lines = [
      `<b>پیام جدید از سایت</b> · <code>${escapeHtml(n.locale)}</code>`,
      "",
      `<b>نام:</b> ${escapeHtml(n.name)}`,
      `<b>ایمیل:</b> <code>${escapeHtml(n.email)}</code>`,
      `<b>موضوع:</b> ${escapeHtml(n.subject)}`,
      ...(n.budget ? [`<b>بودجه:</b> ${escapeHtml(n.budget)}`] : []),
      "",
      escapeHtml(n.message),
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: this.chatId,
            text: lines.join("\n"),
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }),
          signal: controller.signal,
          cache: "no-store",
        },
      );

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(`telegram ${response.status}: ${detail.slice(0, 200)}`);
      }
    } finally {
      clearTimeout(timeout);
    }
  }
}

/** Development fallback so the form is testable before the bot exists. */
export class ConsoleNotifier implements Notifier {
  readonly id = "console";

  async send(n: ContactNotification): Promise<void> {
    console.info("[contact]", {
      name: n.name,
      email: n.email,
      subject: n.subject,
      budget: n.budget,
      locale: n.locale,
      message: n.message,
    });
  }
}
