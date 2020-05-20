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
  console.log(minus2);

  //there's probably a better way of doing this than just using afterUpdate...

  beforeUpdate(() => {
    //also this should happen not just on beforeUpdate
    console.log(minus2);

    if (projectIndex == $plus2.project && storyIndex == $plus2.story) {
      displayPosition = "plus2";
      showStoryContent = true;
    } else if (projectIndex == $plus1.project && storyIndex == $plus1.story) {
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
    } else if (projectIndex == $minus2.project && storyIndex == $minus2.story) {
      displayPosition = "minus2";
      showStoryContent = true;
    } else {
      displayPosition = "none";
    }
  });
</script>

<style>
  :root {
    --width-border: 412px;
    --height-border: 830px;
  }
  .story {
    width: 100vw;
    height: calc(100vh - 20px);
    max-width: var(--width-border);
    max-height: var(--height-border);
    padding: 0;
    margin: 10px;
    position: relative;
    overflow: hidden;
    /* display: inline-block; */
    /* float: left; */
    vertical-align: top;
    /* animation-name: example; */
    /* animation-duration: 5s; */
    /* animation-fill-mode: forwards; */
    border-radius: 16px;

    transition: 0.5s translate, 0.5s transform, 0.5s left, 0.5s right,
      0.5s opacity;
  }
  @media screen and (max-width: 412px) {
    .story {
      border-radius: 0px;
      margin: 0;
      height: 100vh;
    }
  }
  /* @media screen and (max-height: 830px) {
    .story {
      border-radius: 0px;
      margin: 0;
    }
  } */
  .none {
    opacity: 0.5;
    display: none;
    width: 0px;
    margin: 0;
    /* this could work to only show the current, previous, & next project; */
  }
  .minus2 {
    opacity: 0;
    position: fixed;
    top: 50%;
    left: -10vw;
    transform: translateY(-50%) scale(0.7);
  }
  .minus1 {
    opacity: 0.2;
    position: fixed;
    top: 50%;
    left: calc(50vw - var(--width-border) * 1.5 - 20px);

    transform: translateY(-50%) scale(0.9);
  }
  .currentProject {
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    position: fixed;
    z-index: 5;
    margin: 0;

    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .plus1 {
    opacity: 0.5;

    position: fixed;
    top: 50%;
    right: calc(50vw - var(--width-border) * 1.5 - 20px);
    transform: translateY(-50%) scale(0.9);
  }
  .plus2 {
    opacity: 0;
    position: fixed;
    top: 50%;
    right: -10vw;
    transform: translateY(-50%) scale(0.5);
  }
</style>

<div class="story {displayPosition} ">
  <!-- probably a slot here for content tbh… videos, photos, text, etc -->
  {#if showStoryContent}
    <Content {projectIndex} {storyIndex} {storyContent} />
  {/if}
</div>
