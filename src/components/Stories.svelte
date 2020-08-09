<script>
  import Story from "./Story.svelte";
  import { onMount, afterUpdate } from "svelte";
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

  const Timer = function(callback, delay) {
    var timerId,
      start,
      remaining = delay;

    this.pause = function() {
      window.clearTimeout(timerId);
      remaining -= Date.now() - start;
      console.log("timer paused");
    };

    this.clear = function() {
      window.clearTimeout(timerId);
      console.log("timer cleared");
    };

    this.resume = function() {
      start = Date.now();
      window.clearTimeout(timerId);
      timerId = window.setTimeout(callback, remaining);
      console.log("timer resumed");
    };

    this.resume();
  };

  let timedout = true; //whether a gesture has timed out
  let gesturetimer; //timer object to time that

  let storyTimer; //timer object to time stories
  const storyTimerTime = 50000;

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
    storyTimer.clear();
    storyTimer = new Timer(function() {
      handleProjects("next");
    }, storyTimerTime);
  }

  function gestureDown(e) {
    //when a gesture starts

    storyTimer.pause(); //pause story timer

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
      //start gesture timer
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
        storyTimer.clear();
        storyTimer = new Timer(function() {
          handleProjects("next");
        }, storyTimerTime);
      } else if (
        gesture_active.pageX <
        gesture_start.pageX - swipeSensitivity
      ) {
        //RIGHT SWIPEY
        // swipeDirection = "right";
        parseInt(params.project) <= projectArray.length // if current project ain't last
          ? push("/" + (parseInt(params.project) + 1) + "/0") //next project
          : push("/0/0"); //first project
        storyTimer.clear();
        storyTimer = new Timer(function() {
          handleProjects("next");
        }, storyTimerTime);
      } else {
        //JUST GO NEXT OR PREV

        //if location is more than halfway to right= next, else prev
        // gesture_active.pageX > window.innerWidth / 2
        //   ? handleProjects("next")
        //   : handleProjects("prev");
        handleProjects(direction);
      }
    } else {
      //if gesture has timed out
      storyTimer.resume();
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

  onMount(() => {
    //when first mounts; basically on page load
    console.log("onMount");
    storyTimer = new Timer(function() {
      handleProjects("next");
    }, storyTimerTime);
  });
</script>

<style>
  main {
    justify-content: center;
    display: flex;
  }
  .grabbing {
    cursor: grabbing !important;
  }
  button {
    position: absolute;
    top: -20px;
    bottom: -20px;
    z-index: 2;
    opacity: 0;
    width: 50vw;
    outline: none;
    touch-action: none;
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

  #indicators {
    height: 2px;
    background-color: rgba(0, 0, 0, 0.33);
    top: 8px;
    left: 6px;
    right: 6px;
    z-index: 1;
    position: absolute;
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    column-gap: 4px;
    box-shadow: 0px 0px 50px 10px rgba(0, 0, 0, 0.9);
  }

  #indicators div {
    background-color: white;
    height: 100%;
    flex-grow: 1;
    border-radius: 2px;
  }
  .nextIndicators {
    opacity: 0.5;
  }

  #indicators #currentIndicator {
    background-color: rgba(255, 255, 255, 0.5);
    position: relative;
    overflow: hidden;
  }

  #currentIndicator::after {
    content: "";
    position: absolute;
    left: 0px;
    height: 100%;
    background: white;
    animation: progress 5s linear;
    -webkit-animation: progress 5s linear;
    -moz-animation: progress 5s linear;
    -o-animation: progress 5s linear;
    animation-fill-mode: forwards;
  }

  .paused::after {
    -webkit-animation-play-state: paused !important;
    -moz-animation-play-state: paused !important;
    -o-animation-play-state: paused !important;
    animation-play-state: paused !important;
  }

  @keyframes -global-progress {
    0% {
      width: 0%;
    }
    100% {
      width: 100%;
    }
  }
  @-webkit-keyframes -global-progress {
    0% {
      width: 0%;
    }
    100% {
      width: 100%;
    }
  }
  @-moz-keyframes -global-progress {
    0% {
      width: 0%;
    }
    100% {
      width: 100%;
    }
  }
  @-o-keyframes -global-progress {
    0% {
      width: 0%;
    }
    100% {
      width: 100%;
    }
  }
</style>

<svelte:window on:keydown={handleKeydown} />
<svelte:options immutable={true} />

<Nav projectIndex={parseInt(params.project)} {navOpen} on:message={handleNav} />
<div
  style=" width: 100vw; height: 100vh; display: flex; justify-content: center;
  overflow:hidden; align-items: center; perspective: 840px;">
  <main
    style="position: relative; left: {held ? gesture_gap.pageX : 0}px;
    transition: left {held ? 0 : 0.2}s ease;">
    <!-- overflow: hidden; -->

    <button
      id="prevButton"
      on:touchstart|passive={e => gestureDown(e)}
      on:mousedown|preventDefault={e => gestureDown(e)}
      on:touchmove|passive={e => {
        if (held) gestureMove(e);
      }}
      on:mousemove|preventDefault={e => {
        if (held) gestureMove(e);
      }}
      on:touchend|preventDefault={e => gestureUp(e, 'prev')}
      on:mouseup={e => gestureUp(e, 'prev')}
      class={held ? 'grabbing' : 'no'} />
    <button
      id="nextButton"
      on:touchstart|passive={e => gestureDown(e)}
      on:mousedown|preventDefault={e => gestureDown(e)}
      on:touchmove|passive={e => {
        if (held) gestureMove(e);
      }}
      on:mousemove|preventDefault={e => {
        if (held) gestureMove(e);
      }}
      on:touchend|preventDefault={e => gestureUp(e, 'next')}
      on:mouseup={e => gestureUp(e, 'next')}
      class={held ? 'grabbing' : 'no'} />

    <div
      style="backface-visibility: hidden; transform: {held ? 'rotateY(' + gesture_gap.pageX / 10 + 'deg)' : 'none'};
      transform-origin: center {swipeDirection == 'right' ? 'right' : 'left'};
      transition: transform {held ? 0 : 0.2}s ease; transform-style: {held ? 'preserve-3d' : 'unset'};
      background-color: rgba(255,0,255,.4); max-width: 460px; ">

      <!-- display: flex; column-gap: 0px; align-items: center; -->

      {#each projectArray as { name, stories }, i}
        <!-- each project -->

        {#if params.project == i}
          <!-- if it's the current project -->
          <div id="indicators">
            {#each stories as story, p}
              {#if params.story > p}
                <div />
              {:else if params.story == p}
                <div
                  id="currentIndicator"
                  class={held || navOpen ? 'paused' : 'no'} />
              {:else}
                <div class="nextIndicators" />
              {/if}
            {/each}
          </div>
        {/if}

        {#each stories as story, j}
          <!-- each story -->
          <Story
            storyContent={story}
            current={params.project == i && params.story == j ? true : false}
            next={next.project == i && next.story == j ? true : false}
            prev={prev.project == i && prev.story == j ? true : false}
            nextCover={params.project == projectArray.length - 1 ? (i == 0 && j == 0 ? true : false) : params.project == i - 1 && j == 0 ? true : false}
            prevCover={params.project == 0 ? (i == projectArray.length - 1 && j == 0 ? true : false) : params.project == i + 1 && j == 0 ? true : false} />
          <!-- fix this to work with last/first projects -->
        {/each}
      {/each}
    </div>

  </main>
</div>
