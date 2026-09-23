import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
// Static pages need Next.js's inline hydration scripts. Nonce-based CSP would
// require rendering every page per request and disable the launch page's ISR.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://i.scdn.co https://image-cdn-ak.spotifycdn.com https://image-cdn-fa.spotifycdn.com https://mosaic.scdn.co https://tiles.openfreemap.org",
  "font-src 'self'",
  `connect-src 'self' https://tiles.openfreemap.org${isDev ? " ws: wss:" : ""}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "Content-Security-Policy", value: contentSecurityPolicy },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ...(!isDev ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
      ],
    }];
  },
};

export default nextConfig;
