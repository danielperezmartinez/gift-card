import { isDevMode } from '@angular/core';

// Production builds stay silent: errors can carry card ids and backend details.
// User-facing failures are reported by the caller, not through the console.
export function logError(message: string, error?: unknown): void {
  if (isDevMode()) {
    console.error(message, error);
  }
}
