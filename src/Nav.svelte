<script>
  import { projectArray, currentPos } from "./stores.js";
  import { slide } from "svelte/transition";

  export let projectIndex = 0; //prop so that you can pass which project from App

  let navOpen = false;

  function setCurrentPos(projectToSet, storyToSet) {
    currentPos.set({ project: projectToSet, story: storyToSet });
  }
</script>

<style>
  nav {
    border: 1px solid black;
    position: absolute;
    top: 0px;
    background-color: white;
    left: 0px;
    z-index: 3;
  }
  .navItem {
    height: 20px;
    padding: 10px;
    margin: 0;
    font-size: 22px;
    background: rgba(164, 119, 255, 0.303);
    overflow: hidden;
    transition: height 0.4s, padding 0.4s;
  }
  .navItem:hover {
    cursor: pointer;
    background-color: rgb(127, 127, 244);
    transition: height 0.4s, padding 0.4s;
  }
  .activeNavItem {
    color: red;
  }
  .hidden {
    /* display: none; */
    height: 0px;
    padding: 0px;
  }
  .visible {
    color: blue;
  }
</style>

<svelte:options immutable={true} />
<nav
  on:mouseover={() => {
    if (window.innerWidth > 640) {
      navOpen = true;
    }
  }}
  on:mouseleave={() => {
    if (window.innerWidth > 640) {
      navOpen = false;
    }
  }}>
  <!-- probably a slot here for content tbh… videos, photos, text, etc -->
  <ol>

    {#each projectArray as project, i}
      {#if projectIndex == i}
        <li
          class="navItem activeNavItem"
          on:click={() => {
            currentPos.set({ project: i, story: 0 });
            navOpen = !navOpen;
            console.log(navOpen);
          }}>
          {project.name}
        </li>
      {:else}
        <li
          transition:slide
          class="navItem inactiveNavItem {navOpen ? 'visible' : 'hidden'}"
          on:click={() => {
            currentPos.set({ project: i, story: 0 });
            navOpen = false;
            console.log(navOpen);
          }}>
          {project.name}
        </li>
      {/if}
    {/each}

  </ol>

</nav>
