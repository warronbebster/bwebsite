<script>
  import { beforeUpdate } from "svelte";

  export let storyContent = "<section>loading…</section"; //prop so that you can pass which project from App
  export let current = false;
  export let nextCover = false;
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
    /* opacity: 1; */
    /* visibility: visible; */
  }

  .minus1 {
    position: absolute;
    top: -2000px;
    left: -1000px;
    /* opacity: 0; */
    /* visibility: hidden; */
  }
  .currentStory {
    margin: 0;
    position: static;
    /* opacity: 1; */
    /* visibility: visible; */
  }
  .plus1 {
    position: absolute;
    top: -2000px;
    left: -1000px;
    /* opacity: 0; */
    /* visibility: hidden; */
  }
  .nextCover {
    position: static;
    display: block !important;
    /* opacity: 1; */
    /* visibility: visible; */
  }
</style>

<div class="story {displayPosition} ">
  {#if showStoryContent}
    {@html storyContent}
  {:else}
    <section>loading…</section>
  {/if}
</div>
