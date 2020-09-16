<script>
  import { projectArray } from "../stores.js";
  import { push } from "svelte-spa-router";

  export let projectIndex = 0; //prop so that you can pass which project from App

  export let navOpen = false;

  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher(); //way to dispatch events across components

  function showNav(openOrNot) {
    dispatch("message", {
      open: openOrNot
    });
  }
</script>

<style>
  nav {
    position: absolute;
    padding: 4px 0;
    min-height: 28px;
    color: white;
    top: 2px;
    left: 2px;
    border-radius: 4px;
    z-index: 9999;
  }
  .open {
    background-color: black;
    box-shadow: 0px 2px 8px -2px rgba(0, 0, 0, 0.5);
    -webkit-box-shadow: 0px 2px 8px -2px rgba(0, 0, 0, 0.5);
    -moz-box-shadow: 0px 2px 8px -2px rgba(0, 0, 0, 0.5);
  }
  .navItem {
    margin: 2px;
    padding: 8px;
    overflow: hidden;
    text-shadow: 0px 2px 6px rgba(0, 0, 0, 0.3);
    font-size: 14px;
  }
  .navItem:hover {
    cursor: pointer;
  }
  ol {
    padding: 0;
    margin: 0;
  }
  .hidden {
    height: 0px;
    margin: 0px;
    /* margin-bottom: 0px; */
    padding-top: 0px;
    padding-bottom: 0px;
  }
</style>

<svelte:options immutable={true} />
<nav
  on:mouseover={() => {
    if (window.innerWidth > 640) {
      showNav(true);
    }
  }}
  on:mouseleave={() => {
    if (window.innerWidth > 640) {
      showNav(false);
    }
  }}
  class={navOpen ? 'open' : 'closed'}>
  <ol>

    {#each projectArray as project, i}
      <li
        class=" navItem {projectIndex == i ? 'activeNavItem' : 'inactiveNavItem'}
        {navOpen ? 'visible' : projectIndex !== i ? 'hidden' : 'visible'}
        "
        on:click={() => {
          if (window.innerWidth < 640) {
            if (navOpen) dispatch('project', i);
            projectIndex == i ? showNav(!navOpen) : showNav(false);
          } else {
            dispatch('project', i);
          }
        }}>
        {project.name}
      </li>
    {/each}

  </ol>

</nav>
