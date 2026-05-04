# Al-Vapor — Vegetable Steaming Calculator

A mobile-first web app that calculates the optimal order to add vegetables to a steamer so they all finish cooking at the same time. Includes an interactive cooking timer with screen wake-lock, audio/notification alerts, and PWA installation support.

## What It Does

**Single ingredient:** Instantly shows how long to steam a vegetable.  
**Multiple ingredients:** Calculates the batching order and wait times so every ingredient finishes together, accounting for heat loss when opening the pot.  
**Cooking timer:** Start a guided timer that keeps your screen on, alerts you at each ingredient step with audio and push notifications, and signals when cooking is complete.

## Quick Start

### Prerequisites
- Node.js 14+ and npm

### Development

```bash
# Install dependencies
npm install

# Start dev server with live reload (runs on port 8080)
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Production Build

```bash
npm run build
```

Outputs a minified, production-ready bundle to `public/build/`.

### Type Checking

```bash
npm run check
```

## Architecture

### Components

| File | Purpose |
|------|---------|
| `App.svelte` | Main layout: header, ingredient grid, intensity controls, results, timer button |
| `IngredientCard.svelte` | Single ingredient card with selection toggle and prep variant selector |
| `ResultRow.svelte` | Result row showing ingredient, prep variant, and cooking time in batching order |
| `Timer.svelte` | Full-screen timer modal with countdown, step tracking, audio/notifications, and wake-lock |

### Data Flow

1. **User Input** — Select ingredients via IngredientCard, choose cooking intensity (Low/Medium/High)
2. **Calculation** — `computeOrder()` groups ingredients into batches (±3 min tolerance), accounts for +2 min heat loss per pot opening
3. **Display** — Results shown via ResultRow components with total cook time and batch sequence

### Core Data

**src/pantry.ts** — Ingredient registry with:
- Base steam time (minutes)
- Prep variants (whole, halved, chopped, etc.) that modify cook time
- 8 vegetables with multiple preparation options

Reference: [Cooking4Charlie vegetable cooking table](https://www.cooking4charlie.com/veg-cooking-table/)

## Features

### Design
- **Mobile-first** — optimized for cooking scenarios where the phone is in hand
- **Bilingual** — English and Spanish UI with full language toggle
- **Responsive** — 4 columns (desktop) → 2 columns (480px) → 1 column (320px) for any screen size
- **Warm color palette** — forest green (#2d5a3d) with cream accents
- **Installable** — Add to home screen on iOS and Android (PWA)

### Core Features

- **Ingredient Selection** — 8-item responsive grid of vegetables with quick toggle
- **Prep Variants** — Each ingredient offers preparation options (whole, halved, chopped, etc.) that adjust cook time
- **Intensity Control** — Low/Medium/High settings to customize cooking times for your stove
- **Smart Batching** — Calculates the optimal order and timing to add ingredients so they all finish together
- **Results Display** — Shows total cook time and step-by-step ingredient sequence
- **Cooking Timer** — Interactive guided timer with:
  - ⏱️ Real-time countdown display
  - 🔔 Audio alerts at each ingredient step and completion
  - 🔔 Push notifications (with permission) for hands-free cooking
  - 📱 Screen wake-lock to prevent phone sleep during cooking
  - 🔄 Reset and pause controls

## Development Notes

### Timer Implementation

The Timer component (`Timer.svelte`) includes three modern web APIs:

**Wake Lock API** — Keeps the phone screen on while timer is running
```typescript
wakeLock = await navigator.wakeLock.request('screen');
```
Requires HTTPS in production. Useful for preventing screen dimming during active cooking.

**Web Notifications API** — Sends push notifications at each step and completion
```typescript
new Notification('Add carrots', { icon: '/favicon.png', tag: 'step' });
```
Requests permission on first timer start. Allows hands-free alerts even if the app is not in focus.

**Web Audio API** — Generates audio beeps for audible feedback
```typescript
const oscillator = audioCtx.createOscillator();
oscillator.frequency.value = freq;
```
Distinctive multi-frequency alarm pattern on completion:
- 5-tone sequence (800, 1000, 1200, 1000, 1400 Hz)
- Pattern repeats twice for emphasis and clarity
- Provides unmistakable audio confirmation that cooking is done

All notifications are bilingual (English/Spanish) and respect the language setting.

### PWA (Progressive Web App)

The app is installable on mobile as a native-like app.

**Manifest** — `public/manifest.json` defines:
- App name, icon, theme colors
- Display mode: `standalone` (full-screen, no browser UI)
- Orientation: `portrait-primary`
- Screenshots for app stores

**Service Worker** — `public/sw.js` provides:
- Cache-first strategy for all assets
- Offline support (app loads from cache, falls back to network)
- Auto-caching of new assets on fetch

**Installation** — Users see an "Add to Home Screen" prompt on mobile after a few visits. On iOS, use Safari's Share → Add to Home Screen.

### i18n (Internationalization)

Bilingual text is managed directly in components using a simple `t()` helper function:

```svelte
const t = (en: string, es: string): string => lang === 'es' ? es : en;

<p>{t('English text', 'Spanish text')}</p>
```

The app detects browser language preference on first load and allows manual toggle via language buttons in the header (🇬🇧 EN / 🇪🇸 ES).

### Styling

- **Global styles** — `public/global.css`
- **Component styles** — scoped within each `.svelte` file
- **Variables** — use CSS custom properties for colors and spacing

### TypeScript

Type definitions in `src/types.ts`. All components use TypeScript for type safety.

## Building & Deployment

See [README_DEPLOY.md](./README_DEPLOY.md) for production deployment, hosting, and PWA setup.

## Performance Tips

- Bundle is minified and tree-shaken in production
- Component CSS is extracted to separate file
- Live reload in dev mode via Rollup plugin
- Type checking before build: `npm run check`

## Browser Support

The app works on all modern browsers:
- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Mobile browsers (iOS Safari 13+, Chrome Android 80+)

Requires JavaScript and CSS Grid support.

## Contributing

1. Follow existing component patterns
2. Keep i18n strings updated for EN/ES
3. Test on mobile before committing
4. Run `npm run check` for type safety
5. Build succeeds without warnings: `npm run build`

## License

See LICENSE file in root directory.

## Author

[laro.dev](https://laro.dev)
