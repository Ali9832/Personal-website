import { type Locale } from "@/lib/i18n/config";

/**
 * The contract lives in its own module so an implementation can import it
 * without importing the registry that imports the implementation.
 */
export type ContactNotification = {
  name: string;
  email: string;
  subject: string;
  budget?: string;
  message: string;
  locale: Locale;
  receivedAt: Date;
  userAgent?: string;
};

export interface Notifier {
  readonly id: string;
  send(notification: ContactNotification): Promise<void>;
}
