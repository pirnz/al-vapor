<script lang="ts">
  import type { Lang, OrderItem } from '../types';

  export let item: OrderItem;
  export let lang: Lang = 'en';
  export let index: number = 0;

  $: name     = item.ing.name[lang];
  $: prepName = item.prep.name[lang];
  $: isFirst  = index === 0;

  const t = (en: string, es: string): string => lang === 'es' ? es : en;
</script>

<div class="row" style="animation-delay: {index * 0.06}s">
  <div class="step" class:first={isFirst}>{index + 1}</div>

  <img src="/img/{item.ing.img}" alt={name} class="thumb" />

  <div class="info">
    <div class="name">
      {name}
      <span class="prep-name">{prepName}</span>
    </div>
    <div class="subline">
      {t(`steam ${item.time} min`, `cocinar ${item.time} min`)}
    </div>
  </div>

  {#if isFirst}
    <span class="badge now">{t('Now', 'Ahora')}</span>
  {:else}
    <span class="badge later">+{item.addAt} min</span>
  {/if}
</div>

<style>
  .row {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 12px 18px;
    border-bottom: 1px solid #f0ebe0;
    animation: fade-up 0.28s ease both;
  }
  .row:last-child { border-bottom: none; }

  .step {
    width: 26px; height: 26px;
    border-radius: 50%;
    flex-shrink: 0;
    background: #2d5a3d;
    color: white;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 12px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  .step.first { background: #c1602a; }

  .thumb {
    width: 34px; height: 34px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .info { flex: 1; min-width: 0; }

  .name {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 15px; font-weight: 600;
    color: #1e1a14;
    line-height: 1.2;
  }

  .prep-name {
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 11px; font-weight: 400;
    color: #8a7e6e;
    margin-left: 6px;
    font-style: italic;
  }

  .subline {
    font-size: 11px;
    color: #8a7e6e;
    margin-top: 2px;
  }

  .badge {
    border-radius: 6px;
    padding: 3px 9px;
    font-size: 11px; font-weight: 600;
    flex-shrink: 0;
  }
  .badge.now {
    background: #c1602a; color: white;
    letter-spacing: 0.04em; text-transform: uppercase;
  }
  .badge.later { background: #e8f0eb; color: #2d5a3d; }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
</style>
