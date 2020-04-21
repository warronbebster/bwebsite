<script>
  import { onMount, beforeUpdate } from "svelte";
  import { currentArray, projectList } from "./stores.js";

  export let projectIndex = 0; //prop so that you can pass which project from App
  // export let projectName = "project name"; //prop to pass project name from App
  // export let extraContent = false; //prop to pass from app

  let displayPosition = "none";
  let photos = [];

  onMount(async () => {
    const res = await fetch(
      `https://jsonplaceholder.typicode.com/photos?_limit=10&albumId=` +
        (projectIndex + 1)
    );
    photos = await res.json();
  });

  //there's probably a better way of doing this than just using afterUpdate...
  beforeUpdate(() => {
    if (projectIndex == $currentArray.story) {
      displayPosition = "currentStory";
    } else if (projectIndex == $currentArray.story + 1) {
      displayPosition = "nextStory";
    } else if (projectIndex == $currentArray.story - 1) {
      displayPosition = "prevStory";
    } else {
      displayPosition = "none";
    }
  });
</script>

<style>
  .photos {
    border: 1px solid purple;
    width: 180px;
    display: inline-block;
    vertical-align: top;
    animation-name: example;
    animation-duration: 5s;
    animation-fill-mode: forwards;
    transition: 0.5s width;
  }
  img {
    width: 90%;
  }
  .none {
    opacity: 0.5;
  }
  .prevStory {
    color: red;
  }
  .currentStory {
    border: 5px solid black;
    width: 300px;
  }
  .nextStory {
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

<!-- <svelte:options immutable={true} /> -->
<div class="photos {displayPosition}">
  <!-- probably a slot here for content tbh… videos, photos, text, etc -->

  {#each photos as photo}
    <figure>
      <img src={photo.thumbnailUrl} alt={photo.title} />
      <figcaption>{photo.title}</figcaption>
    </figure>
  {:else}
    <!-- this block renders when photos.length === 0 -->
    <p>loading...</p>
  {/each}
</div>
