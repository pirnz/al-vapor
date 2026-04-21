<script lang="ts">
    import type { Batch } from "./types";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    export let batches: Batch[] = [];

    let sessionActive = false;
    let currentBatchIndex = 0;
    let timeRemaining = 0;
    let wakeLock: any = null;
    let hasNotificationPermission = false;
    let audioContext: AudioContext | null = null;

    onMount(() => {
        if (typeof window !== "undefined" && "AudioContext" in window) {
            audioContext = new (window.AudioContext as any)();
        }
        checkNotificationPermission();
        return () => {
            if (wakeLock) {
                wakeLock.release().catch(() => {});
            }
        };
    });

    function checkNotificationPermission() {
        if ("Notification" in window) {
            hasNotificationPermission = Notification.permission === "granted";
        }
    }

    async function acquireWakeLock() {
        if ("wakeLock" in navigator) {
            try {
                wakeLock = await (navigator as any).wakeLock.request("screen");
                wakeLock.addEventListener("release", () => {
                    wakeLock = null;
                });
            } catch (err) {
                console.log("Wake Lock request failed");
            }
        }
    }

    async function requestNotificationPermission() {
        if ("Notification" in window && Notification.permission === "default") {
            const permission = await Notification.requestPermission();
            hasNotificationPermission = permission === "granted";
        }
    }

    function playChime() {
        if (!audioContext) return;

        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.value = 800;
        osc.type = "sine";

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    function sendNotification(batchIngredients: string) {
        if (hasNotificationPermission && "Notification" in window) {
            new Notification("Time to add", {
                body: batchIngredients,
                tag: "steam-calculator-alert",
                requireInteraction: false,
            });
        }
    }

    async function startSession() {
        if (batches.length === 0) return;

        sessionActive = true;
        currentBatchIndex = 0;

        await acquireWakeLock();
        await requestNotificationPermission();

        runSession();
    }

    function runSession() {
        if (!sessionActive || currentBatchIndex >= batches.length) {
            sessionActive = false;
            return;
        }

        const batch = batches[currentBatchIndex];
        const waitMs = batch.time * 1000 * 60;

        playChime();
        sendNotification(batch.ingredients);

        const startTime = Date.now();

        const interval = setInterval(() => {
            if (!sessionActive) {
                clearInterval(interval);
                return;
            }

            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, Math.round((waitMs - elapsed) / 1000 / 60));
            timeRemaining = remaining;

            if (elapsed >= waitMs) {
                clearInterval(interval);
                currentBatchIndex++;
                runSession();
            }
        }, 1000);

        timeRemaining = batch.time;
    }

    function stopSession() {
        sessionActive = false;
        currentBatchIndex = 0;
        timeRemaining = 0;

        if (wakeLock) {
            wakeLock.release().catch(() => {});
            wakeLock = null;
        }
    }
</script>

{#if batches.length >= 2}
    <div class="timer-container" transition:fade={{ duration: 200 }}>
        {#if !sessionActive}
            <button class="start-button" on:click={startSession}>
                ▶ Start Cooking
            </button>
        {:else}
            <div class="session-active">
                <div class="countdown">
                    <p class="countdown-label">Next batch in</p>
                    <p class="countdown-time">{timeRemaining} min</p>
                </div>
                <p class="current-batch">{batches[currentBatchIndex]?.ingredients}</p>
                <button class="stop-button" on:click={stopSession}>
                    Stop
                </button>
            </div>
        {/if}
    </div>
{/if}

<style>
    .timer-container {
        margin: 1.5em 0.75em 0.75em;
        padding: 1.2em;
        background: #f7fff9;
        border: 1.5px solid #80cbc4;
        border-radius: 14px;
    }

    .start-button {
        width: 100%;
        padding: 1em;
        background: linear-gradient(135deg, #009688 0%, #00796b 100%);
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 1.1em;
        font-weight: 600;
        cursor: pointer;
        font-family: 'Montserrat', Arial, sans-serif;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .start-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px #00968844;
    }

    .start-button:active {
        transform: translateY(0);
    }

    .session-active {
        display: flex;
        flex-direction: column;
        gap: 1em;
        align-items: center;
    }

    .countdown {
        text-align: center;
    }

    .countdown-label {
        margin: 0;
        font-size: 0.9em;
        color: #5a7a6a;
        font-weight: 500;
    }

    .countdown-time {
        margin: 0.5em 0 0;
        font-size: 2.2em;
        font-weight: 700;
        color: #009688;
    }

    .current-batch {
        margin: 0;
        font-size: 0.95em;
        font-weight: 600;
        color: #2a3a2a;
        text-align: center;
    }

    .stop-button {
        padding: 0.7em 1.5em;
        background: #ff6b6b;
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        font-family: 'Montserrat', Arial, sans-serif;
        transition: background 0.2s ease;
    }

    .stop-button:hover {
        background: #ff5252;
    }

    @media (max-width: 480px) {
        .timer-container {
            margin: 1.2em 0.4em 0.5em;
            padding: 0.9em;
        }

        .start-button {
            padding: 0.8em;
            font-size: 1em;
        }

        .countdown-time {
            font-size: 1.8em;
        }
    }
</style>
