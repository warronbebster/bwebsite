<script>
  import { beforeUpdate } from "svelte";
  import Content from "./Content.svelte";

  // export const projectIndex = 0; //prop so that you can pass which project from App
  // export const storyIndex = 0; //prop so that you can pass which project from App
  export let storyContent = "<section>loading…</section"; //prop so that you can pass which project from App
  export let current = false;
  export let nextCover = false;
  // export let prevCover = false;
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
    }
  });
</script>

<style>
  .story {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    position: relative;
    overflow: hidden;
    border-radius: 4px;
  }
  @media screen and (max-width: 550px) {
    .story {
      border-radius: 0px;
    }
  }

  .none {
    display: none;
  }

  .prevCover {
    display: block !important;
    position: static;
    opacity: 1;
  }

  .minus1 {
    /* display: none; */
    position: absolute;
    /* z-index: -10; */
    top: -2000px;
    left: -1000px;
    /* opacity: 0; */
  }
  .currentStory {
    margin: 0;
    position: static;
    opacity: 1;
    /* order: 2; */
  }
  .plus1 {
    /* display: none; */
    position: absolute;
    /* z-index: -10; */
    top: -2000px;
    left: -1000px;
    /* opacity: 0; */
  }
  .nextCover {
    position: static;
    display: block !important;
    opacity: 1;
  }
</style>

<div class="story {displayPosition} ">
  {#if showStoryContent}
    <Content {storyContent} />
  {/if}
</div>
