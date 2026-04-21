<script lang="ts">
    import type { Option, Opts, Veggie } from "./types";
    import { pantry } from "./pantry.js";
    import { options } from "./options.js";
    import { lang, t } from "./i18n";
    import { fly } from 'svelte/transition';
    export let opts: Opts;
    let localPantry: Veggie[] = pantry;
    let localOptions: Option[] = options;
    let selectedVeggieId: number | null = null;

    function toggleVeggie(vegId: number) {
        const i = localPantry.findIndex((veg) => veg.id === vegId);
        localPantry[i].checked = !localPantry[i].checked;

        if (localPantry[i].checked) {
            selectedVeggieId = vegId;
        } else if (selectedVeggieId === vegId) {
            selectedVeggieId = null;
        }

        opts.veggies = localPantry.filter((veg) => veg.checked);
        opts.options = localOptions;
    }

    function selectPrep(event: Event, vegId: number) {
        const target = event.target as HTMLSelectElement;
        const prepId = parseInt(target.value);
        const i = localPantry.findIndex((veg) => veg.id === vegId);
        const preparation = localPantry[i].preparations.find((prep) => prep.id === prepId);
        if (preparation) {
            localPantry[i].time = preparation.time;
        }
        opts.veggies = localPantry.filter((veg) => veg.checked);
        opts.options = localOptions;
    }

    function refreshOpts() {
        opts.options = localOptions;
    }
</script>

<div class="wrapper">
    {#each localPantry as veggie, i (veggie.id)}
        <div class="element" in:fly={{ y: 14, duration: 220, delay: i * 38 }}>
            <button
                class="ingredient"
                on:click={() => toggleVeggie(veggie.id)}
                class:unchecked={!veggie.checked}
                class:checked={veggie.checked}
            >
                <img
                    src="/img/{veggie.img}"
                    alt={veggie.name[$lang]}
                    class="vegetables"
                />
                <p class="label">{veggie.name[$lang]}</p>
            </button>
        </div>
    {/each}
</div>

{#if selectedVeggieId !== null}
    {#each localPantry as veggie (veggie.id)}
        {#if veggie.id === selectedVeggieId && veggie.preparations.length > 1}
            <div class="prep-selector" in:fly={{ y: -10, duration: 200 }}>
                <p class="prep-label">{$t.selectPrep}</p>
                <select
                    value={veggie.preparations[0].id}
                    on:change={(e) => selectPrep(e, veggie.id)}
                    class="prep-select"
                >
                    {#each veggie.preparations as prep (prep.id)}
                        <option value={prep.id}>{prep.name[$lang]}</option>
                    {/each}
                </select>
            </div>
        {/if}
    {/each}
{/if}

<div class="options-wrapper">
    {#each localOptions as option (option.id)}
        <div class="option-row">
            <div class="option-label">
                <span class="option-name">{option.name[$lang]}</span>
                <span class="option-value">{option.value}</span>
            </div>
            <div class="option-range-row">
                <span class="range-label">{option.lowLabel[$lang]}</span>
                <input
                    on:change={refreshOpts}
                    type="range"
                    min={option.min}
                    max={option.max}
                    step={option.step}
                    bind:value={option.value}
                    id={option.id}
                    class="range-input"
                />
                <span class="range-label">{option.highLabel[$lang]}</span>
            </div>
        </div>
    {/each}
</div>

<style>
    .wrapper {
        margin: 1em 0.5em 0.75em;
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
    }

    .element {
        display: flex;
        flex-direction: column;
    }

    .ingredient {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.5em;
        border-radius: 14px;
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease, background 0.22s ease, border-color 0.22s ease;
        border: 2px solid transparent;
    }

    .ingredient:hover {
        transform: scale(1.08) translateY(-2px);
        box-shadow: 0 6px 20px #b2dfdb66;
    }

    .ingredient:active {
        transform: scale(0.94);
        transition-duration: 0.08s;
    }

    .unchecked {
        background-color: transparent;
    }

    .checked {
        background: #edf9f7;
        border: 2px solid #80cbc4;
        box-shadow: 0 2px 14px #b2dfdb60;
    }

    .vegetables {
        max-height: 56px;
        max-width: 56px;
        object-fit: contain;
        transition: transform 0.18s ease;
    }

    .ingredient:hover .vegetables {
        transform: scale(1.06);
    }

    .label {
        margin: 0.3em 0 0;
        font-size: 0.8em;
        font-family: 'Montserrat', Arial, sans-serif;
        color: #2a3a2a;
        text-align: center;
        line-height: 1.2;
        word-break: break-word;
    }

    .checked .label {
        color: #007b6e;
        font-weight: 600;
    }

    .prep-selector {
        margin: 1em 0.75em;
        padding: 1em;
        background: #f7fff9;
        border: 1.5px solid #80cbc4;
        border-radius: 14px;
        animation: slideDown 0.2s ease;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .prep-label {
        margin: 0 0 0.6em 0;
        font-family: 'Montserrat', Arial, sans-serif;
        font-size: 0.9em;
        font-weight: 600;
        color: #2a3a2a;
    }

    .prep-select {
        width: 100%;
        padding: 0.6em 0.8em;
        font-size: 0.95em;
        border-radius: 8px;
        border: 1px solid #b2dfdb;
        background: white;
        color: #2a3a2a;
        cursor: pointer;
        font-family: 'Montserrat', Arial, sans-serif;
        transition: border-color 0.2s ease;
    }

    .prep-select:hover {
        border-color: #80cbc4;
    }

    .prep-select:focus {
        outline: none;
        border-color: #009688;
        box-shadow: 0 0 0 3px #b2dfdb33;
    }

    .options-wrapper {
        margin: 1.4em 0.75em 0.75em;
        display: flex;
        flex-direction: column;
        gap: 0.5em;
        max-width: 440px;
        padding: 0.8em 1em;
        background: #f7fff9;
        border: 1.5px solid #e0f2f1;
        border-radius: 14px;
    }

    .option-row {
        display: flex;
        flex-direction: column;
        gap: 0.2em;
    }

    .option-label {
        display: flex;
        align-items: baseline;
        gap: 0.5em;
    }

    .option-name {
        font-family: 'Montserrat', Arial, sans-serif;
        font-weight: 600;
        font-size: 0.9em;
        color: #2a3a2a;
    }

    .option-value {
        font-family: 'Montserrat', Arial, sans-serif;
        font-size: 0.85em;
        color: #009688;
        font-weight: 600;
        min-width: 1.2em;
    }

    .option-range-row {
        display: flex;
        align-items: center;
        gap: 0.5em;
    }

    .range-label {
        font-family: 'Montserrat', Arial, sans-serif;
        font-size: 0.75em;
        color: #7a8a7a;
        white-space: nowrap;
    }

    .range-input {
        flex: 1;
        accent-color: #009688;
        margin: 0;
        padding: 0;
        border: none;
        cursor: pointer;
    }

    @media (max-width: 480px) {
        .options-wrapper {
            margin: 1.1em 0.5em 0.5em;
            padding: 0.65em 0.8em;
        }

        .prep-selector {
            margin: 0.8em 0.5em;
            padding: 0.8em;
        }
    }

    @media (max-width: 400px) {
        .wrapper {
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 7px;
            margin: 0.75em 0.25em 0.5em;
        }

        .vegetables {
            max-height: 48px;
            max-width: 48px;
        }

        .label {
            font-size: 0.76em;
        }
    }
</style>
