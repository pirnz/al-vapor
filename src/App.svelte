<script>
  let veggies = [];
  let heatTime = 2;  
  let pantry = [
    {
      id: 0,
      icon: "💚",
      name: "Cauliflower florets",
      time: 7,
    },
    {
      id: 7,
      icon: "💚",
      name: "Green asparagus",
      time: 7,
    },
    {
      id: 1,
      icon: "🥕",
      name: "Sliced carrots",
      time: 15,
    },
    {
      id: 2,
      icon: "🥦",
      name: "Broccoli florets",
      time: 7,
    },
    {
      id: 3,
      icon: "💚",
      name: "Green beans",
      time: 10,
    },
    {
      id: 4,
      icon: "🥔",
      name: "Big potatoes",
      time: 40,
    },
    {
      id: 5,
      icon: "🥔",
      name: "Small potatoes",
      time: 20,
    },
    {
      id: 6,
      icon: "💚",
      name: "Brussels sprouts",
      time: 12,
    },
  ];

  function Batch(veggies, cookTime, isFirst) {
    this.veggies = veggies;
    this.cookTime = cookTime;
    this.heatTime = isFirst ? 0 : heatTime;
  }

  function join(veggies) {
    if (veggies.length === 1) return veggies[0];
    return `${veggies.slice(0, -1).join(", ")} and ${
      veggies[veggies.length - 1]
    }`;
  }

  function order(veggies) {
    let menu = pantry.filter((veggie) => veggies.includes(veggie.name));
    menu.sort((a, b) => parseFloat(b.time) - parseFloat(a.time));
    return menu;
  }

  function cookTime(veggies) {
    veggies = order(veggies);
    let groups = veggies.reduce(function(r, e, i) {
      if (i != 0) {
        ( veggies[i - 1].time - e.time < 3) ? r[r.length - 1].push(e) : r.push([e])
      } else {
        r.push([e])
      }
      if (i == veggies.length - 1) r = r.map(e => e.length == 1 ? e[0] : e)
      return r;
    }, [])
    
    let batches = groups.map( (group, i, a) => {
      let isFirst = ( i == 0 ) ? true : false;
      if (!group.length)
        return new Batch([group.name], group.time, isFirst);
      else {
        let veggies = group.map(veggie => (veggie.name))
        let cookTime = (group.map(veggie => (veggie.time)).reduce((a,b) => a + b, 0)) / group.length
        return new Batch(veggies, cookTime, isFirst);
      }
    })

    batches[batches.length - 1].totalTime = batches[batches.length - 1].cookTime + batches[batches.length - 1].heatTime
    for (let i = batches.length - 2; i >= 0 ; i--) {
      batches[i].totalTime = (batches[i].cookTime - batches[i + 1].cookTime) + batches[i].heatTime
    }
    return batches;
  }
</script>

<h1>💨 Steam calculator</h1>
<h2>Select vegetables</h2>

{#each pantry as veggie (veggie.id)}
  <label>
    <input type="checkbox" bind:group={veggies} value={veggie.name} />
    {veggie.icon} {veggie.name} ({veggie.time} min)
  </label>
{/each}

<br>
<a href="">Configuration</a>
<label>
	<input type=number bind:value={heatTime} min=0 max=8>
</label>

{#if veggies.length === 0}
  <p>Please select at least one veggie</p>
{:else}
<div>
  <p>Once the water is boiling:</p>
  <ul>
    {#each cookTime(veggies) as batch}
      <li>Add the {join(batch.veggies)} and leave for {batch.totalTime} minutes</li>
    {/each}
  </ul>
</div>
{/if}
