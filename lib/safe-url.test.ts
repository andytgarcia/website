import { describe, expect, it } from "vitest";
import { safeHttpsUrl } from "./safe-url";

describe("safeHttpsUrl", () => {
  it.each(["javascript:alert(1)", "data:text/html,unsafe", "http://example.test", "//example.test", "https://user:pass@example.test", "https://example.test:8443", null, {}])("rejects unsafe external URL %s", (url) => {
    expect(safeHttpsUrl(url)).toBeNull();
  });

  it("checks exact hostnames, including credential and suffix tricks", () => {
    expect(safeHttpsUrl("https://open.spotify.com/track/test", ["open.spotify.com"])).toBe("https://open.spotify.com/track/test");
    expect(safeHttpsUrl("https://open.spotify.com.evil.test/", ["open.spotify.com"])).toBeNull();
    expect(safeHttpsUrl("https://open.spotify.com@evil.test/", ["open.spotify.com"])).toBeNull();
  });
});
