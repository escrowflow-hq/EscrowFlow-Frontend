import { SENTRY_DSN } from "@/lib/config";

/** Base for app-thrown errors carrying a user-facing message (see AuthError, MockServiceError). */
export class AppError extends Error {}

/**
 * Central place to report unexpected errors. Logs to the console everywhere;
 * once @sentry/nextjs is added, this is the only call site that needs to
 * change to also call Sentry.captureException.
 */
export function logError(error: unknown) {
  console.error(error);
  if (SENTRY_DSN) {
    // Sentry SDK not yet installed — wire Sentry.captureException(error) here once it is.
  }
}
