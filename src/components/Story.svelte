<script>
  import { beforeUpdate } from "svelte";
  import Content from "./Content.svelte";
  import { getNext, getPrev } from "../stores.js";

  export let params = { project: 0, story: 0 };
  export let projectIndex = 0; //prop so that you can pass which project from App
  export let storyIndex = 0; //prop so that you can pass which project from App
  export let storyContent = "<section>loading…</section"; //prop so that you can pass which project from App
  // export const projectName = "project name"; //prop to pass project name from App

  let displayPosition = "none";
  let showStoryContent = false;

  let plus1 = getNext(params);
  let minus1 = getPrev(params);

  //there's probably a better way of doing this than just using afterUpdate...

  beforeUpdate(() => {
    //also this should happen not just on beforeUpdate
    plus1 = getNext(params);
    minus1 = getPrev(params);

    if (projectIndex == plus1.project && storyIndex == plus1.story) {
      displayPosition = "plus1";
      showStoryContent = true;
    } else if (
      projectIndex == parseInt(params.project) &&
      storyIndex == parseInt(params.story)
    ) {
      displayPosition = "currentProject";
      showStoryContent = true;
    } else if (projectIndex == minus1.project && storyIndex == minus1.story) {
      displayPosition = "minus1";
      showStoryContent = true;
    } else {
      displayPosition = "none";
    }
  });
</script>

<style>
  :root {
    --width-border: 460px;
    /* --height-border: 840px; */
  }
  .story {
    width: 100vw;
    height: calc(100vh - 30px);
    max-width: var(--width-border);
    max-height: var(--height-border);
    padding: 0;
    margin: 10px;
    position: relative;
    overflow: hidden;
    border-radius: 12px;
  }
  @media screen and (max-width: 550px) {
    .story {
      border-radius: 0px;
      margin: 0;
      height: 100vh;
      max-height: 100vh;
      max-width: 100vw;
      transition: none;
    }
    .currentProject {
      top: 0;
      transform: none;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
  /* @media screen and (max-height: 830px) {
    .story {
      border-radius: 0px;
      margin: 0;
    }
  } */
  .none {
    display: none;
  }

  .minus1 {
    /* opacity: 0.2;
    position: fixed;
    top: 50%;
    left: calc(50vw - var(--width-border) * 1.5 - 20px);
    transform: translateY(-50%) scale(0.9); */
    /* above is if I want transitions */

    display: none;
  }
  .currentProject {
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    margin: 0;
  }
  .plus1 {
    /* opacity: 0.5;
    position: fixed;
    top: 50%;
    right: calc(50vw - var(--width-border) * 1.5 - 20px);
    transform: translateY(-50%) scale(0.9); */
    /* above is if I want transitions */
    display: none;
  }
</style>

<div class="story {displayPosition} ">
  {#if showStoryContent}
    <Content {storyContent} />
  {/if}
</div>
