# Al-Vapor — Vegetable Steaming Calculator

A mobile-first web app that calculates the optimal order to add vegetables to a steamer so they all finish cooking at the same time.

## What It Does

**Single ingredient:** Instantly shows how long to steam a vegetable.  
**Multiple ingredients:** Calculates the batching order and wait times so every ingredient finishes together, accounting for heat loss when opening the pot.

## Quick Start

### Prerequisites
- Node.js 14+ and npm

### Development

```bash
# Install dependencies
npm install

# Start dev server with live reload (runs on port 5000)
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

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
| `App.svelte` | Layout, header, language toggle, info box |
| `Input.svelte` | Ingredient selection grid (8 items), prep dropdown, intensity slider |
| `Output.svelte` | Cook schedule display: single-ingredient time card or multi-ingredient timeline |
| `Timer.svelte` | Active cooking session: countdown, alerts, Wake Lock, PWA notifications |

### Data Flow

1. **Input.svelte** — User selects ingredients and cooking intensity
2. **Calculation** — Groups ingredients into batches (±3 min tolerance), accounts for +2 min heat loss per pot opening
3. **Output.svelte** — Displays total time and batch sequence
4. **Timer.svelte** — When 2+ ingredients are selected, user can start an active session with live countdown and alerts

### Core Data

**pantry.js** — Ingredient registry with:
- Base steam time (minutes)
- Prep variants (whole, halved, chopped, etc.) that modify cook time
- Intensity adjustment options

Reference: [Cooking4Charlie vegetable cooking table](https://www.cooking4charlie.com/veg-cooking-table/)

## Features

### Design
- **Mobile-first** — optimized for cooking scenarios where the phone is in hand
- **Bilingual** — English and Spanish UI (tracked in `i18n.ts`)
- **Responsive** — works from 320px+ screens
- **Warm color palette** — teal (#009688) accent with light greens

### UX Phases

**Phase 1: Value visibility**
- Single ingredient → time card ("Broccoli — 12 min")
- 2+ ingredients → timeline view with hero total time at top

**Phase 2: Reduced friction**
- Prep dropdown moves below ingredient, only shown after selection
- Cleaner ingredient grid without inline prep dropdowns

**Phase 3: Active cooking**
- Start button to begin a session
- Live countdown to next batch
- Audible beep at each batch waypoint
- Wake Lock keeps screen on (mobile)
- PWA notifications for background alerts (if permitted)

## Development Notes

### i18n (Internationalization)

All user-facing text is in `src/i18n.ts`. Add translations for both EN and ES:

```typescript
export const translations = {
  en: { /* English keys */ },
  es: { /* Spanish keys */ }
};
```

Update UI with:
```svelte
import { t } from './i18n';
{$t.keyName}
```

### Bilingual Strings

Manage in `i18n.ts` — centralized translations for EN/ES. The app detects browser language preference and allows manual toggle via flags in the header.

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

### Core Features
- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Mobile browsers (iOS Safari 13+, Chrome Android 80+)

### Optional Features
- **Wake Lock** — Chrome Android 84+, Safari iOS 16.4+
- **Web Audio API** — all modern browsers
- **PWA/Notifications** — requires HTTPS and installation

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
