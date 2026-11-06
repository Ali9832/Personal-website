import { ConsoleNotifier, TelegramNotifier } from "./telegram";
import { WorkerNotifier } from "./worker";
import { type Notifier } from "./types";

export type { ContactNotification, Notifier } from "./types";

/**
 * Resolved per request rather than at module load, so adding email later is
 * one more entry here and nothing else in the codebase changes.
 */
export function getNotifiers(): Notifier[] {
  const notifiers: Notifier[] = [];

  const workerUrl = process.env.CONTACT_WORKER_URL;
  const workerSecret = process.env.CONTACT_WORKER_SECRET;
  if (workerUrl || workerSecret) {
    if (workerUrl && workerSecret) return [new WorkerNotifier(workerUrl, workerSecret)];
    console.error(
      `[contact] ${workerUrl ? "CONTACT_WORKER_SECRET" : "CONTACT_WORKER_URL"} is not set — both are required`,
    );
    return [];
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (token && chatId) {
    notifiers.push(new TelegramNotifier(token, chatId));
  } else if (process.env.NODE_ENV !== "production") {
    // Keeps the form usable locally before the bot token exists.
    notifiers.push(new ConsoleNotifier());
  }

  return notifiers;
}
