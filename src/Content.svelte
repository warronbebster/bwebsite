<script>
  import { onMount } from "svelte";
  //   import { currentPos, nextPos, prevPos } from "./stores.js";

  // export let projectIndex = 0; //prop so that you can pass which project from App
  // export let storyIndex = 0; //prop so that you can pass which project from App
  export let storyContent = "<section>loading…</section>"; //prop so that you can pass which project from App

  let type = "image"; //prop to pass project name from App

  //there's probably a better way of doing this than just using afterUpdate...
</script>

<style>

</style>

<!-- <div class="photos"> -->
{@html storyContent}

<!-- probably a slot here for content tbh… videos, photos, text, etc -->

<!-- could component-ize this to only load photo content when the project is "active"... 
    it could be a bit flip—starts with the first 5 set to true, then as you tap through the ones coming next get set to true  -->
<!-- {#each photos as photo}
    <figure>
      <img src={photo.thumbnailUrl} alt={photo.title} />
      <figcaption>{photo.title}</figcaption>
    </figure>
  {:else}
    <p>loading...</p>
  {/each} -->
<!-- </div> -->
