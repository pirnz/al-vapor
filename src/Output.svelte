<script lang="ts">
    import type { Opts, Batch, Veggie } from "./types";
    export let opts: Opts;
    let batches: Batch[];
    let potValues = [1.2, 1, 0.8]
    $: potencia = opts.options.filter((opt) => {return opt.id == "potencia" })[0].value;
    $: heatTime = potValues[ potencia - 1 ];
    $: tolerance = 3;

    function join(veggies: Veggie[]): string {
        if (veggies.length === 1) return veggies[0].name;
        let names = veggies.map((e) => {
            return e.name;
        });
        return `${names.slice(0, -1).join(", ")} and ${
            names[names.length - 1]
        }`;
    }

    function group2batch(groups: Veggie[][]): Batch[] {
        let batches: Batch[] = [];
        for (let i = 0; i < groups.length; i++) {
            let time: number =
                i == 0
                    ? groups[i][0].time
                    : groups[i][0].time - batches[i - 1].totalTime;
            time *= heatTime;
            let totalTime: number = groups[i][0].time;
            totalTime *= heatTime;
            batches.push({
                ingredients: join(groups[i]),
                time: Math.round(time),
                index: i,
                totalTime: Math.round(totalTime)
            });
        }
        return batches;
    }

    function calcBatches(opts: Opts) {
        let veggies: Veggie[] = opts.veggies.sort((a, b) => a.time - b.time);
        let groups: Veggie[][] = [];
        for (let i = 0; i < veggies.length; i++) {
            if (i == 0) {
                groups.push([veggies[i]]);
            } else {
                let longestTime = groups[groups.length - 1][0].time;
                if (veggies[i].time - longestTime < tolerance)
                    groups[groups.length - 1].push(veggies[i]);
                else groups.push([veggies[i]]);
            }
        }
        return group2batch(groups).sort((a, b) => b.index - a.index);
    }
    $: batches = calcBatches(opts);
</script>

{#if batches.length === 0}
    <p></p>
{:else}
    <div>
        <ul>
            {#each batches as batch}
                <li>
                    Añade: {batch.ingredients}, y deja hervir {batch.time} minutos (quedan {batch.totalTime} minutos)
                </li>
            {/each}
        </ul>
    </div>
{/if}
