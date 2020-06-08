<script>
  import { beforeUpdate } from "svelte";
  import { currentPos, plus1, minus1, plus2, minus2 } from "./stores.js";
  import Content from "./Content.svelte";

  export let projectIndex = 0; //prop so that you can pass which project from App
  export let storyIndex = 0; //prop so that you can pass which project from App
  export let storyContent = "<section>loading…</section"; //prop so that you can pass which project from App
  export let projectName = "project name"; //prop to pass project name from App

  let displayPosition = "none";
  let showStoryContent = false;

  //there's probably a better way of doing this than just using afterUpdate...

  beforeUpdate(() => {
    //also this should happen not just on beforeUpdate

    // if (projectIndex == $plus2.project && storyIndex == $plus2.story) {
    //   displayPosition = "plus2";
    //   showStoryContent = true;
    // } else
    if (projectIndex == $plus1.project && storyIndex == $plus1.story) {
      displayPosition = "plus1";
      showStoryContent = true;
    } else if (
      projectIndex == $currentPos.project &&
      storyIndex == $currentPos.story
    ) {
      displayPosition = "currentProject";
      showStoryContent = true;
    } else if (projectIndex == $minus1.project && storyIndex == $minus1.story) {
      displayPosition = "minus1";
      showStoryContent = true;
    }
    // else if (projectIndex == $minus2.project && storyIndex == $minus2.story) {
    //   displayPosition = "minus2";
    //   showStoryContent = true;
    // }
    else {
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

    /* transition: 0.5s translate, 0.5s transform, 0.5s left, 0.5s right,
      0.5s opacity; */
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
    /* opacity: 0.5; */
    display: none;
    /* width: 0px; */
    /* margin: 0; */
    /* this could work to only show the current, previous, & next project; */
  }
  .minus2 {
    /* opacity: 0.7;
    position: fixed;
    top: 50%;
    left: -20vw;
    transform: translateY(-50%) scale(0.5); */
    /* above is if I want transitions */
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

    /* below is if I want transitions */
    /* position: fixed; */
    /* top: 50%; */
    /* left: 50%; */
    /* transform: translate(-50%, -50%); */
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
  .plus2 {
    /* opacity: 0.7;
    position: fixed;
    top: 50%;
    right: -20vw;
    transform: translateY(-50%) scale(0.5); */
    /* above is if I want transitions */
    display: none;
  }
</style>

<div class="story {displayPosition} ">
  <!-- probably a slot here for content tbh… videos, photos, text, etc -->
  {#if showStoryContent}
    <Content {projectIndex} {storyIndex} {storyContent} />
  {/if}
</div>
