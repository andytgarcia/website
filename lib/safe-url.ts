/** Validate API-provided links before exposing them in href/src attributes. */
export function safeHttpsUrl(value: unknown, allowedHosts?: readonly string[]): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    if (allowedHosts && !allowedHosts.includes(url.hostname)) return null;
    return url.href;
  } catch {
    return null;
  }
}
