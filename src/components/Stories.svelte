<script>
  import Story from "./Story.svelte";
  import { onMount } from "svelte";
  import Nav from "./Nav.svelte";
  import { projectArray, getNext, getPrev } from "../stores.js";
  import { gestures } from "@composi/gestures";
  import { push } from "svelte-spa-router";

  gestures(); //figure this shit out at some point lol

  export let params = { project: 0, story: 0 };
  $: next = getNext(params);
  $: prev = getPrev(params);

  // let touch = false;//whether the gestures
  let gesture_start = { pageX: 0, pageY: 0 };
  let gesture_active = { pageX: 0, pageY: 0 };
  let gesture_gap = { pageX: 0, pageY: 0 }; //why can't i make this a reactive svelte thingy

  let held = false;
  let swipeDirection = "right";
  let swipeSensitivity = Math.min(screen.width / 3, 300);
  window.onresize = () => {
    swipeSensitivity = Math.min(screen.width / 3, 300);
  };

  let timedout = true; //whether a gesture has timed out
  let gesturetimer; //timer object to time that

  let navOpen = false;
  function handleNav(event) {
    navOpen = event.detail.open;
  }

  function handleProjects(direction) {
    if (direction == "next") {
      push("/" + next.project + "/" + next.story);
    } else {
      push("/" + prev.project + "/" + prev.story);
    }
  }

  function gestureDown(e) {
    //when a gesture starts
    navOpen = false;
    if (e.type == "touchstart") {
      //if it'a a touch event
      gesture_start.pageX = Math.round(e.changedTouches[0].pageX); //where the event starts
      gesture_start.pageY = Math.round(e.changedTouches[0].pageY);
    } else {
      //if it's a mouse
      gesture_start.pageX = e.pageX;
      gesture_start.pageY = e.pageY;
    }
    gesture_active.pageX = gesture_start.pageX;
    gesture_active.pageY = gesture_start.pageY;
    held = true; //start holding gesture
    timedout = false; //reset timedout, hasn't timed out yet
    gesturetimer = setTimeout(() => {
      //start timer
      timedout = true;
    }, 400);
  }

  function gestureMove(e) {
    //when ya movin
    if (e.type == "touchmove") {
      //if it'a a touch event
      gesture_active.pageX = Math.round(e.changedTouches[0].pageX);
      gesture_active.pageY = Math.round(e.changedTouches[0].pageY);
    } else {
      //if it's a mouse
      gesture_active.pageX = e.pageX;
      gesture_active.pageY = e.pageY;
    }

    gesture_gap = {
      //set the gap between start and where you've dragged
      pageX: gesture_active.pageX - gesture_start.pageX,
      pageY: gesture_active.pageY - gesture_start.pageY
    };
    gesture_gap.pageX > 0
      ? (swipeDirection = "left")
      : (swipeDirection = "right");
  }

  function gestureUp(e, direction) {
    held = false; //end holding gesture
    if (!timedout) {
      //if the gesture hasn't timed out
      if (gesture_active.pageX > gesture_start.pageX + swipeSensitivity) {
        //LEFT SWIPEY
        // swipeDirection = "left";

        parseInt(params.project) > 0 // if current project ain't first
          ? push("/" + (parseInt(params.project) - 1) + "/0") //next project
          : push("/" + (projectArray.length - 1) + "/0"); //last project
      } else if (
        gesture_active.pageX <
        gesture_start.pageX - swipeSensitivity
      ) {
        //RIGHT SWIPEY
        // swipeDirection = "right";
        parseInt(params.project) <= projectArray.length // if current project ain't last
          ? push("/" + (parseInt(params.project) + 1) + "/0") //next project
          : push("/0/0"); //first project
      } else {
        //JUST GO NEXT OR PREV
        handleProjects(direction);
      }
    }
    //reset timer
    clearTimeout(gesturetimer);
    //reset gesture tracking
    gesture_start = { pageX: 0, pageY: 0 };
    gesture_active = { pageX: 0, pageY: 0 };
    gesture_gap = { pageX: 0, pageY: 0 };
  }
  function handleKeydown(event) {
    if (event.keyCode == 39) {
      handleProjects("next");
    } else if (event.keyCode == 37) {
      handleProjects("prev");
    }
  }
</script>

<style>
  main {
    justify-content: center;
    display: flex;
  }
  button {
    position: absolute;
    top: -20px;
    bottom: -20px;
    /* height: 100%; */
    z-index: 2;
    opacity: 0.3;
    width: 50vw;
    /* outline: none; */
  }
  #nextButton {
    background-color: rgb(255, 139, 212);
    right: calc(-50vw + 50%);

    cursor: e-resize;
  }
  #prevButton {
    background-color: rgb(139, 255, 211);
    left: calc(-50vw + 50%);
    cursor: w-resize;
  }
</style>

<svelte:window on:keydown={handleKeydown} />
<svelte:options immutable={true} />

<Nav projectIndex={parseInt(params.project)} {navOpen} on:message={handleNav} />
<div
  style=" width: 100vw; height: 100vh; display: flex; justify-content: center;
  align-items: center; perspective: 360px;">
  <main
    style="position: relative; left: {held ? gesture_gap.pageX / 1.2 : 0}px;
    transition: left {held ? 0 : 0.2}s ease;">
    <!-- overflow: hidden; -->

    <button
      id="prevButton"
      on:touchstart|preventDefault={e => gestureDown(e)}
      on:mousedown|preventDefault={e => gestureDown(e)}
      on:touchmove|preventDefault={e => {
        if (held) gestureMove(e);
      }}
      on:mousemove|preventDefault={e => {
        if (held) gestureMove(e);
      }}
      on:touchend|preventDefault={e => gestureUp(e, 'prev')}
      on:mouseup={e => gestureUp(e, 'prev')} />
    <button
      id="nextButton"
      on:touchstart|preventDefault={e => gestureDown(e)}
      on:mousedown|preventDefault={e => gestureDown(e)}
      on:touchmove|preventDefault={e => {
        if (held) gestureMove(e);
      }}
      on:mousemove|preventDefault={e => {
        if (held) gestureMove(e);
      }}
      on:touchend|preventDefault={e => gestureUp(e, 'next')}
      on:mouseup={e => gestureUp(e, 'next')} />
    <div
      style="backface-visibility: hidden;transform: {held ? 'rotateY(' + Math.max(Math.min(gesture_gap.pageX / 10, 45), -45) + 'deg)' : 'none'};
      transform-origin: center {swipeDirection == 'right' ? 'right' : 'left'};
      transition: transform {held ? 0 : 0.2}s ease;">
      <!--       transform-style: preserve-3d; 
       -->
      {#each projectArray as { name, stories }, i}
        {#each stories as story, j}
          {#if params.project == i && params.story == j}
            <Story storyContent={story} current={true} />
          {:else if next.project == i && next.story == j}
            <Story storyContent={story} next={true} />
          {:else if prev.project == i && prev.story == j}
            <Story storyContent={story} prev={true} />
          {:else}
            <Story storyContent={story} />
          {/if}
        {/each}
      {/each}
    </div>
  </main>
</div>
