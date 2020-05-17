<script>
  import { beforeUpdate } from "svelte";
  import { currentPos, nextPos, prevPos } from "./stores.js";
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

    if (projectIndex == $nextPos.project && storyIndex == $nextPos.story) {
      displayPosition = "nextProject";
      showStoryContent = true;
    } else if (
      projectIndex == $prevPos.project &&
      storyIndex == $prevPos.story
    ) {
      displayPosition = "prevProject";
      showStoryContent = true;
    } else if (
      projectIndex == $currentPos.project &&
      storyIndex == $currentPos.story
    ) {
      displayPosition = "currentProject";
      showStoryContent = true;
    } else {
      displayPosition = "none";
    }
  });
</script>

<style>
  .story {
    border: 1px solid red;
    width: 180px;
    height: 600px;
    position: relative;
    overflow: hidden;
    display: inline-block;
    vertical-align: top;
    animation-name: example;
    animation-duration: 5s;
    animation-fill-mode: forwards;
    transition: 0.5s width;
  }
  .none {
    opacity: 0.5;
  }
  .prevProject {
    color: red;
  }
  .currentProject {
    border: 5px solid black;
    width: 300px;
  }
  .nextProject {
    color: blue;
  }

  @keyframes example {
    from {
      background-color: yellow;
    }
    to {
      background-color: white;
    }
  }
</style>

<div class="story {displayPosition}">
  <!-- probably a slot here for content tbh… videos, photos, text, etc -->
  {#if showStoryContent}
    <Content {projectIndex} {storyIndex} {storyContent} />
  {/if}
</div>
