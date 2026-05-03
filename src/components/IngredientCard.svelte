<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Ingredient, Lang } from '../types';

  export let ing: Ingredient;
  export let lang: Lang = 'en';
  export let isSelected: boolean = false;
  export let selectedPrepId: number | undefined = undefined;

  const dispatch = createEventDispatcher<{
    toggle: number;
    selectPrep: { ingId: number; prepId: number };
  }>();

  $: name = ing.name[lang];
  $: hasPreps = ing.preparations.length > 1;
</script>

<div class="card-wrap">
  <button
    class="ingredient-btn"
    class:selected={isSelected}
    on:click={() => dispatch('toggle', ing.id)}
    aria-pressed={isSelected}
    aria-label={name}
  >
    <div class="img-wrap">
      {#if isSelected}
        <div class="steam-wisps" aria-hidden="true">
          <span style="--d:0s;    --dur:1.5s; left:5px"  />
          <span style="--d:0.5s;  --dur:1.8s; left:15px" />
          <span style="--d:0.25s; --dur:1.6s; left:25px" />
        </div>
      {/if}
      <img src="/img/{ing.img}" alt={name} />
    </div>

    <span class="label">{name}</span>

    {#if isSelected}
      <div class="check-badge" aria-hidden="true">
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path d="M1 3.5L3.2 6L8 1" stroke="white" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    {/if}
  </button>

  {#if isSelected && hasPreps}
    <div class="prep-pills">
      {#each ing.preparations as prep (prep.id)}
        <button
          class="prep-pill"
          class:active={selectedPrepId === prep.id}
          on:click={() => dispatch('selectPrep', { ingId: ing.id, prepId: prep.id })}
        >
          {prep.name[lang]}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .card-wrap {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .ingredient-btn {
    all: unset;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 10px 5px 8px;
    border-radius: 12px;
    background: white;
    border: 2px solid transparent;
    box-shadow: 0 1px 4px rgba(30,26,20,0.07);
    transition: transform 0.16s ease, box-shadow 0.16s ease,
                background 0.16s ease, border-color 0.16s ease;
    position: relative;
    outline: none;
    width: 100%;
    -webkit-tap-highlight-color: transparent;
  }

  .ingredient-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(30,26,20,0.12);
  }

  .ingredient-btn.selected {
    background: #e8f0eb;
    border-color: #2d5a3d;
    box-shadow: 0 2px 12px rgba(45,90,61,0.18);
    transform: translateY(-2px);
  }

  .img-wrap {
    position: relative;
    width: 56px;
    height: 56px;
  }

  img {
    width: 56px;
    height: 56px;
    object-fit: contain;
    display: block;
  }

  .label {
    font-size: 10px;
    font-weight: 500;
    color: #4a4438;
    text-align: center;
    line-height: 1.2;
    transition: color 0.16s;
  }

  @media (max-width: 480px) {
    .ingredient-btn {
      gap: 4px;
      padding: 8px 4px 6px;
    }

    .label {
      font-size: 9px;
    }

    .img-wrap, img {
      width: 44px;
      height: 44px;
    }
  }

  @media (max-width: 320px) {
    .ingredient-btn {
      gap: 3px;
      padding: 6px 3px 5px;
    }

    .label {
      font-size: 8px;
    }

    .img-wrap, img {
      width: 40px;
      height: 40px;
    }
  }

  .selected .label { color: #2d5a3d; }

  .check-badge {
    position: absolute;
    top: 7px; right: 7px;
    width: 17px; height: 17px;
    border-radius: 50%;
    background: #2d5a3d;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pop-in 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .steam-wisps {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 36px;
    height: 38px;
    pointer-events: none;
  }

  .steam-wisps span {
    position: absolute;
    bottom: 0;
    width: 3px; height: 14px;
    border-radius: 99px;
    background: rgba(180,210,188,0.9);
    filter: blur(1.5px);
    animation: steam-rise var(--dur) ease-in-out infinite;
    animation-delay: var(--d);
  }

  .prep-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: center;
    animation: slide-down 0.18s ease;
  }

  .prep-pill {
    all: unset;
    cursor: pointer;
    padding: 3px 8px;
    border-radius: 99px;
    font-size: 10px; font-weight: 500;
    border: 1px solid #c8bfaf;
    color: #8a7e6e;
    transition: all 0.13s ease;
    white-space: nowrap;
  }

  .prep-pill:hover { border-color: #2d5a3d; color: #2d5a3d; }

  .prep-pill.active {
    background: #2d5a3d;
    border-color: #2d5a3d;
    color: white;
  }

  @keyframes pop-in {
    0%   { transform: scale(0.5); opacity: 0; }
    65%  { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes steam-rise {
    0%   { transform: translateY(0) scaleX(1) rotate(-4deg); opacity: 0; }
    20%  { opacity: 0.65; }
    80%  { opacity: 0.3; }
    100% { transform: translateY(-44px) scaleX(1.5) rotate(4deg); opacity: 0; }
  }

  @keyframes slide-down {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
</style>
