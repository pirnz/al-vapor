# Deployment Guide — Al-Vapor

Instructions for building, optimizing, and deploying Al-Vapor to production.

## Prerequisites

- Node.js 14+ and npm installed locally
- A hosting service (static hosting, serverless, or self-hosted)
- HTTPS-enabled hosting (recommended for PWA and Wake Lock when those features are added)

## Build for Production

```bash
# Install dependencies (if not already done)
npm install

# Run type checking
npm run check

# Build production bundle
npm run build
```

Output:
- `public/build/bundle.js` — minified main bundle
- `public/build/bundle.css` — extracted component styles
- `public/` — ready to serve as static files

## Deployment Options

### Option 1: Static Hosting (Recommended)

Al-Vapor is a static Svelte app—no backend required. Host the `public/` directory on any static host:

**Vercel** (recommended for Svelte)
```bash
npm install -g vercel
vercel
```
Vercel automatically detects Svelte and configures builds correctly. HTTPS is included.

**Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=public
```
HTTPS via Let's Encrypt is automatic.

**GitHub Pages**
1. Push to GitHub
2. Enable GitHub Pages in repo settings
3. Configure build: `npm run build && echo "public" > .nojekyll`
4. (Note: GitHub Pages auto-enables HTTPS for custom domains)

**AWS S3 + CloudFront**
1. Build: `npm run build`
2. Sync to S3: `aws s3 sync public s3://your-bucket/`
3. CloudFront distribution for HTTPS and caching
4. Reference: [AWS Hosting Static Websites](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

### Option 2: Self-Hosted

Serve `public/` with any HTTP server:

**Node.js (Sirv)**
```bash
npm install -g sirv-cli
sirv public
```

**Python**
```bash
python3 -m http.server --directory public 8000
```

**Nginx** (production-grade)
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /var/www/al-vapor/public;
    index index.html;
    
    # SPA: route all requests to index.html
    location / {
        try_files $uri /index.html;
    }
    
    # Cache static assets (build bundles)
    location /build/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Docker** (example Dockerfile)
```dockerfile
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM alpine:latest
WORKDIR /app
RUN apk add --no-cache caddy
COPY --from=builder /app/public .
EXPOSE 443 80
CMD ["caddy", "file-server", "--root", "/app", "--listen", ":443"]
```

## Timer Feature & Web APIs

Al-Vapor includes a cooking timer with several modern web APIs. These work best with HTTPS in production.

### Web APIs Used

**Wake Lock API** — Keeps phone screen on while timer is running
- Requires: Chrome Android 84+, Safari iOS 16.4+, HTTPS
- Gracefully degrades (user can manually keep screen on)
- Released on timer stop or browser back/close

**Notifications API** — Push notifications at each ingredient step
- Requires: HTTPS, user permission
- Prompts for permission when user taps "Start" on timer
- Users can deny (timer still works with just audio)
- Displays bilingual notifications (EN/ES)

**Web Audio API** — Audio alerts for timer events
- No permissions required
- Generates beeps at ingredient steps and distinctive completion alarm
- Completion alarm uses a 5-tone multi-frequency pattern (800, 1000, 1200, 1000, 1400 Hz) repeated twice for clarity
- Works even if app is not in focus (user must have audio enabled)

### Browser Compatibility

Timer features work on:
- ✅ Chrome Android 80+ (full support: Wake Lock, Notifications, Audio)
- ✅ Safari iOS 13+ (audio + notifications; Wake Lock on iOS 16.4+)
- ✅ Firefox 75+ (audio + notifications; no Wake Lock)
- ✅ Desktop browsers (audio + notifications; no Wake Lock)

## HTTPS & Security

**HTTPS is required** for all PWA features:
- **Wake Lock API** — keeps phone screen on during timer (Chrome Android 84+, Safari iOS 16.4+)
- **Web Notifications API** — push notifications at timer steps
- **Service Worker** — offline support and background caching
- **PWA Installation** — manifest and add-to-home-screen prompt

**Obtain a certificate:**
- Let's Encrypt (free) — use Certbot or your hosting provider's auto-renewal
- Self-signed (dev only) — `openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes`

## PWA Setup

Al-Vapor is a fully functional progressive web app that can be installed on mobile.

### ✅ Already Configured

**Manifest** — `public/manifest.json` is already set up with:
```json
{
  "name": "💨 al-vapor — Steam Calculator",
  "short_name": "al-vapor",
  "description": "Perfect steam cooking times, adjusted for your fire power",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#f7f3ec",
  "theme_color": "#2d5a3d",
  "orientation": "portrait-primary",
  "icons": [{ "src": "/favicon.png", "sizes": "192x192", ... }]
}
```
Linked in `public/index.html` with `<link rel="manifest" href="/manifest.json">`.

**Service Worker** — `public/sw.js` implements cache-first strategy:
- Caches all core assets on install
- Serves from cache first, falls back to network
- Auto-caches new assets on successful fetch
- Offline fallback to homepage

Registered in `public/index.html`:
```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
</script>
```

**Meta Tags** — `public/index.html` includes all PWA meta tags:
- `viewport` for mobile scaling
- `theme-color` for browser chrome color
- `description` for app store listings
- `apple-mobile-web-app-capable` for iOS
- `apple-mobile-web-app-status-bar-style` for iOS status bar

### Installation

Users will see an "Add to Home Screen" prompt on:
- **Android Chrome** — After a few visits
- **iOS Safari** — Use Share → Add to Home Screen manually (iOS does not auto-prompt)

On installation, the app behaves like a native app:
- Full-screen, no browser UI
- Portrait orientation by default
- Appears in app drawer/home screen
- Works offline (cached assets)

### Icon & Screenshots

The manifest currently uses `/favicon.png` for all icon sizes. For production:
- Generate proper PWA icons: 192x192 and 512x512 PNG
- Place in `public/img/` (or update manifest `src` paths)
- Include 540x720 screenshot for app stores

Example icon tools:
- [PWA Builder Image Generator](https://www.pwabuilder.com/)
- ImageMagick: `convert favicon.svg -resize 192x192 icon-192.png`

## Performance Optimization

### Caching Headers

Set long expiry for immutable assets (production):

```
/build/bundle.js — Cache-Control: public, immutable, max-age=31536000
/build/bundle.css — Cache-Control: public, immutable, max-age=31536000
/index.html — Cache-Control: public, max-age=3600 (1 hour)
/global.css — Cache-Control: public, max-age=86400 (1 day)
```

### Minification

Production build automatically minifies:
- JavaScript via Terser
- CSS via Rollup

Verify in `public/build/bundle.js` — should be single line.

### Asset Size

Check bundle size:
```bash
ls -lh public/build/
```

Typical production:
- bundle.js: ~15-20 KB (gzipped)
- bundle.css: ~3-5 KB (gzipped)

## Monitoring & Analytics

### Error Tracking
Consider Sentry, Bugsnag, or similar for client-side errors:
```javascript
// In public/index.html or src/main.ts
import * as Sentry from "@sentry/svelte";
Sentry.init({ dsn: "your-dsn" });
```

### Analytics
Optional: Plausible, Fathom, or Google Analytics
```html
<script defer data-domain="your-domain.com" src="https://plausible.io/js/script.js"></script>
```

## Environment Variables

If needed for future features (API keys, analytics IDs):
- Create `.env` file (dev only, not committed)
- Use `process.env.YOUR_VAR` in build (requires Rollup plugin)
- For deployment, set via hosting platform's environment settings (Vercel, Netlify, etc.)

## Continuous Integration / Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run check
      - run: npm run build
      - uses: actions/upload-artifact@v2
        with:
          name: build
          path: public/
```

### Pre-deployment Checklist

**Build & Code Quality:**
- [ ] `npm run check` passes (no TypeScript errors)
- [ ] `npm run build` succeeds without warnings
- [ ] `public/build/bundle.js` is minified (single line)

**Hosting & Security:**
- [ ] HTTPS is enabled on production domain
- [ ] Certificate is valid (not self-signed)
- [ ] Server supports HTTP/2 and gzip compression

**PWA Configuration:**
- [ ] Manifest.json exists and is valid JSON
- [ ] Manifest linked in index.html: `<link rel="manifest" href="/manifest.json">`
- [ ] Theme color and description set in meta tags
- [ ] Service Worker registered in index.html
- [ ] Service Worker (`public/sw.js`) exists

**Mobile Testing** (test on real devices if possible):
- [ ] Ingredient grid responsive on 320px (1 column), 480px (2 columns), desktop (4 columns)
- [ ] Timer opens and displays correctly
- [ ] Timer audio alerts work (beeps at each ingredient step and distinctive multi-frequency alarm at completion)
- [ ] Completion alarm is clearly audible (5-tone pattern: 800, 1000, 1200, 1000, 1400 Hz)
- [ ] Notifications permission prompt appears on timer start
- [ ] Push notifications appear (requires notification permission granted)
- [ ] Wake Lock prevents screen dimming during timer (Chrome Android 84+, Safari iOS 16.4+)
- [ ] PWA install prompt appears on mobile (Chrome: after several visits; iOS: use Share → Add to Home Screen)
- [ ] App works offline (after install, can load from service worker cache)
- [ ] Language toggle (EN/ES) works in all components
- [ ] Spanish translation is complete (menu items, timer, notifications)

## Rollback Plan

If deployment has issues:

1. **Quick rollback** — Revert DNS or origin server to previous deployment
2. **Cache clear** — If users are seeing stale assets:
   ```bash
   # Invalidate CDN cache (example: Cloudflare)
   # Or re-deploy with cache-busting (new hash in bundle filename)
   ```
3. **Check error logs** — Browser console or error tracking service

## Support & Troubleshooting

### HTTPS Not Working
- Check certificate is valid: `openssl s_client -connect your-domain.com:443`
- Verify server is listening on 443
- Check firewall allows inbound 443

### PWA Not Installing
- HTTPS required
- Manifest.json must be valid JSON
- Icons must be accessible at URLs in manifest
- Install prompt only shows on mobile

### Wake Lock Not Working
- HTTPS required
- Only works on Chrome Android 84+ and Safari iOS 16.4+
- Requires user to interact first (tap Start button)

### App Not Loading After Deploy
- Check `public/build/bundle.js` exists
- Verify correct `public/` directory is being served
- Check browser console for errors
- Clear browser cache and reload

### Timer / Notifications Issues

**Notifications permission not appearing:**
- User already denied permission (browser remembers this)
- Check browser settings: Settings → Notifications → al-vapor → Allow
- Requires HTTPS
- Try using app in private/incognito window to reset permissions

**Audio beeps not working:**
- Check browser volume and system volume
- Audio context may require user interaction (tap Start button) on some browsers
- Check browser console for `AudioContext` errors

**Wake Lock not keeping screen on:**
- Only supported on Chrome Android 84+ and Safari iOS 16.4+
- Requires HTTPS
- User must interact first (tap Start button)
- Phone may still sleep if battery saver is enabled

**Service Worker not caching / offline not working:**
- HTTPS required for service worker
- Clear browser cache and revisit site to trigger cache-addAll
- Check browser DevTools → Application → Service Workers → Status
- Verify service worker file path is correct: `/sw.js`

**PWA install prompt not appearing:**
- Chrome: only shows after user has visited multiple times
- iOS: no auto-prompt; use Safari Share → Add to Home Screen
- Manifest.json must be valid JSON
- Icons must be accessible (check network tab in DevTools)

## References

- [Svelte Deployment Docs](https://svelte.dev/docs#run-time-svelte-animate)
- [Web.dev PWA Checklist](https://web.dev/pwa-checklist/)
- [MDN Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/WakeLockSentinel)
- [MDN Web Notifications](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
