<script>
  let veggies = [];
  
  let menu = [
    {
      id: 0,
      name: "Cauliflower florets",
      time: 7,
    },
    {
      id: 1,
      name: "Sliced carrots",
      time: 8,
    },
    {
      id: 2,
      name: "Broccoli florets",
      time: 5,
    },
    {
      id: 3,
      name: "Green beans",
      time: 3,
    },
    {
      id: 4,
      name: "Big potatoes",
      time: 45,
    },
    {
      id: 5,
      name: "Small potatoes",
      time: 20,
    },
    {
      id: 6,
      name: "Brussels sprouts",
      time: 9,
    },
  ];
  function Batch(veggies, cookTime, i) {
    this.veggies = veggies;
    this.cookTime = cookTime;
    this.heatTime = i*2;
  }

  function join(veggies) {
    if (veggies.length === 1) return veggies[0];
    return `${veggies.slice(0, -1).join(", ")} and ${
      veggies[veggies.length - 1]
    }`;
  }

  function order(veggies) {
    let cook = menu.filter((veggie) => veggies.includes(veggie.name));
    cook.sort((a, b) => parseFloat(b.time) - parseFloat(a.time));
    return cook;
  }

  function cookTime(veggies) {
    veggies = order(veggies);
    let groups = veggies.reduce(function(r, e, i) {
      if (i != 0) {
        ( veggies[i - 1].time - e.time < 2) ? r[r.length - 1].push(e) : r.push([e])
      } else {
        r.push([e])
      }
      if (i == veggies.length - 1) r = r.map(e => e.length == 1 ? e[0] : e)
      return r;
    }, [])
    
    let batches = groups.map( (group, i, a) => {
      let heatTime = ( i == 0 ) ? 0 : 1;
      if (!group.length)
        return new Batch([group.name], group.time, heatTime);
      else {
        let veggies = group.map(veggie => (veggie.name))
        let cookTime = (group.map(veggie => (veggie.time)).reduce((a,b) => a + b, 0)) / group.length
        return new Batch(veggies, cookTime, heatTime);
      }
    })

    batches[batches.length - 1].totalTime = batches[batches.length - 1].cookTime + batches[batches.length - 1].heatTime
    for (let i = batches.length - 2; i >= 0 ; i--) {
      batches[i].totalTime = (batches[i].cookTime - batches[i + 1].cookTime) + batches[i].heatTime
    }
    return batches;
  }
</script>

<h2>Select vegetables</h2>

{#each menu as veggie (veggie.id)}
  <label>
    <input type="checkbox" bind:group={veggies} value={veggie.name} />
    {veggie.name} ({veggie.time} min)
  </label>
{/each}

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

<h2>About</h2>

<p>
  Order is calculated as:

  <i>
    start with the longest cooking, try to group veggies to minimize opening the
    tap. Count time to re-heat after a tap opening and time to warm veggies.
    Suggest two batches if more time efficient.
  </i>
</p>
<ul>
  <li>start with the longest</li>
  <li>
    For the next (can be added at the same moment or require opening the tap):
    <ul>
      <li>
        Is time similar to the previous?
        <ul><li>Add at the same time</li></ul>
      </li>
      <li>
        Is time shorter than the previous?
        <ul>
          <li>
            New tap opening (add times to re-heat and veggie warming to all
            previous veggies)
          </li>
        </ul>
      </li>
    </ul>
  </li>
</ul>
