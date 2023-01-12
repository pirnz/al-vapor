<script lang="ts">
    import type { Option, Opts, Veggie } from "./types";
    import { pantry } from "./pantry.js";
    import { options } from "./options.js";
    export let opts: Opts;
    let localPantry: Veggie[] = pantry;
    let localOptions: Option[] = options;
    opts.options = localOptions;
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
        opts.options = localOptions;
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
    {#each localOptions as option (option.id)}
        <div>
            <p>
                {option.name}: {option.value}
            </p>
            <input
                type="range"
                min="0.0"
                max="10.0"
                step="0.1"
                bind:value={option.value}
                id={option.id}
            />
        </div>
    {/each}
    
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
