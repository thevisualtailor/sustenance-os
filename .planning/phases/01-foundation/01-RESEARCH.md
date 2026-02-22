# Phase 1: Foundation - Research

**Researched:** 2026-02-22
**Domain:** Vite + PWA + Vercel deployment pipeline
**Confidence:** HIGH

## Summary

Phase 1 requires scaffolding a Vite vanilla JS project from the existing Compound OS reference, pushing it to GitHub, deploying to Vercel, and making it installable as a PWA on iPhone. All three concerns are well-trodden territory with clear standard approaches.

The Compound OS reference (`compound.os-main/`) is the single most important artifact here. It uses Vite 7.3.1 with vanilla JS, Geist + Roboto Mono fonts, Dexie for IndexedDB, and a dark theme with a specific CSS variable system. The Sustenance OS scaffold should match this pattern exactly — copy the structure, rename, strip Compound OS-specific content, and build from there.

For PWA, `vite-plugin-pwa` (v1.2.0, compatible with Vite 7) handles service worker generation and manifest injection automatically. iPhone specifically requires: `display: standalone` in the manifest, a `<link rel="apple-touch-icon">` pointing to a 180x180 PNG, and the `apple-mobile-web-app-capable` meta tag. Vercel detects Vite automatically — deploy is: create GitHub repo, import into Vercel, done.

**Primary recommendation:** Copy Compound OS structure as the scaffold base, add `vite-plugin-pwa` with `generateSW` strategy and iPhone-specific meta tags, deploy to Vercel via GitHub import.

## User Constraints

No CONTEXT.md exists for this phase. All implementation decisions come from STATE.md and the roadmap.

### Locked Decisions (from STATE.md)

- Vite + vanilla JS (no framework) — match Compound OS exactly, no React
- Claude Haiku as default AI model — pennies/day cost target
- No auth — single user (Jay), complexity not warranted

### Claude's Discretion

- PWA plugin choice (vite-plugin-pwa is the standard)
- Vercel configuration details
- Project structure within the Compound OS pattern
- Icon assets approach

### Deferred Ideas (OUT OF SCOPE for Phase 1)

- OCR via Claude Vision
- Fire meals seeded from fire-meals.md
- Chat UI and AI coaching
- Any data persistence beyond scaffold

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vite | 7.3.1 | Build tool and dev server | Already used by Compound OS; latest stable |
| vite-plugin-pwa | 1.2.0 | PWA manifest + service worker generation | Zero-config, works with Vite 7, framework-agnostic |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vite-pwa/assets-generator | latest | Generate icon sizes from single SVG source | Generating the 192/512/180 PNG icon set |
| geist | 1.7.0 | Geist Sans font (Vercel's font) | Match Compound OS typography exactly |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| vite-plugin-pwa | Manual service worker | PWA has many edge cases (cache versioning, update strategy, MIME types); don't hand-roll |
| Vercel | Netlify, Cloudflare Pages | Vercel detects Vite automatically; zero-config; Geist font is literally Vercel's font |

**Installation:**

```bash
npm install -D vite-plugin-pwa
npm install -D @vite-pwa/assets-generator
```

## Architecture Patterns

### Recommended Project Structure

Match Compound OS exactly:

```
sustenance-os/
├── public/
│   ├── pwa-192x192.png       # PWA manifest icon
│   ├── pwa-512x512.png       # PWA manifest icon (maskable)
│   └── apple-touch-icon.png  # 180x180, iPhone home screen
├── src/
│   ├── styles/
│   │   └── main.css          # CSS variables + reset (copy from Compound OS)
│   ├── view/
│   │   └── app-shell.js      # Header + main layout (adapted from Compound OS)
│   └── main.js               # Entry point + init()
├── index.html                # With PWA meta tags
├── vite.config.js            # With VitePWA plugin
├── package.json
└── vercel.json               # SPA rewrite rule
```

### Pattern 1: Vite Config with PWA Plugin

**What:** Configure `vite-plugin-pwa` inside `vite.config.js` with `generateSW` strategy (default) and inline manifest.
**When to use:** Always — this is the single-file approach that generates both service worker and manifest automatically.

```javascript
// Source: https://vite-pwa-org.netlify.app/guide/
// Source: https://www.blog.brightcoding.dev/2025/12/03/...
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    port: 5173,
    open: false,
  },
  build: {
    outDir: 'dist',
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      // generateSW is the default strategy — plugin writes the SW for you
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      manifest: {
        name: 'Sustenance OS',
        short_name: 'Sustenance',
        description: 'BED-safe nutrition coaching',
        theme_color: '#0a0a0a',      // match --bg from Compound OS
        background_color: '#0a0a0a',
        display: 'standalone',       // removes Safari chrome on iPhone
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
});
```

### Pattern 2: index.html with iPhone-Specific Meta Tags

**What:** The manifest alone is NOT enough for iPhone. Safari on iOS requires additional `<link>` and `<meta>` tags directly in `index.html`.
**When to use:** Always for iOS PWA support.

```html
<!-- Source: https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ -->
<!-- Source: https://firt.dev/notes/pwa-ios/ -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sustenance OS</title>

    <!-- PWA: iPhone home screen standalone mode -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Sustenance" />

    <!-- PWA: iPhone home screen icon (180x180 PNG required) -->
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

    <!-- PWA: theme colour for browser chrome (Android/desktop) -->
    <meta name="theme-color" content="#0a0a0a" />

    <!-- Fonts: match Compound OS exactly -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Roboto+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/src/styles/main.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

### Pattern 3: Vercel SPA Rewrite

**What:** A `vercel.json` file at the repo root to handle deep linking in SPA mode.
**When to use:** Required for Vite SPAs on Vercel — without it, direct URL navigation returns 404.

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Source: https://vercel.com/docs/frameworks/frontend/vite (official Vercel docs)

### Pattern 4: Compound OS CSS Variable System

**What:** Copy the CSS variable system from Compound OS verbatim. It is the design token foundation.
**When to use:** Phase 1 scaffold — establish the token system now, all subsequent phases depend on it.

```css
/* Source: compound.os-main/src/styles/main.css — copy verbatim */
:root {
  --bg: #0a0a0a;
  --bg-surface: #141414;
  --bg-elevated: #1e1e1e;
  --text-primary: #e0e0e0;
  --text-secondary: #888888;
  --text-muted: #555555;
  --accent: #4a9eff;
  --border: #2a2a2a;
  --success: #4ade80;
  --error: #ef4444;
  --warning: #f59e0b;
  --font-heading: 'Geist', system-ui, -apple-system, sans-serif;
  --font-body: 'Roboto Mono', monospace;
  --bento-gap: 15px;
}
```

Note: Compound OS uses Instrument Serif for the h1 title (via Google Fonts) and Geist via npm package for headings, plus Roboto Mono for body. Sustenance OS should match this exactly.

### Pattern 5: Vanilla JS App Shell Pattern

**What:** The `createAppShell()` pattern from Compound OS — imperative DOM construction, no templates.
**When to use:** All view modules follow this pattern.

```javascript
// Source: compound.os-main/src/view/app-shell.js (adapted)
export function createAppShell(root) {
  root.innerHTML = '';
  const header = document.createElement('header');
  header.className = 'app-header';
  // ... build DOM imperatively
  const main = document.createElement('main');
  main.className = 'app-main';
  root.appendChild(header);
  root.appendChild(main);
  return { header, main };
}
```

### Anti-Patterns to Avoid

- **Do not use `innerHTML` with user data:** Compound OS uses `textContent` for user-provided strings. Sustenance OS must do the same (XSS risk).
- **Do not use `display: fullscreen` in the manifest:** iOS does not support it; falls back to browser mode (not standalone). Use `standalone` only.
- **Do not serve fonts from node_modules path in production:** Compound OS references `/node_modules/geist/dist/fonts/...` which works in dev but breaks in Vercel build. For Phase 1, use Google Fonts or bundle fonts into `public/`.
- **Do not set `Cache-Control: immutable` on service worker or index.html:** Breaks PWA updates. Vercel's defaults are fine; do not add custom cache headers to these files.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Service worker | Custom SW from scratch | `vite-plugin-pwa` with `generateSW` | Cache versioning, update strategy, precache manifest injection, MIME type headers — all have gotchas |
| PWA icons | Manual resize in Photoshop | `@vite-pwa/assets-generator` CLI | Generates all required sizes (192, 512, 180) from one SVG source |
| Vercel build config | Custom `vercel.json` build settings | Let Vercel auto-detect Vite | Vercel detects Vite automatically; only `vercel.json` needed is the SPA rewrite |

**Key insight:** The service worker is where most PWA implementations fail in production. Cache versioning and update strategies are non-trivial. `vite-plugin-pwa` with `generateSW` handles all of this correctly out of the box.

## Common Pitfalls

### Pitfall 1: Geist Font from node_modules Path Breaks in Production

**What goes wrong:** Compound OS references Geist like `url('/node_modules/geist/dist/fonts/...')` in CSS. In Vite dev this works, but in production builds the `node_modules` path is not copied to `dist/`.
**Why it happens:** Vite dev server serves node_modules directly; the production build does not.
**How to avoid:** For Phase 1, use Geist via the npm package but configure Vite to copy the font files, OR switch to self-hosting via `public/fonts/`. The simplest fix: add Geist import to `vite.config.js` or place `.woff2` files in `public/`. Alternatively, load Geist from a CDN (`https://cdn.jsdelivr.net/npm/geist@1.3.0/dist/fonts/`).
**Warning signs:** Deployed site shows fallback system font instead of Geist; no 404s on `localhost`.

### Pitfall 2: iPhone Does Not Show "Add to Home Screen" Prompt

**What goes wrong:** No installation prompt appears on iPhone; user must know to use Share > Add to Home Screen manually.
**Why it happens:** iOS Safari does not support the `beforeinstallprompt` event — there is no automatic install banner on iPhone. This is a platform limitation, not a configuration problem.
**How to avoid:** Accept the limitation. Add a visible "Add to Home Screen" hint in the app UI (e.g., a dismissable banner with instructions). Do not attempt to implement install prompts on iOS.
**Warning signs:** Testing for `beforeinstallprompt` and assuming it means the PWA is not configured correctly.

### Pitfall 3: Service Worker Blocks Development

**What goes wrong:** Service worker caches aggressively during development, causing stale assets to be served even after code changes.
**Why it happens:** `generateSW` creates a production-grade service worker that caches everything.
**How to avoid:** `vite-plugin-pwa` does NOT register the service worker in development by default (unless you set `devOptions: { enabled: true }`). Leave `devOptions` unset and test PWA behavior only in production build (`npm run build && npm run preview`).
**Warning signs:** CSS changes not reflected in browser during dev; need to force-clear service worker in DevTools.

### Pitfall 4: Manifest Icons Not Used by iPhone — apple-touch-icon Override

**What goes wrong:** iPhone ignores the manifest `icons` array and shows a white box as the home screen icon.
**Why it happens:** Before iOS 15.4, iOS only read `<link rel="apple-touch-icon">`. Even on newer iOS, the `apple-touch-icon` link element overrides manifest icon declarations.
**How to avoid:** Always include `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` in `index.html` pointing to a 180x180 PNG in the `public/` directory. This is required regardless of what the manifest specifies.
**Warning signs:** Generic iOS icon (first letter of app name on white background) instead of custom icon.

### Pitfall 5: `display: standalone` Without Testing on Real Device

**What goes wrong:** Standalone mode looks right in Chrome DevTools mobile emulation but not on an actual iPhone.
**Why it happens:** DevTools emulation does not accurately simulate iOS Safari's PWA behaviour. You cannot debug web app manifests in Safari.
**How to avoid:** Test on a real iPhone after deploying to Vercel. The only reliable way to verify PWA installation on iOS is actually installing it. Use the Vercel preview URL for testing before production.
**Warning signs:** PWA "works" in DevTools but still shows Safari address bar when opened from home screen on iPhone.

### Pitfall 6: Compound OS Fonts Use Instrument Serif AND Geist

**What goes wrong:** Assuming Compound OS uses only one font family.
**Why it happens:** The app header uses Instrument Serif (Google Fonts) for the h1 title, Geist Sans (npm) for general headings, and Roboto Mono (Google Fonts) for body text. Three font sources.
**How to avoid:** For Phase 1, keep exactly this pattern. Include both Google Fonts links AND the Geist npm package. Fix the Geist node_modules path issue described in Pitfall 1.
**Warning signs:** Headers appear in fallback font; wrong typeface used for body text.

## Code Examples

Verified patterns from official sources:

### Minimal vite-plugin-pwa setup

```javascript
// Source: https://vite-pwa-org.netlify.app/guide/
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA({ registerType: 'autoUpdate' })
  ]
}
```

### Service Worker Registration in main.js (auto mode)

```javascript
// With registerType: 'autoUpdate' and injectRegister: 'auto' (defaults),
// no code needed in main.js. The plugin injects the registration script.
// Source: https://vite-pwa-org.netlify.app/guide/register-service-worker.html
```

### Vercel SPA Rewrite (vercel.json)

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Source: https://vercel.com/docs/frameworks/frontend/vite

### Generate PWA icon assets from SVG

```bash
# Source: https://vite-pwa-org.netlify.app/assets-generator/
npx @vite-pwa/assets-generator --preset minimal public/logo.svg
# Generates: pwa-192x192.png, pwa-512x512.png, apple-touch-icon.png (180x180)
```

### Minimal mobile-first CSS reset (matching Compound OS)

```css
/* Ensure no horizontal scroll on mobile */
html, body {
  overflow-x: hidden;
  width: 100%;
}

/* Minimum tap target size: 44px (Apple HIG) */
button, a, [role="button"] {
  min-height: 44px;
  min-width: 44px;
}

/* Safe area insets for iPhone notch/home indicator */
body {
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual `manifest.json` + custom SW | `vite-plugin-pwa` with `generateSW` | ~2021, mature as of 2023 | Zero-config, handles all cache versioning |
| `apple-mobile-web-app-capable` only | Both meta tag AND `display: standalone` in manifest | iOS 15.4 (2022) | Must include both for broadest compatibility |
| Separate icon sizes manually created | `@vite-pwa/assets-generator` CLI | 2023 | One SVG in, all sizes out |
| Vercel manual build config | Auto-detection | 2021 | Vite projects detected automatically, zero config |

**Deprecated/outdated:**

- Manual service worker with cache versioning strings: fragile, error-prone; `vite-plugin-pwa` handles this.
- `splitVendorChunkPlugin` from Vite: removed in Vite 7; don't use it.
- Sass legacy API: removed in Vite 7; not relevant here (we use plain CSS).

## Open Questions

1. **Geist font path in production**
   - What we know: Compound OS references `node_modules` path in CSS which breaks in production builds
   - What's unclear: Whether to self-host from `public/fonts/`, use Vite's `assetsInclude`, or load from CDN
   - Recommendation: Self-host in `public/fonts/geist/` to avoid network dependency and node_modules path issue. Copy the `.woff2` files from the npm package into `public/fonts/` during scaffold.

2. **Vite 7 vs staying on Compound OS version**
   - What we know: Compound OS uses Vite `^7.3.1`; vite-plugin-pwa 1.2.0 supports Vite 7
   - What's unclear: Whether to pin to same exact version or let npm resolve latest
   - Recommendation: Use `"vite": "^7.3.1"` matching Compound OS exactly to ensure identical behaviour.

3. **GitHub repo: new repo or existing project root**
   - What we know: The project root (`SustenanceOS/`) already has a git repo (with `.planning/` tracked)
   - What's unclear: Whether the Vite app should live at the repo root or in a subdirectory
   - Recommendation: Scaffold the Vite project at the repo root (matching Compound OS structure). The existing files (`compound.os-main/`, `.planning/`, etc.) are supplementary and will not interfere with Vite's build.

## Sources

### Primary (HIGH confidence)

- `compound.os-main/package.json` — Vite 7.3.1 confirmed, exact dependency list
- `compound.os-main/vite.config.js` — minimal Vite config pattern confirmed
- `compound.os-main/index.html` — font strategy and HTML structure confirmed
- `compound.os-main/src/styles/main.css` — CSS variables, typography, layout confirmed
- https://vite-pwa-org.netlify.app/guide/ — vite-plugin-pwa v1.2.0 confirmed, installation steps
- https://github.com/vite-pwa/vite-plugin-pwa/releases — v1.2.0 release date, Vite 7 compatibility
- https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ — Apple official: `apple-mobile-web-app-capable`, `apple-touch-icon` requirements
- https://vercel.com/docs/frameworks/frontend/vite — Vercel official: auto-detection, SPA rewrite config
- https://vite.dev/guide/static-deploy — Vite official: GitHub + Vercel deploy steps

### Secondary (MEDIUM confidence)

- https://firt.dev/notes/pwa-ios/ — iOS PWA compatibility notes (Maximiliano Firtman, well-known PWA expert), verified against Apple docs
- https://web.dev/learn/pwa/web-app-manifest — manifest requirements, verified against MDN
- https://vite-pwa-org.netlify.app/assets-generator/ — 180x180 iPhone icon requirement, verified with Apple docs

### Tertiary (LOW confidence)

- https://www.blog.brightcoding.dev/2025/12/03/... — complete config example; used for illustration only, core details cross-verified with official docs

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — Compound OS reference is authoritative, vite-plugin-pwa docs verified from official source
- Architecture: HIGH — directly derived from existing Compound OS code
- Pitfalls: HIGH for Geist font issue (directly observed in code); HIGH for iOS-specific issues (Apple official docs + firt.dev); MEDIUM for service worker dev pitfall (official docs confirm dev mode default)
- Vercel deploy: HIGH — official Vercel docs confirm zero-config for Vite

**Research date:** 2026-02-22
**Valid until:** 2026-03-22 (stable ecosystem; vite-plugin-pwa has infrequent breaking changes)
