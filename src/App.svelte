<script lang="ts">
	import Input from './Input.svelte';
    import Output from './Output.svelte';
    import { options } from "./options.js";
    import type { Opts } from './types';
	let opts: Opts;
    opts.options = options;
    // let res;
    // function refresh(opts) {
    //     return JSON.stringify(opts);
    // }
	// //$: view = opts.veggies.length > 0 ? JSON.stringify(opts) : 'Choose your veggies';
    // $: res = refresh(opts)
</script>

<h1>Steam time calculator</h1>
<Input bind:opts={opts}/>
<Output bind:opts={opts}/>