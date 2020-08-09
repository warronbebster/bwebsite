<script>
  import { beforeUpdate } from "svelte";
  import Content from "./Content.svelte";

  // export const projectIndex = 0; //prop so that you can pass which project from App
  // export const storyIndex = 0; //prop so that you can pass which project from App
  export let storyContent = "<section>loading…</section"; //prop so that you can pass which project from App
  export let current = false;
  export let nextCover = false;
  export let prevCover = false;
  export let next = false;
  export let prev = false;

  let displayPosition = "none";
  let showStoryContent = false;

  beforeUpdate(() => {
    if (next) {
      displayPosition = "plus1";
      showStoryContent = true;
    } else if (current) {
      displayPosition = "currentProject";
      showStoryContent = true;
    } else if (prev) {
      displayPosition = "minus1";
      showStoryContent = true;
    } else {
      displayPosition = "none";
    }

    if (nextCover) {
      showStoryContent = true;
      displayPosition += " nextCover";
    } else if (prevCover) {
      showStoryContent = true;
      displayPosition += " prevCover";
    }
  });
</script>

<style>
  :root {
    /* this is like css variables */
    --width-border: 460px;
    /* --height-border: 840px; */
  }
  .story {
    width: 100vw;
    /* display: inline-block; */
    height: calc(100vh - 30px);
    max-width: var(--width-border);
    max-height: var(--height-border);
    padding: 0;
    margin: 0;
    position: relative;
    overflow: hidden;
    border-radius: 4px;
    transition: 0.3s max-height ease, 0.3s max-width ease, 0.3s height ease,
      0.3s width ease, 0.3s border-radius ease;
  }
  @media screen and (max-width: 550px) {
    .story {
      border-radius: 0px;
      margin: 0;
      height: 100vh;
      max-height: 100vh;
      max-width: 100vw;
    }
    .currentProject {
      top: 0;
      transform: none;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }

  .none {
    display: none;
  }

  .prevCover {
    display: block !important;
    transform: rotateY(-90deg);
    transform-origin: center right;
    position: absolute;
    top: 0;
    right: 100%;
    z-index: -1;
  }

  .minus1 {
    /* transform: rotateY(-90deg);
    transform-origin: center right;
    position: absolute;
    top: 0;
    right: 100%;
    z-index: -1; */
    display: none;
  }
  .currentProject {
    margin: 0;
    /* order: 2; */
  }
  .plus1 {
    /* transform: rotateY(90deg);
    transform-origin: center left;
    position: absolute;
    top: 0;
    left: 100%;
    z-index: -1; */
    display: none;
  }
  .nextCover {
    display: block !important;
    transform: rotateY(90deg);
    transform-origin: center left;
    position: absolute;
    top: 0;
    left: 100%;
    z-index: -1;
  }
</style>

<div class="story {displayPosition} ">
  {#if showStoryContent}
    <Content {storyContent} />
  {/if}
</div>
