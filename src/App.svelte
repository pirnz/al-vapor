<script lang="ts">
  import IngredientCard from './components/IngredientCard.svelte';
  import ResultRow from './components/ResultRow.svelte';
  import Timer from './components/Timer.svelte';
  import { pantry } from './pantry';
  import { computeOrder } from './lib/cooking';
  import type { Intensity, Lang, Selections } from './types';

  // ── State ────────────────────────────────────────────────────────────────

  let lang: Lang         = 'en';
  let intensity: Intensity = 2;
  let showInfo: boolean  = false;
  let showTimer: boolean = false;
  let selections: Selections = new Map();

  function toggleIngredient(ingId: number): void {
    const next: Selections = new Map(selections);
    if (next.has(ingId)) {
      next.delete(ingId);
    } else {
      const ing = pantry.find(p => p.id === ingId);
      if (ing) next.set(ingId, ing.preparations[0].id);
    }
    selections = next;
  }

  function selectPrep(ingId: number, prepId: number): void {
    selections = new Map(selections).set(ingId, prepId);
  }

  $: order = computeOrder(selections, pantry, intensity);

  // ── i18n helper ──────────────────────────────────────────────────────────
  $: t = (en: string, es: string) => lang === 'es' ? es : en;
  const langs: Lang[] = ['en', 'es'];
  const intensityOptions = [
    { v: 1 as Intensity, en: 'Low',    es: 'Bajo'   },
    { v: 2 as Intensity, en: 'Medium', es: 'Medio'  },
    { v: 3 as Intensity, en: 'High',   es: 'Alto'   },
  ];
</script>

<div class="app">

  <!-- HEADER -->
  <header>
    <button class="logo-btn" on:click={() => showInfo = !showInfo} aria-label="Info">💨</button>

    <div class="title-block">
      <h1>{t('Al-vapor - steam calculator', 'Al-vapor')}</h1>
      <p class="subtitle">{t('Perfect timing, every time', 'El tiempo perfecto, siempre')}</p>
    </div>

    <div class="lang-toggle" role="group" aria-label="Language / Idioma">
      {#each langs as l}
        <button
          class="lang-btn"
          class:active={lang === l}
          on:click={() => lang = l}
          aria-pressed={lang === l}
        >
          {l === 'en' ? '🇬🇧' : '🇪🇸'} {l.toUpperCase()}
        </button>
      {/each}
    </div>
  </header>

  <!-- INFO BOX -->
  {#if showInfo}
    <div class="info-box">
      <button class="close-btn" on:click={() => showInfo = false} aria-label="Close">×</button>
      <h2>{t('How it works', 'Cómo funciona')}</h2>
      <ul>
        <li>{t('Calculates the optimal steam time for each ingredient & cut.', 'Calcula el tiempo óptimo al vapor para cada ingrediente y corte.')}</li>
        <li>{t('Adjusts times for your fire power (low / medium / high).', 'Ajusta los tiempos según la potencia del fuego.')}</li>
        <li>{t('Tells you the exact add order so everything finishes together.', 'Te dice el orden exacto para que todo esté listo a la vez.')}</li>
      </ul>
    </div>
  {/if}

  <!-- MAIN -->
  <main>

    <div class="section-head">
      <h2 class="section-title">{t('Pick your ingredients', 'Elige tus ingredientes')}</h2>
      {#if selections.size > 0}
        <button class="clear-btn" on:click={() => selections = new Map()}>
          {t('Clear all', 'Limpiar')}
        </button>
      {/if}
    </div>

    <!-- Ingredient grid -->
    <div class="grid">
      {#each pantry as ing (ing.id)}
        <IngredientCard
          {ing}
          {lang}
          isSelected={selections.has(ing.id)}
          selectedPrepId={selections.get(ing.id)}
          on:toggle={e => toggleIngredient(e.detail)}
          on:selectPrep={e => selectPrep(e.detail.ingId, e.detail.prepId)}
        />
      {/each}
    </div>

    <!-- Fire power -->
    <div class="power-row">
      <div class="power-label">
        <span class="power-title">{t('Fire power', 'Potencia del fuego')}</span>
        <span class="power-sub">{t('Affects all cooking times', 'Afecta todos los tiempos')}</span>
      </div>
      <div class="power-btns">
        {#each intensityOptions as opt}
          <button
            class="intensity-btn"
            class:active={intensity === opt.v}
            on:click={() => intensity = opt.v}
          >
            {t(opt.en, opt.es)}
          </button>
        {/each}
      </div>
    </div>

    <!-- Results card -->
    <div class="results-card">
      <div class="results-header" class:has-order={order.length > 0}>
        <h2 class="results-title">
          {order.length > 0
            ? t('Add in this order', 'Añade en este orden')
            : t('Select ingredients to start', 'Selecciona ingredientes')}
        </h2>
        {#if order.length > 0}
          <button
            class="timer-badge-btn"
            on:click={() => showTimer = true}
            aria-label="Start timer"
            title={t('Start timer', 'Iniciar temporizador')}
          >
            <span class="timer-icon">⏱️</span>
            <span class="total-badge">{order[0].maxTime} {t('min', 'min')}</span>
          </button>
        {/if}
      </div>

      {#if order.length > 0}
        {#each order as item, i (item.ing.id)}
          <ResultRow {item} {lang} index={i} />
        {/each}
      {:else}
        <div class="empty-state">
          <span class="empty-icon">💨</span>
          <p>{t("Pick ingredients above and I'll tell you the perfect cooking order.", "Elige ingredientes y te diré el orden perfecto de cocción.")}</p>
        </div>
      {/if}
    </div>

  </main>

  <!-- FOOTER -->
  <footer>
    {t('Made by', 'Creado por')}
    <a href="https://laro.dev" target="_blank" rel="noopener noreferrer">🌊 laro.dev</a>
  </footer>

</div>

{#if showTimer}
  <Timer
    items={order}
    {lang}
    onClose={() => showTimer = false}
  />
{/if}

<style>
  .app {
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    flex-direction: column;
  }

  header {
    padding: 13px 18px;
    display: flex; align-items: center; gap: 11px;
    border-bottom: 1px solid var(--parchment);
    background: rgba(255,255,255,0.72);
    backdrop-filter: blur(10px);
    position: sticky; top: 0; z-index: 20;
  }

  .logo-btn {
    all: unset; cursor: pointer;
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 9px; background: #f0ebe0; font-size: 19px;
    flex-shrink: 0;
  }

  .title-block { flex: 1; }

  h1 {
    font-family: var(--font-display);
    font-size: 18px; font-weight: 700; color: var(--ink); line-height: 1.1;
  }

  .subtitle {
    font-size: 10px; color: var(--ink-soft); margin-top: 1px;
    letter-spacing: 0.06em; text-transform: uppercase;
  }

  .lang-toggle {
    display: flex; gap: 2px;
    background: var(--parchment); border-radius: 99px; padding: 3px;
  }

  .lang-btn {
    all: unset; cursor: pointer;
    padding: 5px 10px; border-radius: 99px;
    font-size: 12px; font-weight: 600; font-family: var(--font-body);
    color: var(--ink-soft); transition: all 0.15s;
  }

  .lang-btn.active {
    background: white; color: var(--ink);
    box-shadow: 0 1px 4px rgba(0,0,0,0.10);
  }

  .info-box {
    margin: 12px 14px 0; padding: 15px 17px;
    background: white; border-radius: 16px;
    border: 1px solid var(--parchment);
    box-shadow: 0 2px 12px rgba(30,26,20,0.07);
    position: relative; animation: slide-down 0.2s ease;
  }

  .close-btn {
    all: unset; cursor: pointer;
    position: absolute; top: 11px; right: 13px;
    font-size: 17px; color: var(--ink-soft); line-height: 1;
  }

  .info-box h2 {
    font-family: var(--font-display);
    font-size: 15px; font-weight: 700; color: var(--forest); margin-bottom: 9px;
  }

  .info-box ul { padding-left: 15px; display: flex; flex-direction: column; gap: 5px; }
  .info-box li { font-size: 13px; color: var(--ink-mid); line-height: 1.5; }

  main {
    flex: 1; padding: 18px 14px 28px;
    max-width: 560px; width: 100%; margin: 0 auto;
  }

  .section-head {
    display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px;
  }

  .section-title {
    font-family: var(--font-display);
    font-size: 17px; font-weight: 600; font-style: italic; color: var(--ink);
  }

  .clear-btn {
    all: unset; cursor: pointer;
    font-size: 11px; color: var(--ink-soft); text-decoration: underline;
  }

  .grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 18px;
  }

  @media (max-width: 480px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 320px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }

  .power-row {
    background: white; border-radius: 14px; padding: 11px 15px; margin-bottom: 14px;
    border: 1px solid var(--parchment);
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
  }

  .power-title {
    display: block;
    font-family: var(--font-display); font-size: 14px; font-weight: 600; color: var(--ink);
  }

  .power-sub { display: block; font-size: 11px; color: var(--ink-soft); margin-top: 1px; }
  .power-btns { display: flex; gap: 5px; flex-shrink: 0; }

  .intensity-btn {
    all: unset; cursor: pointer; padding: 6px 13px; border-radius: 99px;
    font-family: var(--font-body); font-size: 12px; font-weight: 500;
    border: 1.5px solid var(--parchment); background: transparent; color: var(--ink-soft);
    transition: all 0.15s ease;
  }

  .intensity-btn:hover { border-color: var(--forest); color: var(--forest); }
  .intensity-btn.active { background: var(--forest); border-color: var(--forest); color: white; }

  .results-card {
    background: white; border-radius: 20px;
    border: 1px solid var(--parchment); overflow: hidden;
    box-shadow: 0 2px 20px rgba(30,26,20,0.07);
  }

  .results-header {
    padding: 13px 18px; display: flex; align-items: center; justify-content: space-between;
    background: #f0ebe0; transition: background 0.35s ease;
  }

  .results-header.has-order { background: var(--forest); }

  .results-title {
    font-family: var(--font-display);
    font-size: 15px; font-weight: 700; font-style: italic;
    color: var(--ink-soft); transition: color 0.35s;
  }

  .has-order .results-title { color: white; }

  .timer-badge-btn {
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0;
    transition: transform 0.15s ease;
  }

  .timer-badge-btn:hover {
    transform: scale(1.05);
  }

  .timer-icon {
    font-size: 16px;
  }

  .total-badge {
    background: rgba(255,255,255,0.18); border-radius: 7px; padding: 3px 9px;
    color: white; font-size: 12px; animation: fade-up 0.2s ease;
  }

  .empty-state {
    padding: 34px 18px; text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 9px;
  }

  .empty-icon { font-size: 34px; opacity: 0.2; }
  .empty-state p { font-size: 13px; color: var(--ink-soft); line-height: 1.6; max-width: 210px; }

  footer {
    padding: 13px 18px; text-align: center;
    border-top: 1px solid var(--parchment);
    font-size: 11px; color: var(--ink-soft);
  }

  footer a { color: var(--forest); text-decoration: none; font-weight: 500; }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes slide-down {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
</style>
