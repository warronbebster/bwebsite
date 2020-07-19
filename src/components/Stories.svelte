<script>
  import Story from "./Story.svelte";
  import Nav from "./Nav.svelte";
  import { projectArray, getNext, getPrev } from "../stores.js";
  export let params = { project: 0, story: 0 };
  $: next = getNext(params);
  $: prev = getPrev(params);

  import { push } from "svelte-spa-router";

  function handleProjects(direction) {
    if (direction == "next") {
      push("/" + getNext(params).project + "/" + getNext(params).story);
    } else {
      push("/" + getPrev(params).project + "/" + getPrev(params).story);
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
  main {
    align-items: center;
    justify-content: center;
    flex-wrap: nowrap;
    display: flex;
  }
  button {
    position: absolute;
    top: 0px;
    background-color: rgb(255, 139, 212);
    font-size: 20px;
    z-index: 20;
    opacity: 0;
    outline: none;
  }
  #nextButton {
    right: 0px;
    width: 50vw;
    height: 100vh;
    cursor: e-resize;
  }
  #prevButton {
    left: 0px;
    width: 50vw;
    height: 100vh;
    cursor: w-resize;
  }
</style>

<svelte:window on:keydown={handleKeydown} />
<svelte:options immutable={true} />

<div class="buttons">
  <button
    id="prevButton"
    on:mouseup={() => {
      handleProjects('prev');
    }}>
    prev project
  </button>
  <button
    id="nextButton"
    on:mouseup={() => {
      handleProjects('next');
    }}>
    Next project
  </button>
</div>

<Nav projectIndex={parseInt(params.project)} />

<main>
  {#each projectArray as { name, stories }, i}
    {#each stories as story, j}
      {#if params.project == i && params.story == j}
        <Story
          projectIndex={i}
          storyIndex={j}
          storyContent={story}
          current={true} />
      {:else if next.project == i && next.story == j}
        <Story
          projectIndex={i}
          storyIndex={j}
          storyContent={story}
          next={true} />
      {:else if prev.project == i && prev.story == j}
        <Story
          projectIndex={i}
          storyIndex={j}
          storyContent={story}
          prev={true} />
      {:else}
        <Story projectIndex={i} storyIndex={j} storyContent={story} />
      {/if}
    {/each}
  {/each}
</main>

<!-- might be better to do the "current, plus1, minus1" calculations here -->
