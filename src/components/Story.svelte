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
      displayPosition = "currentStory";
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
  .story {
    width: 100%;
    /* display: inline-block; */
    height: 100%;
    /* max-width: var(--width-border); */
    /* max-height: var(--height-border); */
    padding: 0;
    margin: 0;
    position: relative;
    overflow: hidden;
  }
  @media screen and (max-width: 550px) {
    /* .story {
      height: 100vh;
      max-height: 100vh;
      max-width: 100vw;
    } */
    /* .currentStory {
      top: 0;
      transform: none;
      left: 0;
      right: 0;
      bottom: 0;
    } */
  }

  .none {
    display: none;
  }

  .prevCover {
    display: block !important;
    /* transform: rotateY(-90deg);
    transform-origin: center right;
    position: absolute;
    top: 0;
    right: 100%;
    z-index: -1; */
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
  .currentStory {
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
    /* transform: rotateY(90deg);
    transform-origin: center left;
    position: absolute;
    top: 0;
    left: 100%;
    z-index: -1; */
  }
</style>

<div class="story {displayPosition} ">
  {#if showStoryContent}
    <Content {storyContent} />
  {/if}
</div>
