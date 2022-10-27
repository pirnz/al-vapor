<script lang="ts">
    import type { Opts, Veggie } from "./types";
    import { pantry } from "./pantry.js";
    export let opts: Opts;
    let localPantry: Veggie[] = pantry;
    function refreshOpts(event: SubmitEvent) {
        let i = localPantry.findIndex((veg) => {
            if (veg.id.toString() == event.currentTarget.id) {
                return true;
            }
        });
        localPantry[i].checked = !localPantry[i].checked;
        opts.veggies = localPantry.filter((veg) => {
            return veg.checked;
        });
    }
</script>

<div class="wrapper">
    {#each localPantry as veggie (veggie.id)}
        <div class="element">
            <button
                id={veggie.id.toString()}
                on:click={refreshOpts}
                class:unchecked={!veggie.checked}
                class:checked={veggie.checked}
            >
                <img
                    src="/img/{veggie.img}.svg"
                    alt={veggie.name}
                    class="vegetables"
                />
                <p class="label">{veggie.name}</p>
            </button>
        </div>
    {/each}
    <div>
        <p>
            Boiling power: {opts.heatPower}
        </p>
        <input
            type="range"
            min="0.0"
            max="10.0"
            step="0.1"
            bind:value={opts.heatPower}
            id="heatPower"
        />
    </div>
    <div>
        <p>
            El punto: {opts.tolerance}
        </p>
        <input
            type="range"
            min="0.0"
            max="10.0"
            step="0.1"
            bind:value={opts.tolerance}
            id="tolerance"
        />
    </div>
</div>

<style>
    .element {
  display: flex;
  flex-direction: column;
    }
    .vegetables {
        max-height: 100px;
        max-width: 100px;
    }
    .unchecked {
        background-color: transparent;
        border-radius: 10px;
        margin: 3px;
    }
    .checked {
        color: green;
        border-color: green;
        background-color: transparent;
        border-width: 4px;
        border-radius: 10px;
        margin-bottom: 0;
    }
    .wrapper {
        list-style: none;
        margin: 2em;
        display: grid;
        gap: 20px;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
    .label {
        margin-top: 0;
    }
</style>
