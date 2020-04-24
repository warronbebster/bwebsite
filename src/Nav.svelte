<script>
  export let projectIndex = 0; //prop so that you can pass which project from App
  //   import { beforeUpdate } from "svelte";
  import { projectArray, currentPos } from "./stores.js";

  console.log(projectIndex);

  let navOpen = false;

  function setCurrentPos(projectToSet, storyToSet) {
    currentPos.set({ project: projectToSet, story: storyToSet });
  }
</script>

<style>
  .nav {
    border: 1px solid black;
    position: absolute;
    top: 0px;
    background-color: white;
    left: 0px;
    z-index: 3;
  }
  .hidden {
    display: none;
  }
  .visible {
    color: blue;
  }
</style>

<div
  on:mouseover={() => {
    navOpen = true;
  }}
  on:mouseleave={() => {
    navOpen = false;
  }}
  class="nav">
  <!-- probably a slot here for content tbh… videos, photos, text, etc -->
  {#each projectArray as project, i}
    {#if projectIndex == i}
      <h1
        class="navItem activeNavItem"
        on:click={() => {
          currentPos.set({ project: i, story: 0 });
          navOpen = !navOpen;
        }}>
        {project.name}
      </h1>
    {:else}
      <p
        class="navItem inactiveNavItem {navOpen ? 'visible' : 'hidden'}"
        on:click={() => {
          currentPos.set({ project: i, story: 0 });
          navOpen = false;
        }}>
        {project.name}
      </p>
    {/if}
  {/each}

</div>
