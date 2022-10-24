<script lang="ts">
    import type { Opts, Veggie } from "./types";
    import { pantry } from "./pantry.js";
    export let opts: Opts;
    let localPantry: Veggie[] = pantry;

    $: opts.veggies = localPantry.filter((veg) => {
        return veg.checked;
    });
</script>

<div>
    {#each localPantry as veggie (veggie.id)}
        <div style="display:flex">
            <input
                name={veggie.name}
                bind:checked={veggie.checked}
                type="checkbox"
            />
            <label title="{veggie.time} min" for={veggie.name}>
                {veggie.icon}
                {veggie.name}
            </label>
        </div>
    {/each}
    <p>
        Boiling power: <input
            type="range"
            min="0.1"
            max="10.0"
            step="0.1"
            bind:value={opts.heatPower}
            id="scale"
        />{opts.heatPower}
    </p>
    <p>
        El punto: <input
            type="range"
            min="0.1"
            max="10.0"
            step="0.1"
            bind:value={opts.tolerance}
            id="scale"
        />
        {opts.tolerance}
    </p>
</div>
