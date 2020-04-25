<script>
  //   export let name;
  import Story from "./Story.svelte";
  import Nav from "./Nav.svelte";
  // import { getNext, getPrev } from "./orderFunctions.js";
  import {
    currentPos,
    projectArray,
    nextPos,
    prevPos,
    getNext,
    getPrev
  } from "./stores.js";

  console.log($currentPos);

  function handleProjects(direction) {
    if (direction == "next") {
      currentPos.set(getNext($currentPos));
    } else {
      currentPos.set(getPrev($currentPos));
    }
  }

  function handleKeydown(event) {
    if (event.keyCode == 39) {
      handleProjects("next");
    } else if (event.keyCode == 37) {
      handleProjects("prev");
    }
  }
</script>

<style>
  button {
    padding: 20px;
    position: absolute;
    bottom: 20px;
    background-color: rgb(255, 139, 212);
    font-size: 20px;
  }
  #nextButton {
    right: 20px;
  }
  #prevButton {
    left: 20px;
  }
</style>

<svelte:options immutable={true} />
<svelte:window on:keydown={handleKeydown} />

<main>
  <div class="buttons">
    <button
      id="prevButton"
      on:click={() => {
        handleProjects('prev');
      }}>
      prev project
    </button>
    <button
      id="nextButton"
      on:click={() => {
        handleProjects('next');
      }}>
      Next project
    </button>
  </div>

  <Nav projectIndex={$currentPos.project} />
  {#each projectArray as { name, type, stories }, i}
    <!-- here's where ui for the project lives  —title, swipe up/more, etc-->
    <!-- <p>{name}</p> -->
    {#each stories as story, j}
      <Story
        projectIndex={i}
        storyIndex={j}
        storyContent={story}
        projectName={name} />
    {/each}

    <!-- Swipe up bit here -->
  {/each}
</main>

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
