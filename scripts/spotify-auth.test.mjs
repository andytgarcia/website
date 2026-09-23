import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => ({ handler: null, server: {
  listen: vi.fn((_port, _host, callback) => callback()),
  close: vi.fn(),
  on: vi.fn(),
} }));
vi.mock("node:http", () => ({ default: { createServer: (handler) => {
  mock.handler = handler;
  return mock.server;
} } }));
vi.mock("node:fs", () => ({ default: { existsSync: () => false } }));

let output;
beforeEach(async () => {
  vi.resetModules();
  vi.useFakeTimers();
  vi.stubEnv("SPOTIFY_CLIENT_ID", "test-client");
  vi.stubEnv("SPOTIFY_CLIENT_SECRET", "test-client-secret");
  vi.stubGlobal("fetch", vi.fn());
  output = vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  await import("./get-spotify-refresh-token.mjs");
});

afterEach(() => {
  process.exitCode = 0;
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function response() {
  return { setHeader: vi.fn(), writeHead: vi.fn(), end: vi.fn() };
}

function authorizationUrl() {
  const printed = output.mock.calls.find(([value]) => typeof value === "string" && value.startsWith("https://accounts.spotify.com/"));
  return new URL(printed[0]);
}

describe("local Spotify OAuth callback", () => {
  it("rejects malformed callback URLs without crashing the helper", async () => {
    const res = response();
    await mock.handler({ method: "GET", url: "http://[" }, res);
    expect(res.writeHead).toHaveBeenCalledWith(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(["", "wrong-state"])("rejects absent or mismatched state before token exchange", async (state) => {
    const res = response();
    expect(authorizationUrl().searchParams.get("state")).toMatch(/^[a-f0-9]{64}$/);
    await mock.handler({ method: "GET", url: `/callback?code=unsolicited&state=${state}` }, res);
    expect(res.writeHead).toHaveBeenCalledWith(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("accepts the matching state and only prints the new refresh token", async () => {
    const state = authorizationUrl().searchParams.get("state");
    fetch.mockResolvedValueOnce(Response.json({ refresh_token: "test-refresh-token" }));
    const res = response();
    await mock.handler({ method: "GET", url: `/callback?code=test-code&state=${state}` }, res);
    expect(res.writeHead).toHaveBeenCalledWith(200, expect.any(Object));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][1]).toMatchObject({ redirect: "error", signal: expect.any(AbortSignal) });
    expect(output.mock.calls.flat().join("\n")).toContain("SPOTIFY_REFRESH_TOKEN=test-refresh-token");
    expect(output.mock.calls.flat().join("\n")).not.toContain("test-client-secret");
    const duplicate = response();
    await mock.handler({ method: "GET", url: `/callback?code=test-code&state=${state}` }, duplicate);
    expect(duplicate.writeHead).toHaveBeenCalledWith(409);
  });

  it("handles network failures without an unhandled rejection or secret output", async () => {
    const state = authorizationUrl().searchParams.get("state");
    fetch.mockRejectedValueOnce(new Error("sensitive transport details"));
    const res = response();
    await mock.handler({ method: "GET", url: `/callback?code=test-code&state=${state}` }, res);
    expect(res.writeHead).toHaveBeenCalledWith(502);
    expect(console.error).not.toHaveBeenCalledWith(expect.stringContaining("sensitive transport details"));
  });
});
