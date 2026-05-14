/**
 * Returns an app-internal path safe to use after login, or null.
 * Blocks protocol-relative and absolute URLs to avoid open redirects.
 */
export function safeRedirectPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  if (raw.includes("://")) return null;
  if (raw.startsWith("/auth/")) return null;
  return raw;
}
