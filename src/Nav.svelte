<script>
  import { projectArray, currentPos } from "./stores.js";

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
    z-index: 999;
  }
  .navItem {
    margin: 0;
    height: 40px;
    padding: 10px;
    background: rgba(164, 119, 255, 0.303);
    overflow: hidden;
    transition: height 0.4s, padding 0.4s;
  }
  .navItem:hover {
    cursor: pointer;
    background-color: rgb(127, 127, 244);
    transition: height 0.4s, padding 0.4s;
  }
  ol {
    /* padding-inline-start: 20px; */
    padding: 0;
    margin: 0;
  }
  .activeNavItem {
    color: purple;
  }
  .hidden {
    height: 0px;
    padding-top: 0px;
    padding-bottom: 0px;
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
      <li
        class=" navItem {projectIndex == i ? 'activeNavItem' : 'inactiveNavItem'}
        {navOpen ? 'visible' : projectIndex !== i ? 'hidden' : 'visible'}
        "
        on:click={() => {
          currentPos.set({ project: i, story: 0 });
          if (window.innerWidth < 640) {
            projectIndex == i ? (navOpen = !navOpen) : (navOpen = false);
            console.log(navOpen);
          }
        }}>
        {project.name}
      </li>
    {/each}

  </ol>

</nav>
