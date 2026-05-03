<script lang="ts">
    import type { Opts, Batch, Veggie } from "./types";
    import { fly, fade } from 'svelte/transition';
    import { lang, t } from "./i18n";
    import Timer from "./Timer.svelte";
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
    {#if opts.veggies.length === 1}
        <!-- Single ingredient view -->
        <div class="output single-view" transition:fly={{ y: -12, duration: 260 }}>
            <div class="single-card" in:fade={{ duration: 200, delay: 60 }}>
                <p class="ingredient-name">{batches[0].ingredients}</p>
                <div class="time-display">
                    <span class="time-number">{batches[0].totalTime}</span>
                    <span class="time-unit">{$t.minutesShort}</span>
                </div>
            </div>
        </div>
    {:else}
        <!-- Multi-ingredient timeline view -->
        <div class="output multi-view" transition:fly={{ y: -12, duration: 260 }}>
            <div class="hero-stat" in:fade={{ duration: 200, delay: 60 }}>
                <span class="ready-label">{$t.readyIn}</span>
                <span class="ready-time">{batches[0].totalTime}</span>
                <span class="ready-unit">{$t.minutesShort}</span>
            </div>
            <div class="timeline" in:fade={{ duration: 200, delay: 100 }}>
                {#each batches as batch, i (batch.index)}
                    <div class="timeline-node" in:fly={{ x: -20, duration: 260, delay: 100 + i * 50 }}>
                        <div class="batch-info">
                            <p class="batch-ingredients">{batch.ingredients}</p>
                            {#if i < batches.length - 1}
                                <p class="wait-info">💨 {$t.wait} <strong>{batch.time} {$t.minutesShort}</strong></p>
                            {/if}
                        </div>
                    </div>
                {/each}
                <div class="timeline-node done" in:fly={{ x: -20, duration: 260, delay: 100 + batches.length * 50 }}>
                    <p class="done-text">✅ {$t.done}</p>
                </div>
            </div>
            <Timer {batches} />
        </div>
    {/if}
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

    /* Single ingredient view */
    .single-view {
        display: flex;
        justify-content: center;
    }

    .single-card {
        background: linear-gradient(135deg, #e8f5f3 0%, #f0faf8 100%);
        border: 2px solid #80cbc4;
        border-radius: 20px;
        padding: 2em 2.5em;
        text-align: center;
        max-width: 280px;
        box-shadow: 0 8px 24px #b2dfdb44;
    }

    .ingredient-name {
        margin: 0 0 1em;
        font-size: 1.3em;
        font-weight: 600;
        color: #007b6e;
        letter-spacing: 0.01em;
    }

    .time-display {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 0.3em;
    }

    .time-number {
        font-size: 3.5em;
        font-weight: 700;
        color: #009688;
        line-height: 1;
    }

    .time-unit {
        font-size: 1.1em;
        font-weight: 600;
        color: #3a5a3a;
        margin-bottom: 0.2em;
    }

    /* Multi-ingredient timeline view */
    .multi-view {
        display: flex;
        flex-direction: column;
        gap: 1.5em;
    }

    .hero-stat {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 0.4em;
        background: linear-gradient(135deg, #009688 0%, #00796b 100%);
        color: white;
        padding: 1.5em 2em;
        border-radius: 16px;
        box-shadow: 0 8px 24px #00968844;
    }

    .ready-label {
        font-size: 1em;
        font-weight: 500;
        letter-spacing: 0.02em;
    }

    .ready-time {
        font-size: 2.8em;
        font-weight: 700;
        line-height: 1;
    }

    .ready-unit {
        font-size: 1em;
        font-weight: 600;
        margin-bottom: 0.15em;
    }

    .timeline {
        display: flex;
        flex-direction: column;
        gap: 0.8em;
    }

    .timeline-node {
        background: #f7fff9;
        border: 1.5px solid #b2dfdb;
        border-radius: 12px;
        padding: 0.9em 1.1em;
        transition: box-shadow 0.2s ease, transform 0.2s ease, background 0.2s ease;
    }

    .timeline-node:hover {
        box-shadow: 0 4px 14px #b2dfdb55;
        transform: translateX(2px);
        background: #f0faf8;
    }

    .batch-info {
        display: flex;
        flex-direction: column;
        gap: 0.3em;
    }

    .batch-ingredients {
        margin: 0;
        font-weight: 600;
        font-size: 1em;
        color: #2a3a2a;
    }

    .wait-info {
        margin: 0;
        font-size: 0.9em;
        color: #5a7a6a;
    }

    .wait-info strong {
        color: #007b6e;
    }

    .timeline-node.done {
        background: #f0fef8;
        border-color: #80cbc4;
    }

    .done-text {
        margin: 0;
        font-weight: 700;
        color: #009688;
        font-size: 1em;
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

        .single-card {
            padding: 1.5em 2em;
            max-width: 100%;
        }

        .time-number {
            font-size: 2.8em;
        }

        .hero-stat {
            padding: 1.2em 1.5em;
            gap: 0.3em;
        }

        .ready-time {
            font-size: 2.2em;
        }

        .timeline-node {
            padding: 0.7em 0.9em;
        }

        .empty-state {
            margin: 1em 0.4em;
            padding: 1.1em 0.9em;
        }
    }
</style>
