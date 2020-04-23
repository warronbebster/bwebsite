<script>
  import { onMount, beforeUpdate } from "svelte";
  import { currentPos, nextPos, prevPos } from "./stores.js";
  //   import { Story } from "./Story.svelte";

  export let projectIndex = 0; //prop so that you can pass which project from App
  export let storyIndex = 0; //prop so that you can pass which project from App
  export let storyContent = 0; //prop so that you can pass which project from App
  export let projectName = "project name"; //prop to pass project name from App

  let displayPosition = "none";
  let photos = [];

  //move this into a deeper level component that only mounts when this project is next/previous
  onMount(async () => {
    const res = await fetch(
      `https://jsonplaceholder.typicode.com/photos?_limit=6&albumId=` +
        (storyIndex + 1)
    );
    photos = await res.json();
  });

  //there's probably a better way of doing this than just using afterUpdate...

  beforeUpdate(() => {
    // if (projectIndex == $current) {
    //   displayPosition = "currentProject";
    // } else if (projectIndex == $current + 1) {
    //   displayPosition = "nextProject";
    // } else if (projectIndex == $current - 1) {
    //   displayPosition = "prevProject";
    // } else {
    //   displayPosition = "none";
    // }

    //write function here to return current story + 2 to the left or right
    //also this should happen not just on beforeUpdate

    if (projectIndex == $nextPos.project && storyIndex == $nextPos.story) {
      displayPosition = "nextProject";
    } else if (
      projectIndex == $prevPos.project &&
      storyIndex == $prevPos.story
    ) {
      displayPosition = "prevProject";
    } else if (
      projectIndex == $currentPos.project &&
      storyIndex == $currentPos.story
    ) {
      displayPosition = "currentProject";
    } else {
      displayPosition = "none";
    }
  });
</script>

<style>
  .photos {
    border: 1px solid red;
    width: 180px;
    height: 300px;
    overflow: hidden;
    display: inline-block;
    vertical-align: top;
    animation-name: example;
    animation-duration: 5s;
    animation-fill-mode: forwards;
    transition: 0.5s width;
  }
  img,
  figure {
    width: 100%;
    padding: 5px;
    margin: 0;
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

<div class="photos {displayPosition}">
  <!-- probably a slot here for content tbh… videos, photos, text, etc -->

  <p>{projectName}</p>

  <!-- could component-ize this to only load photo content when the project is "active"... 
    it could be a bit flip—starts with the first 5 set to true, then as you tap through the ones coming next get set to true  -->
  {#each photos as photo}
    <figure>
      <img src={photo.thumbnailUrl} alt={photo.title} />
      <figcaption>{photo.title}</figcaption>
    </figure>
  {:else}
    <p>loading...</p>
  {/each}
</div>
