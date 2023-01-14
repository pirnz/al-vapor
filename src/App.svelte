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

<h1 class="title">Steam time calculator</h1>
<Input bind:opts={opts}/>
<Output bind:opts={opts}/>

<style>
    .title {
        margin: 0;
    }
    </style>