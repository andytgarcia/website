# Mission Control portfolio

A Next.js portfolio with a public Spotify listening widget and a launch schedule from The Space Devs.

## Local development

Use Node.js 22 LTS (`nvm use`; see `.nvmrc`). Node 24 LTS is also supported by the declared engine range. The map dependency requires Node 22 or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Before deploying, run:

```sh
npm run lint
npm test
npm audit
npm run build
npm start
```

The build downloads Google Fonts and fetches public launch data. Permit outbound HTTPS to `fonts.googleapis.com`, `fonts.gstatic.com`, and `ll.thespacedevs.com` in the build environment. The app serves downloaded fonts locally. A launch-data outage falls back to the unavailable state and retries on the 30-minute revalidation schedule.

## Deployment configuration

Deploy as a Next.js application with a Node.js server or Vercel; static export does not support the Spotify API route. Select Node 22 or 24 in the hosting settings. Use `npm ci` to install the committed lockfile and `npm run build` to build.

Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin, such as `https://your-domain.example`, before building. On Vercel, `VERCEL_PROJECT_PRODUCTION_URL` is the fallback. Without either setting, social image URLs use localhost.

The Spotify widget is optional. Set these server-only environment variables in the host's secret settings to enable it:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REFRESH_TOKEN`

For local setup, put the client ID and secret in ignored `.env.local`, register `http://127.0.0.1:8888/callback` in the Spotify developer dashboard, and run `npm run spotify:auth`. Copy the newly printed refresh token into `.env.local` and your host's secret settings. Treat the printed token as a secret. Never prefix Spotify credentials with `NEXT_PUBLIC_` or commit environment files.

Enabling this feature intentionally publishes the owner's current or most recent track to anyone, including through `/api/now-playing`. No visitor account or authentication is required. With missing credentials it returns a generic 503 and the page displays its fallback.

The server needs outbound HTTPS access to `accounts.spotify.com` and `api.spotify.com`. Visitors' browsers load album artwork from the Spotify image hosts listed in `next.config.ts` and map tiles from `tiles.openfreemap.org`.

## Operational protections

Serve production over HTTPS. The app supplies CSP, anti-framing, MIME-sniffing, referrer, permissions, and HSTS headers. Its static-compatible CSP permits Next.js inline hydration scripts and MapLibre blob workers; it is not a strict nonce-based CSP. Add a new external asset host deliberately to both URL validation and CSP when an integration changes.

Spotify results (including empty results) are cached for 20 seconds, concurrent requests share work, and failures back off, honoring Spotify's `Retry-After`. All upstream calls in an operation share an eight-second deadline. This cache is **per server instance**. Configure the hosting provider's firewall/rate limits for `/api/now-playing` and normal DDoS protections before public exposure, particularly with multiple regions or autoscaling. CDN caching complements these controls.

After deployment, verify `/`, `/launches`, `/api/now-playing`, HTTPS redirects, and response security headers on the public domain. Check that Spotify credentials work in the deployed environment and that a launch API outage leaves the rest of the page usable.
