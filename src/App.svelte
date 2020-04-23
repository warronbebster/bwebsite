<script>
  //   export let name;
  import Project from "./Project.svelte";
  import { getNext, getPrev } from "./orderFunctions.js";
  import { currentPos, projectList, nextPos, prevPos } from "./stores.js";

  console.log($currentPos);
  // $: prevPos = getPrev($currentPos);
  // $: nextPos = getNext($currentPos);

  function handleProjects(direction) {
    // console.log(getNext($currentPos)); //something about logging it changes the state
    if (direction == "next") {
      //if it's "previous"
      
      const nextStory = getNext($currentPos); //get next position
      currentPos.update(pos => {
        pos = nextStory;
        return pos;
      });

    } else {
      //if it's "previous"
      const prevStory = getPrev($currentPos); //get next position
      currentPos.update(pos => {
        pos = prevStory;
        return pos;
      })
      ;
    }

    // const nextie = $currentPos;
    // nextPos.update(nextPosie =>{
    //   nextPosie = getNext(nextie)
    //   return nextPosie;
    // });

    // const previe = $currentPos
    // prevPos.update(prevPosie =>{
    //   prevPosie = getPrev($currentPos)
    //   return prevPosie;
    // });

    // console.log($prevPos);
    // console.log(getNext($currentPos));
    // const what = $currentPos;
    // console.log(getNext(what));
    
    // console.log($nextPos);
  }

  function handleKeydown(event) {
    if (event.keyCode == 39) {
      //right key
      handleProjects("next");
    } else if (event.keyCode == 37) {
      //left key
      handleProjects("prev");
    }
    console.log($currentPos);
  }
</script>

<style>
  main {
    text-align: center;
    max-width: 240px;
    margin: 0 auto;
    overflow-y: scroll;
  }
</style>

<svelte:options immutable={true} />
<svelte:window on:keydown={handleKeydown} />

<main>
  <h2>{$currentPos.project} {$currentPos.story}</h2>
  <button
    on:click={() => {
      handleProjects('prev');
    }}>
    prev project
  </button>
  <button
    on:click={() => {
      handleProjects('next');
    }}>
    Next project
  </button>
  <button
    on:click={() => {
      <!-- console.log($prevPos); -->
      console.log($currentPos);
      <!-- console.log($nextPos); -->
    }}>
    loggy time
  </button>
</main>

<!-- component here for nav? that could be where the "project title" sits? -->

<!-- loop through all projects here; leave the 'onMount' to something in each project? -->
<!-- also... this is where i could only loop through the like projects around the current index... 
	don't necesarily have to loop through all projects... -->

<!-- could be some function here to make an array of just the stories in scope... -->
{#each $projectList as { name, type, stories }, i}
  {#each stories as story, j}
    <Project
      projectIndex={i}
      storyIndex={j}
      storyContent={story}
      projectName={name} />
  {/each}
{/each}

<!-- extracontent goes down here -->

<!-- 
{:if}
{:else}
{/if} -->

<!-- event listeners: -->
<!-- <div on:mousemove = {handleMousemove}> </div> -->
<!-- u can also run functions inline: -->
<!-- <div on:mousemove={e => m = {x: e.clientX, y: e.clientY}}> -->
<!-- also there are modifiers -->
<!-- <button on:click|once={handleClick}></button> -->

<!-- loops:
{:each cats as cat, i} (i is optional if you want to use index)
{:/each } -->

<!-- 
{#each things as thing (thing.id)} (id if you want to like… only check the one thing?)
{/each} -->

<!-- <Component {...props}/> -->
<!-- passing an object of props -->

<!-- <Component on:message/> -->
<!-- forwarding events ("message", here) up the component stack -->

<!-- <input bind:value={name}> -->
<!-- binding variables so data can flow up from components (and down? at the same time? wat) -->

<!-- 
{#await promise}
	<p>{promise}</p>
{:then number}
	<p>the numnber is {number}</p>
{/await} -->

<!-- onMount in <script> for only loading images when the component mounts  -->

<!-- onMount(async () => {
	const res = await fetch(`https://jsonplaceholder.typicode.com/photos?_limit=20`);
	photos = await res.json();
}) -->

<!-- transitions! -->
<!-- <p transition:fade on:introstart="{() => status = 'intro started'}"></p> -->

<!-- Classes = this listens to if "big" is truthy -->
<!-- <div class:big></div> -->

<!-- Slots : this allows components to accept info from their parents -->
<!-- <div class="box">
	<slot>
		<p>default content if nothing is put in the slot</p>
	</slot>
</div> -->

<!-- So you can do things like this:  -->
<!-- <Box>
	<h2>Hello!</h2>
	<p>This is a box. It can contain anything.</p>
</Box> -->

<!-- This allows you to switch between different components without a bunch of "ifs" -->
<!-- <svelte:component this={selected.component}/> -->

<!-- window event listeners (useful for stories) -->
<!-- <svelte:window on:keydown={handleKeydown}/> -->

<!-- Module context… sharing variables across all instances of a module? -->
<!-- <script context="module">
	let current; //basically… this is a shared variable between all of those types of modules?
</script> -->

<!-- pause execution to debug -->
<!-- {@debug [value to inspect]} -->
