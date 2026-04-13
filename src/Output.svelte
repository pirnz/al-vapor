<script lang="ts">
    import type { Opts, Batch, Veggie } from "./types";
    import { fly, fade } from 'svelte/transition';
    import { lang, t } from "./i18n";
    export let opts: Opts;
    let batches: Batch[];
    let potValues = [1.2, 1, 0.8];

    $: potencia = opts.options.filter((opt) => opt.id === "potencia")[0].value;
    $: heatTime = potValues[potencia - 1];
    $: tolerance = 2;

    function getIngredientsNames(veggies: Veggie[], currentLang: string): string {
        if (currentLang === 'en') {
            const names = veggies.map(v => v.name.en);
            if (names.length === 1) return names[0];
            return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
        }
        if (veggies.length === 1) {
            const { article, name } = veggies[0];
            return `${article.es} ${name.es[0].toLowerCase()}${name.es.slice(1)}`;
        }
        const names = veggies.map((e, i) => {
            const { article, name } = e;
            if (i === 0) {
                return `${article.es} ${name.es[0].toLowerCase()}${name.es.slice(1)}`;
            }
            return `${article.es[0].toLowerCase()}${article.es.slice(1)} ${name.es[0].toLowerCase()}${name.es.slice(1)}`;
        });
        return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
    }

    function group2batch(groups: Veggie[][], currentLang: string): Batch[] {
        const batches: Batch[] = [];
        for (let i = 0; i < groups.length; i++) {
            let time: number =
                i === 0
                    ? groups[i][0].time
                    : groups[i][0].time - batches[i - 1].totalTime;
            time *= heatTime;
            const totalTime = Math.round(groups[i][0].time * heatTime);
            batches.push({
                ingredients: getIngredientsNames(groups[i], currentLang),
                time: Math.round(time),
                index: i,
                totalTime,
            });
        }
        return batches;
    }

    function calcBatches(opts: Opts, currentLang: string): Batch[] {
        const veggies: Veggie[] = [...opts.veggies].sort((a, b) => a.time - b.time);
        const groups: Veggie[][] = [];
        for (let i = 0; i < veggies.length; i++) {
            if (i === 0) {
                groups.push([veggies[i]]);
            } else {
                const longestTime = groups[groups.length - 1][0].time;
                if (veggies[i].time - longestTime < tolerance) {
                    groups[groups.length - 1].push(veggies[i]);
                } else {
                    groups.push([veggies[i]]);
                }
            }
        }
        return group2batch(groups, currentLang).sort((a, b) => b.index - a.index);
    }

    $: batches = calcBatches(opts, $lang);
</script>

{#if batches.length > 0}
    <div class="output" transition:fly={{ y: -12, duration: 260 }}>
        <p class="total-time" in:fade={{ duration: 200, delay: 60 }}>
            {$t.estimatedTime}: <strong>{batches[0].totalTime} {$t.minutes}</strong>
        </p>
        <ol class="batch-list">
            {#each batches as batch, i (batch.index)}
                <li
                    class="order"
                    in:fly={{ x: -20, duration: 260, delay: 60 + i * 70 }}
                >
                    <span class="ingredients">{batch.ingredients}</span>
                    <span class="wait-line">
                        💨 {$t.wait} <strong>{batch.time} {$t.minutesShort}</strong>
                    </span>
                </li>
            {/each}
            <li
                class="done-item"
                in:fly={{ x: -20, duration: 260, delay: 60 + batches.length * 70 }}
            >
                ✅ {$t.done}
            </li>
        </ol>
    </div>
{:else}
    <div class="empty-state" transition:fade={{ duration: 200 }}>
        <p>{$t.emptyState}</p>
    </div>
{/if}

<style>
    .output {
        margin: 1em 0.75em 0.75em;
        font-family: 'Montserrat', Arial, sans-serif;
        color: #2a3a2a;
    }

    .total-time {
        font-size: 1.05em;
        color: #3a5a3a;
        margin: 0 0 0.85em;
        padding: 0.55em 0.9em;
        background: #e8f5f3;
        border-radius: 10px;
        display: inline-flex;
        align-items: baseline;
        gap: 0.35em;
    }

    .total-time strong {
        color: #007b6e;
        font-size: 1.15em;
        letter-spacing: 0.01em;
    }

    .batch-list {
        counter-reset: list-counter;
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.6em;
    }

    .order {
        counter-increment: list-counter;
        display: flex;
        flex-direction: column;
        background: #f7fff9;
        border: 1.5px solid #b2dfdb;
        border-radius: 12px;
        padding: 0.7em 0.9em;
        position: relative;
        transition: box-shadow 0.2s ease, transform 0.2s ease;
    }

    .order:hover {
        box-shadow: 0 4px 14px #b2dfdb55;
        transform: translateX(2px);
    }

    .order::before {
        content: counter(list-counter) "º";
        position: absolute;
        top: 0.55em;
        right: 0.8em;
        font-weight: 700;
        font-size: 0.8em;
        color: #009688;
        opacity: 0.6;
    }

    .ingredients {
        font-weight: 600;
        font-size: 1em;
        color: #2a3a2a;
        padding-right: 2em;
    }

    .wait-line {
        font-size: 0.9em;
        color: #5a7a6a;
        margin-top: 0.2em;
    }

    .wait-line strong {
        color: #007b6e;
    }

    .done-item {
        font-weight: 700;
        color: #009688;
        font-size: 1em;
        padding: 0.5em 0.5em;
        list-style: none;
        letter-spacing: 0.01em;
    }

    .empty-state {
        margin: 1.5em 0.75em;
        padding: 1.4em 1.2em;
        background: #f7fff9;
        border: 1.5px dashed #b2dfdb;
        border-radius: 14px;
        text-align: center;
        color: #7a9a8a;
        font-family: 'Montserrat', Arial, sans-serif;
        font-size: 0.93em;
        font-style: italic;
    }

    .empty-state p {
        margin: 0;
    }

    @media (max-width: 480px) {
        .output {
            margin: 0.75em 0.4em 0.5em;
        }

        .total-time {
            font-size: 0.97em;
            padding: 0.45em 0.75em;
        }

        .order {
            padding: 0.55em 0.75em;
        }

        .empty-state {
            margin: 1em 0.4em;
            padding: 1.1em 0.9em;
        }
    }
</style>
