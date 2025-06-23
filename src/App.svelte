<script lang="ts">
	import Input from './Input.svelte';
    import Output from './Output.svelte';
    import { options } from "./options.js";
    import type { Opts } from './types';
    import { onMount } from 'svelte';
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
</script>

<div class="header">
    <span class="logo" aria-label="logo">💨</span>
    <h1 class="title" on:click={openInfo} style="cursor:pointer" title="Haz clic para ver la información de nuevo">Calculadora al-vapor</h1>
</div>
{#if showInfo}
    <div class="info-box">
        <button class="close-btn" on:click={closeInfo} aria-label="Cerrar">×</button>
        <h2>¿Qué hace esta app?</h2>
        <ul>
            <li><b>Calcula el tiempo de cocción al vapor</b> de cualquier ingrediente.</li>
            <li><b>Te dice en qué orden añadir varios ingredientes</b> para que todo esté en su punto al final.</li>
        </ul>
        <p>¡Elige los ingredientes y ve el orden óptimo para cocinarlos juntos!</p>
    </div>
{/if}
<Output bind:opts={opts}/>
<Input bind:opts={opts}/>

<footer class="footer">
    <span>© 2024 &middot; Made by <a href="https://laro.dev" target="_blank" rel="noopener">🌊 laro.dev</a></span>
</footer>

<style>
@import url('/fonts.css');

.header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
}
.logo {
    font-size: 2.5em;
    margin-right: 0.1em;
    filter: drop-shadow(0 2px 4px #bbb);
}
.title {
    font-family: 'Fredoka', Arial, sans-serif;
    font-size: 2.3em;
    margin: 0;
    letter-spacing: 1px;
    color: #2a3a2a;
    text-shadow: 0 2px 8px #e0f7fa;
}
.info-box {
    background: #f7fff9;
    border: 2px solid #b2dfdb;
    border-radius: 14px;
    padding: 1.2em 1.5em 1.2em 1.5em;
    margin: 1.5em auto 1.5em auto;
    max-width: 480px;
    box-shadow: 0 2px 16px #b2dfdb44;
    position: relative;
    font-family: 'Montserrat', Arial, sans-serif;
    color: #2a3a2a;
    font-size: 1.08em;
    line-height: 1.5;
}
.close-btn {
    position: absolute;
    top: 0.5em;
    right: 0.7em;
    background: none;
    border: none;
    font-size: 1.3em;
    color: #009688;
    cursor: pointer;
    font-weight: bold;
    transition: color 0.2s;
}
.close-btn:hover {
    color: #d32f2f;
}
h4 {
    font-family: 'Montserrat', Arial, sans-serif;
    font-weight: 600;
    color: #009688;
    margin-top: 0.5em;
    margin-bottom: 1.2em;
    text-align: center;
}
.footer {
    margin-top: 2.5em;
    padding: 1.2em 0 1.2em 0;
    text-align: center;
    font-size: 1em;
    color: #7a8a7a;
    font-family: 'Montserrat', Arial, sans-serif;
    background: none;
}
.footer a {
    color: #009688;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;
}
.footer a:hover {
    color: #d32f2f;
}
</style>