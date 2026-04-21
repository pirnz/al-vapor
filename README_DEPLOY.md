# Deployment Guide — Al-Vapor

Instructions for building, optimizing, and deploying Al-Vapor to production.

## Prerequisites

- Node.js 14+ and npm installed locally
- HTTPS-enabled hosting (required for Wake Lock and PWA notifications)
- A domain name (recommended for PWA installation)

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

## HTTPS & Security

**HTTPS is required** for:
- Wake Lock API (mobile screen-on during cooking)
- PWA installation and notifications
- Service Worker registration

**Obtain a certificate:**
- Let's Encrypt (free) — use Certbot or your hosting provider's auto-renewal
- Self-signed (dev only) — `openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes`

## PWA Setup

Al-Vapor can be installed as a progressive web app on mobile.

### index.html Meta Tags

Ensure `public/index.html` includes:
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#b2dfdb">
<meta name="description" content="Vegetable steaming calculator">
```

### Manifest File (Optional but Recommended)

Create `public/manifest.json`:
```json
{
  "name": "Al-Vapor — Steaming Calculator",
  "short_name": "Al-Vapor",
  "description": "Calculate vegetable steaming times and batching order",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#009688",
  "scope": "/",
  "icons": [
    {
      "src": "/img/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/img/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Link in `public/index.html`:
```html
<link rel="manifest" href="/manifest.json">
```

### Service Worker (Optional)

For offline support, add a service worker. Example `public/sw.js`:
```javascript
self.addEventListener('install', event => {
  event.waitUntil(caches.open('v1').then(cache => {
    return cache.addAll([
      '/',
      '/build/bundle.js',
      '/build/bundle.css',
      '/global.css'
    ]);
  }));
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
```

Register in `public/index.html`:
```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
</script>
```

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

- [ ] `npm run check` passes (no TypeScript errors)
- [ ] `npm run build` succeeds without warnings
- [ ] `public/build/bundle.js` is minified (single line)
- [ ] HTTPS is enabled on production domain
- [ ] Manifest.json linked in index.html
- [ ] Meta tags set correctly (viewport, theme-color, description)
- [ ] Tested on mobile device (iOS Safari, Chrome Android)
- [ ] Wake Lock works (mobile)
- [ ] PWA installable (add to home screen appears)

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

## References

- [Svelte Deployment Docs](https://svelte.dev/docs#run-time-svelte-animate)
- [Web.dev PWA Checklist](https://web.dev/pwa-checklist/)
- [MDN Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/WakeLockSentinel)
- [MDN Web Notifications](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
