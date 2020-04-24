<script>
  import { onMount } from "svelte";
  //   import { currentPos, nextPos, prevPos } from "./stores.js";

  export let projectIndex = 0; //prop so that you can pass which project from App
  export let storyIndex = 0; //prop so that you can pass which project from App
  export let storyContent = 0; //prop so that you can pass which project from App

  let type = "image"; //prop to pass project name from App

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
</script>

<style>
  .photos {
    border: 1px solid rgb(128, 255, 128);
    /* width: 180px; */
    height: 500px;
    overflow: scroll;
  }
  img,
  figure {
    width: 100%;
    padding: 5px;
    margin: 0;
  }
</style>

<div class="photos">
  <!-- probably a slot here for content tbh… videos, photos, text, etc -->

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
