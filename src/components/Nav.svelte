<script>
  import { projectArray } from "../stores.js";
  import { push } from "svelte-spa-router";

  export let projectIndex = 0; //prop so that you can pass which project from App

  export let navOpen = false;

  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  function showNav(openOrNot) {
    dispatch("message", {
      open: openOrNot
    });
  }
</script>

<style>
  nav {
    border: 1px solid black;
    position: absolute;
    padding: 0;
    margin: 0;
    min-height: 44px;
    top: 8px;
    left: 8px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0px 2px 8px -2px rgba(0, 0, 0, 0.5);
    -webkit-box-shadow: 0px 2px 8px -2px rgba(0, 0, 0, 0.5);
    -moz-box-shadow: 0px 2px 8px -2px rgba(0, 0, 0, 0.5);
    z-index: 9999;
  }
  .navItem {
    margin: 4px;
    padding: 8px;
    overflow: hidden;
    border-radius: 5px;
    transition: all 0.5s ease;
    font-size: 16px;
  }
  .navItem:hover {
    cursor: pointer;
    background-color: rgb(225, 206, 224);
    transition: all 0.4s ease;
  }
  ol {
    padding: 0;
    margin: 0;
  }
  /* .activeNavItem {
    color: red;
  } */
  .hidden {
    height: 0px;
    margin-top: 0px;
    margin-bottom: 0px;
    padding-top: 0px;
    padding-bottom: 0px;
    color: white;
    transition: all 0.5s ease;
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
  }}>
  <ol>

    {#each projectArray as project, i}
      <li
        class=" navItem {projectIndex == i ? 'activeNavItem' : 'inactiveNavItem'}
        {navOpen ? 'visible' : projectIndex !== i ? 'hidden' : 'visible'}
        "
        on:click={() => {
          if (window.innerWidth < 640) {
            if (navOpen) push('/' + i + '/0');
            projectIndex == i ? showNav(!navOpen) : showNav(false);
          } else {
            push('/' + i + '/0');
          }
        }}>
        {project.name}
      </li>
    {/each}

  </ol>

</nav>
