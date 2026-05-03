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
| `App.svelte` | Main layout: header, ingredient selection, intensity controls, results display |
| `IngredientCard.svelte` | Single ingredient card with selection toggle and prep options |
| `ResultRow.svelte` | Result row showing ingredient, prep, and cooking time in the order list |

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
- **Bilingual** — English and Spanish UI with language toggle
- **Responsive** — works from 320px+ screens
- **Warm color palette** — teal (#009688) accent with light greens

### Current UX

- **Ingredient Selection** — 8-item grid of vegetables (IngredientCard)
- **Prep Options** — Each ingredient offers preparation variants (whole, halved, chopped, etc.)
- **Intensity Control** — Low/Medium/High settings to adjust cooking times
- **Results Display** — Shows total cook time and the order to add ingredients
- **Bilingual** — Full English/Spanish support with easy language toggle

## Development Notes

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
