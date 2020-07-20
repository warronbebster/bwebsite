<script>
  // import { beforeUpdate } from "svelte";
  import Content from "./Content.svelte";

  export const projectIndex = 0; //prop so that you can pass which project from App
  export const storyIndex = 0; //prop so that you can pass which project from App
  export let storyContent = "<section>loading…</section"; //prop so that you can pass which project from App
  export let current = false;
  export let next = false;
  export let prev = false;

  let displayPosition = "none";
  let showStoryContent = false;

  // beforeUpdate(() => {
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
  // });
</script>

<style>
  :root {
    /* this is like css variables */
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

  .minus1 {
    display: none;
  }
  .currentProject {
    /* box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); */
    margin: 0;
  }
  .plus1 {
    display: none;
  }
</style>

<div class="story {displayPosition} ">
  {#if showStoryContent}
    <Content {storyContent} />
  {/if}
</div>
