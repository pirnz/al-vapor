<script lang="ts">
	import Input from './Input.svelte';
    import Output from './Output.svelte';
	let opts = {
        heatPower: 2,
        tolerance: 3,
        veggies: []
    };
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