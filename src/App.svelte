<script lang="ts">
	import Input from './Input.svelte';
    import Output from './Output.svelte';
    import { options } from "./options.js";
    import type { Opts } from './types';
	let opts: Opts = {
        options: options,
        veggies: []
    };
</script>

<h1 class="title">Al-vapor</h1>
<h4>Elige los ingredientes y te dirá en que orden añadirlos para que todo esté en su punto al mismo tiempo:</h4>
<Output bind:opts={opts}/>
<Input bind:opts={opts}/>

<style>
    .title {
        margin: 0;
    }
    </style>