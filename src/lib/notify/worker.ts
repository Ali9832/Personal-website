import "server-only";
import { type ContactNotification, type Notifier } from "./types";

export class WorkerNotifier implements Notifier {
  readonly id = "worker";

  constructor(
    private readonly endpoint: string,
    private readonly secret: string,
  ) {}

  async send(notification: ContactNotification): Promise<void> {
    const endpoint = new URL(this.endpoint);
    if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password) {
      throw new Error("Invalid contact worker URL");
    }
    if (this.secret.length < 32) {
      throw new Error(`CONTACT_WORKER_SECRET is ${this.secret.length} characters; it must be at least 32`);
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.secret}`,
      },
      body: JSON.stringify({
        name: notification.name,
        email: notification.email,
        subject: notification.subject,
        budget: notification.budget,
        message: notification.message,
        locale: notification.locale,
      }),
      redirect: "error",
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
    });

    const result = (await response.json().catch(() => null)) as
      | { status?: string; detail?: string }
      | null;
    if (!response.ok || result?.status !== "success") {
      // The worker says which check failed (secret mismatch, missing secret,
      // Telegram's own error). It lands in the server log as "[contact] ...".
      throw new Error(
        `Contact worker HTTP ${response.status}${result?.detail ? ` — ${result.detail}` : ""}`,
      );
    }
  }
}
