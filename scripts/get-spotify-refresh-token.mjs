/**
 * One-time Spotify Authorization Code helper.
 *
 * 1. Create an app at https://developer.spotify.com/dashboard
 * 2. Add redirect URI: http://127.0.0.1:8888/callback
 * 3. Put SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env (or .env.local)
 * 4. Run: npm run spotify:auth
 * 5. Paste the printed SPOTIFY_REFRESH_TOKEN into that same env file
 */

import fs from "node:fs";
import { randomBytes, timingSafeEqual } from "node:crypto";
import http from "node:http";
import path from "node:path";
import { URL } from "node:url";

function loadEnvFile(filename) {
  const filepath = path.join(process.cwd(), filename);
  if (!fs.existsSync(filepath)) return;

  for (const line of fs.readFileSync(filepath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID?.trim();
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET?.trim();
const REDIRECT_URI = "http://127.0.0.1:8888/callback";
const SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-read-recently-played",
].join(" ");

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Missing Spotify credentials. Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env, then run: npm run spotify:auth",
  );
  process.exit(1);
}

if (CLIENT_ID === "..." || CLIENT_SECRET === "...") {
  console.error(
    "Replace the ... placeholders with the Client ID and Client Secret from the Spotify Developer Dashboard.",
  );
  process.exit(1);
}

const authorizeUrl = new URL("https://accounts.spotify.com/authorize");
const state = randomBytes(32).toString("hex");
authorizeUrl.searchParams.set("state", state);
authorizeUrl.searchParams.set("client_id", CLIENT_ID);
authorizeUrl.searchParams.set("response_type", "code");
authorizeUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authorizeUrl.searchParams.set("scope", SCOPES);

const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
let exchanging = false;

const server = http.createServer(async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  let reqUrl;
  try {
    reqUrl = new URL(req.url ?? "/", REDIRECT_URI);
  } catch {
    res.writeHead(400);
    res.end("Invalid callback URL");
    return;
  }

  if (reqUrl.pathname !== "/callback") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  if (req.method !== "GET") {
    res.writeHead(405, { Allow: "GET" });
    res.end("Method not allowed");
    return;
  }

  const receivedState = Buffer.from(reqUrl.searchParams.get("state") ?? "");
  const expectedState = Buffer.from(state);
  if (receivedState.length !== expectedState.length || !timingSafeEqual(receivedState, expectedState)) {
    res.writeHead(400);
    res.end("Invalid OAuth state. Use the authorization URL printed in the terminal.");
    return;
  }

  if (exchanging) {
    res.writeHead(409);
    res.end("Authorization is already being processed.");
    return;
  }

  const code = reqUrl.searchParams.get("code");
  const authError = reqUrl.searchParams.get("error");

  if (authError || !code) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Authorization failed or missing code. Restart the helper to retry.");
    server.close();
    process.exitCode = 1;
    return;
  }

  exchanging = true;
  try {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
      signal: AbortSignal.timeout(10_000),
      redirect: "error",
    });

    const payload = await tokenRes.json();

    if (!tokenRes.ok || typeof payload.refresh_token !== "string" || !payload.refresh_token) {
      throw new Error("Token exchange failed");
    }

    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Success. You can close this tab and return to the terminal.");

    console.log("\nAdd this to .env.local (and Vercel env vars):\n");
    console.log(`SPOTIFY_REFRESH_TOKEN=${payload.refresh_token}\n`);
  } catch {
    res.writeHead(502);
    res.end("Token exchange failed. Restart the helper to retry.");
    console.error("Spotify token exchange failed. Check your app settings and try again.");
    process.exitCode = 1;
  } finally {
    server.close();
  }
});

const shutdownTimer = setTimeout(() => {
  console.error("Authorization timed out. Run npm run spotify:auth to try again.");
  server.close();
  process.exitCode = 1;
}, 5 * 60_000);
shutdownTimer.unref();
server.on("close", () => clearTimeout(shutdownTimer));

server.listen(8888, "127.0.0.1", () => {
  console.log("Open this URL in a browser and authorize your Spotify account:\n");
  console.log(authorizeUrl.toString());
  console.log("\nWaiting for callback on http://127.0.0.1:8888/callback ...");
});
