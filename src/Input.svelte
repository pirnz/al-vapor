<script lang="ts">
    import type { Option, Opts, Veggie, Preparation } from "./types";
    import { pantry } from "./pantry.js";
    import { options } from "./options.js";
    export let opts: Opts;
    let localPantry: Veggie[] = pantry;
    let localOptions: Option[] = options;

    function refreshPreps(event: SubmitEvent) {
        const vegId = event.target.parentElement.id;
        const prepName = event.target.value;
        let i = localPantry.findIndex((veg) => {
            if (veg.id.toString() == vegId) {
                return true;
            }
        });
        const preparation: Preparation[] = localPantry[i].preparations.filter((prep) => {
                return prepName == prep.name;
            });
        localPantry[i].time = preparation[0].time;
        opts.veggies = localPantry.filter((veg) => {
            return veg.checked;
        });
        opts.options = localOptions;
    }
    function refreshVegs(event: SubmitEvent) {
        let targetId: String = event.target.id;
        let i = localPantry.findIndex((veg) => {
            if (veg.id.toString() == event.currentTarget.id) {
                return true;
            }
        });
        const prepValue: String = document.getElementById('preparations-' + event.currentTarget.id).value;
        const preparation: Preparation[] = localPantry[i].preparations.filter((prep) => {
                return prepValue == prep.name;
            });
        localPantry[i].time = preparation[0].time;
        if(! targetId.includes('preparations')){
            localPantry[i].checked = !localPantry[i].checked;
        }
        opts.veggies = localPantry.filter((veg) => {
            return veg.checked;
        });
        opts.options = localOptions;
    }
    function refreshOpts(event: SubmitEvent) {
        opts.options = localOptions;
    }
</script>
<h4>Selecciona las verduras:</h4>
<div class="wrapper">
    {#each localPantry as veggie (veggie.id)}
        <div class="element">
            <button
                id={veggie.id.toString()}
                class="ingredient"
                on:click={refreshVegs}
                class:unchecked={!veggie.checked}
                class:checked={veggie.checked}
            >
                <img
                    src="/img/{veggie.img}"
                    alt={veggie.name}
                    class="vegetables"
                />
                <p class="label">{veggie.name}</p>
                {#if veggie.preparations.length > 1}
                    <select name="preparations" value="{veggie.preparations[0].name}" id="preparations-{veggie.id.toString()}" on:change={refreshPreps}>
                        {#each veggie.preparations as prep (prep.id)}
                            <option id="{prep.id}" value="{prep.name}">{prep.name}</option>
                        {/each}
                    </select>
                {:else}
                    <select name="preparations" value="{veggie.preparations[0].name}" id="preparations-{veggie.id.toString()}" style="display: none;">
                        {#each veggie.preparations as prep (prep.id)}
                            <option id="{prep.id}" value="{prep.name}">{prep.name}</option>
                        {/each}
                    </select>
                {/if}
            </button>
        </div>
    {/each}
</div>

<div  class="wrapper">
    {#each localOptions as option (option.id)}
        <div>
            <p>
                {option.name}: {option.value}
            </p>
            <input
                on:change={refreshOpts}
                type="range"
                min="{option.min}"
                max="{option.max}"
                step="{option.step}"
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
        max-height: 60px;
        max-width: 60px;
    }
    .ingredient {
        height: 100%;
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
        margin: 2em;
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
    .label {
        margin: 0;
    }
</style>
