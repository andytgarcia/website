# Personal portfolio website — project plan

## 1. Overview

**What we're building:** A personal portfolio website for [owner name — fill in], a software developer aiming to move into the space software development industry. The site showcases experience, projects, and interests, built around a restrained "mission control" space aesthetic rather than a literal rockets-and-planets theme.

**Primary audience:** Recruiters and hiring managers at aerospace/space-software companies, plus general professional visitors.

**Tone:** Professional but personable. The space theme should feel intentional and technical (like a HUD/telemetry display), not like a theme park.

## 2. Tech stack (default recommendation)

- **Framework:** Next.js (React), using API routes for the one server-side integration (Spotify)
- **Hosting:** Vercel (free tier is sufficient)
- **Styling:** CSS with custom properties for the design tokens below (Tailwind is fine if preferred)
- **Animation:** lightweight canvas or a small particles library (e.g. tsParticles) for the starfield background; avoid heavy 3D libraries (Three.js) unless explicitly requested later

Alternative stacks (Astro + a single serverless function, or plain HTML/CSS/JS + Netlify Functions) are acceptable if the owner prefers. The one hard requirement: a serverless/server-side function for the Spotify integration, since it needs a secret that cannot live in client-side code.

## 3. Design system

### Color palette (starting values, adjustable)
| Role | Value |
|---|---|
| Background base | `#0a0e1a` (near-black navy) |
| Surface / card | `#12172b` |
| Cool accent (links, highlights, hover) | `#4fd1ff` |
| Warm accent (primary CTAs only, used sparingly) | `#ffb454` |
| Text primary | `#e6e9f0` |
| Text secondary / muted | `#8b93a7` |
| Border / hairline | `#232a45` |

### Typography
- Headings: Space Grotesk or Sora
- Body: Inter or system sans-serif fallback
- Monospace (labels, dates, metadata, tags): JetBrains Mono or Space Mono — used to evoke telemetry/data readouts

### Visual motifs
- Slow-drifting starfield background (canvas), subtle, not distracting
- Sections styled as instrument panels: hairline borders, small corner brackets on cards
- Optional brief "boot sequence" animation on first load (skippable, under 2 seconds)
- Micro-interactions: small glow/ping on hover, nothing heavy

### Motion guidelines
- Respect `prefers-reduced-motion`
- Keep animation loops subtle
- Performance is part of the pitch for this audience — keep Lighthouse scores high

## 4. Site structure & pages

### Home / hero
- Name, one-line positioning statement
- Two CTAs: "View projects", "Resume"

### About
- Bio connecting background to the space-software career goal
- **Needs:** actual bio text from owner

### Experience
- Vertical timeline, "mission log" styling
- Entries: role, company, dates, 1–3 impact bullets
- **Needs:** actual work history from owner

### Projects
- Grid of project cards
- 2–3 flagship projects expanded (description, tech stack tags, links to GitHub/live demo)
- Remaining projects in a more compact list
- **Needs:** actual project list/details from owner

### Skills
- Grouped/tagged list (avoid radar charts — low information density for the visual complexity)

### Interests
- Casual personal section (hobbies, sci-fi, astronomy, etc.)
- **Location of the "now playing" Spotify widget** — see section 5

### Contact / footer
- Email, GitHub, LinkedIn, resume download link

## 5. Feature: "What am I listening to?" Spotify widget

### Purpose
Show the site owner's current (or most recent) Spotify track to any visitor. This is the owner's listening activity, not the visitor's — so it's authenticated as the owner via a stored token, not a per-visitor login.

### Why this needs a backend
Spotify's API requires an OAuth access token. That token, and the refresh token used to renew it, must never be exposed in client-side JavaScript, since anyone can read it from the page source. This requires a server-side piece (a Next.js API route / serverless function) that holds the secret and proxies requests to Spotify. Visitors' browsers only ever talk to this function, never to Spotify directly.

### One-time setup (manual, by the owner — not automatable by an agent)
1. Register an app in the Spotify Developer Dashboard to get a client ID and client secret.
2. Run the Authorization Code flow once, authorizing the owner's own Spotify account, requesting scopes:
   - `user-read-currently-playing`
   - `user-read-playback-state`
   - `user-read-recently-played` (for the fallback below)
3. Exchange the resulting authorization code for a refresh token and store it securely. It doesn't expire under normal use and is what the server function uses going forward.

### Environment variables (server-side only, never exposed to the client)
```
SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET
SPOTIFY_REFRESH_TOKEN
```

### Server function logic (e.g. `/api/now-playing`)
1. Use `SPOTIFY_REFRESH_TOKEN` plus client credentials to request a fresh short-lived access token from Spotify's token endpoint.
2. Call `GET https://api.spotify.com/v1/me/player/currently-playing` with that access token.
3. If the response is empty or indicates nothing is playing, fall back to `GET https://api.spotify.com/v1/me/player/recently-played?limit=1` and mark the result as "recently played" rather than "now playing."
4. Return a small normalized JSON payload to the frontend: track name, artist(s), album art URL, track URL, and a boolean `isPlaying`.

### Frontend widget behavior
- Poll the server function every 20–30 seconds
- States to handle:
  - **Actively playing:** album art, track, artist, small animated "equalizer bar" indicator
  - **Not playing (fallback):** album art/track shown with a "last listened to" label instead of "now playing"
  - **Error / no data:** graceful fallback message — never a broken or blank widget
- Visual treatment matches the design system in section 3 (panel styling, monospace metadata)

## 6. Suggested file structure (Next.js)

```
/app or /pages
  index.tsx            – home/hero
  about.tsx
  experience.tsx
  projects.tsx
  interests.tsx         – includes Spotify widget
  contact.tsx
  api/
    now-playing.ts      – Spotify serverless function
/components
  StarfieldBackground
  NowPlayingWidget
  ProjectCard
  TimelineEntry
  Nav / Footer
/lib
  spotify.ts             – token refresh + API calls
/public
  resume.pdf
  favicon (mission-patch style)
/styles
  design tokens (colors, fonts) as CSS variables
```

## 7. Open items / needs from the owner

- [ ] Final bio/about copy
- [ ] Work experience entries (roles, dates, bullets)
- [ ] Project list with descriptions, tech stacks, and links
- [ ] Resume file (PDF)
- [ ] Confirm hosting choice (default: Vercel)
- [ ] Confirm whether a "mission log" blog section is wanted (optional, not in initial scope)
- [ ] Spotify developer app credentials and refresh token (owner must generate manually)

## 8. Suggested build phases

1. **Scaffold** — framework setup, base layout/nav, design tokens as CSS variables
2. **Static content** — build all pages with placeholder or real content, no animation yet
3. **Spotify integration** — server function and widget end-to-end, including fallback states
4. **Motion & polish** — starfield background, hover states, optional boot sequence
5. **Performance & accessibility pass** — Lighthouse audit, `prefers-reduced-motion` support, alt text, deploy