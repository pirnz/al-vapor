<script lang="ts">
    import Input from './Input.svelte';
    import Output from './Output.svelte';
    import { options } from "./options.js";
    import type { Opts } from './types';
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
    import { lang, t } from './i18n';
    import type { Lang } from './i18n';

    let opts: Opts = {
        options: options,
        veggies: []
    };
    let showInfo = true;

    onMount(() => {
        if (typeof window !== 'undefined') {
            showInfo = localStorage.getItem('infoBoxClosed') !== 'true';
        }
    });

    function closeInfo() {
        showInfo = false;
        if (typeof window !== 'undefined') {
            localStorage.setItem('infoBoxClosed', 'true');
        }
    }

    function openInfo() {
        showInfo = true;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('infoBoxClosed');
        }
    }

    function setLang(l: Lang) {
        lang.set(l);
    }
</script>

<div class="app-wrapper">
    <header class="header">
        <button
            class="logo-btn"
            on:click={openInfo}
            aria-label={$t.clickForInfo}
            title={$t.clickForInfo}
        >
            <span class="logo" aria-hidden="true">💨</span>
        </button>
        <h1 class="title">{$t.title}</h1>
        <div class="lang-toggle" aria-label="Language / Idioma">
            <button
                class="lang-btn"
                class:active={$lang === 'es'}
                on:click={() => setLang('es')}
                title="Español"
                aria-pressed={$lang === 'es'}
            >🇪🇸</button>
            <button
                class="lang-btn"
                class:active={$lang === 'en'}
                on:click={() => setLang('en')}
                title="English"
                aria-pressed={$lang === 'en'}
            >🇬🇧</button>
        </div>
    </header>

    {#if showInfo}
        <div class="info-box" transition:fly={{ y: -16, duration: 280 }}>
            <button
                class="close-btn"
                on:click={closeInfo}
                aria-label="Cerrar / Close"
            >×</button>
            <h2>{$t.infoTitle}</h2>
            <ul>
                <li>{@html $t.infoItem1}</li>
                <li>{@html $t.infoItem2}</li>
            </ul>
            <p class="info-cta">{$t.infoCTA}</p>
        </div>
    {/if}

    <main>
        <Output bind:opts={opts}/>
        <Input bind:opts={opts}/>
    </main>

    <footer class="footer">
        <span>{$t.footerMadeBy} <a href="https://laro.dev" target="_blank" rel="noopener noreferrer">🌊 laro.dev</a></span>
    </footer>
</div>

<style>
.app-wrapper {
    max-width: 860px;
    margin: 0 auto;
    padding: 0 1rem 3rem;
    animation: appFadeIn 0.38s ease-out both;
}

@keyframes appFadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
}

.header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
    margin-top: 1.6em;
    margin-bottom: 0.8em;
    position: relative;
}

.logo-btn {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    line-height: 1;
    display: flex;
    align-items: center;
    transition: transform 0.2s ease;
}

.logo-btn:hover {
    transform: scale(1.15) rotate(-5deg);
}

.logo {
    font-size: 2.2em;
    filter: drop-shadow(0 2px 4px #b2dfdb88);
}

.title {
    font-family: 'Fredoka', Arial, sans-serif;
    font-size: clamp(1.6em, 5vw, 2.3em);
    margin: 0;
    letter-spacing: 1px;
    color: #2a3a2a;
    text-shadow: 0 2px 8px #e0f7fa;
}

.lang-toggle {
    display: flex;
    gap: 0.2em;
    margin-left: auto;
}

.lang-btn {
    background: none;
    border: 2px solid transparent;
    border-radius: 8px;
    font-size: 1.35em;
    padding: 0.1em 0.2em;
    cursor: pointer;
    opacity: 0.35;
    transition: opacity 0.2s ease, border-color 0.2s ease, transform 0.15s ease, background 0.2s ease;
    line-height: 1;
}

.lang-btn:hover {
    opacity: 0.72;
    transform: scale(1.1);
}

.lang-btn.active {
    opacity: 1;
    border-color: #b2dfdb;
    background: #f0faf9;
}

.info-box {
    background: #f7fff9;
    border: 2px solid #b2dfdb;
    border-radius: 16px;
    padding: 1.15em 1.5em 1.1em;
    margin: 0.75em auto 1em;
    max-width: 520px;
    box-shadow: 0 4px 22px #b2dfdb33;
    position: relative;
    font-family: 'Montserrat', Arial, sans-serif;
    color: #2a3a2a;
    font-size: 1em;
    line-height: 1.65;
}

.info-box h2 {
    font-family: 'Fredoka', Arial, sans-serif;
    font-size: 1.15em;
    color: #009688;
    margin: 0 0 0.5em;
    font-weight: 700;
}

.info-box ul {
    margin: 0 0 0.5em;
    padding-left: 1.3em;
}

.info-box li {
    margin-bottom: 0.25em;
}

.info-cta {
    margin: 0;
    color: #3a5a3a;
    font-style: italic;
    font-size: 0.93em;
}

.close-btn {
    position: absolute;
    top: 0.45em;
    right: 0.65em;
    background: none;
    border: none;
    font-size: 1.35em;
    color: #009688;
    cursor: pointer;
    font-weight: bold;
    transition: color 0.2s ease, transform 0.15s ease;
    line-height: 1;
    padding: 0.1em 0.2em;
}

.close-btn:hover {
    color: #d32f2f;
    transform: scale(1.2);
}

main {
    margin-top: 0.25em;
}

.footer {
    margin-top: 3.5em;
    padding: 1.2em 0 0.5em;
    text-align: center;
    font-size: 0.88em;
    color: #7a8a7a;
    font-family: 'Montserrat', Arial, sans-serif;
    border-top: 1px solid #e0f2f1;
}

.footer a {
    color: #009688;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s ease;
}

.footer a:hover {
    color: #d32f2f;
}

@media (max-width: 600px) {
    .app-wrapper {
        padding: 0 0.75rem 2.5rem;
    }
}

@media (max-width: 480px) {
    .app-wrapper {
        padding: 0 0.6rem 2rem;
    }

    .header {
        margin-top: 1em;
        margin-bottom: 0.5em;
    }

    .title {
        font-size: clamp(1.3em, 6vw, 1.7em);
    }

    .lang-btn {
        font-size: 1.15em;
        padding: 0.1em 0.15em;
    }

    .info-box {
        margin: 0.4em auto 0.75em;
        padding: 0.9em 1em 0.8em;
        font-size: 0.92em;
    }
}
</style>
