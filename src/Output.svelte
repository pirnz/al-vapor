<script lang="ts">
    import type { Opts, Batch, Veggie } from "./types";
    export let opts: Opts;
    let batches: Batch[];
    let tolerancia = opts.options.filter((opt) => {return opt.id == "tolerancia" })[0].value;
    let potencia = opts.options.filter((opt) => {return opt.id == "potencia" })[0].value;
    $: heatTime =
        Math.round((((10 - potencia) / 10) * 3 + 0.5) * 100) / 100;
    $: tolerance = Math.round(((tolerancia / 10) * 6 + 1.5) * 100) / 100;

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
            time += heatTime;
            let totalTime: number = groups[i][0].time;
            totalTime += heatTime;
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

<h1>Result:</h1>

{#if batches.length === 0}
    <p>Please select at least one veggie</p>
{:else}
    <div>
        <ul>
            <li>Heat time: {heatTime} min</li>
            <li>Tolerance: {tolerance} min</li>
            <li>Number of batches: {batches.length}</li>
        </ul>
        <p>Batches:</p>
        <ul>
            {#each batches as batch}
                <li>
                    Add {batch.ingredients}, for {batch.time} minutes ({batch.totalTime}
                    minutes remaining)
                </li>
            {/each}
        </ul>
    </div>
{/if}
