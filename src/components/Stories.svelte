<script>
  import Story from "./Story.svelte";
  import { onMount } from "svelte";
  import Nav from "./Nav.svelte";
  import { projectArray, getNext, getPrev } from "../stores.js";
  import { push } from "svelte-spa-router";

  let activeStories = [];
  for (const project of projectArray) {
    activeStories.push(0);
  }

  export let params = { project: 0, story: 0 };

  //when params change, update activeStories
  $: activeStories[parseInt(params.project)] = parseInt(params.story);

  $: next = getNext(params);
  $: prev = getPrev(params);
  $: nextProject =
    parseInt(params.project) < projectArray.length - 1
      ? parseInt(params.project) + 1
      : 0;
  $: prevProject =
    parseInt(params.project) > 0
      ? parseInt(params.project) - 1
      : projectArray.length - 1;

  let bufferProject = 0;

  let gesture_start,
    gesture_active,
    gesture_gap = 0;

  let held = false;
  let swipeDirection = "right";
  const swipeSensitivity = 100;

  let gestureTimedOut = true; //whether a gesture has timed out
  let gestureTimer; //timer object to time that

  let storyTimer; //timer object to time stories
  const storyTimerTime = 6000;

  let navOpen = false;
  const showNav = function(event) {
    navOpen = event.detail.open;
    storyTimer.pause();
  };

  const Timer = function(callback, delay) {
    var timerId,
      start,
      delayStore = delay,
      remaining = delay;

    this.pause = function() {
      window.clearTimeout(timerId);
      remaining -= Date.now() - start;
    };

    this.clear = function() {
      window.clearTimeout(timerId);
    };

    this.resume = function() {
      start = Date.now();
      window.clearTimeout(timerId);
      timerId = window.setTimeout(callback, remaining);
    };

    this.reset = function() {
      start = Date.now();
      remaining = delayStore;
      window.clearTimeout(timerId);
      timerId = window.setTimeout(callback, remaining);
    };

    this.resume();
  };

  const handleNavProject = function(event) {
    pushHandler(event.detail, 0);
    storyTimer.resume();
  };

  //if the project has changed since router push went through
  $: if (parseInt(params.project) != bufferProject) {
    if (parseInt(params.project) == 0) {
      bufferProject == projectArray.length - 1
        ? (swipeDirection = "left")
        : (swipeDirection = "right");
    } else if (parseInt(params.project) == projectArray.length - 1) {
      bufferProject == 0
        ? (swipeDirection = "right")
        : (swipeDirection = "left");
    } else {
      parseInt(params.project) > bufferProject
        ? (swipeDirection = "left")
        : (swipeDirection = "right");
    }
    bufferProject = parseInt(params.project);
  }

  const pushHandler = function(project, story) {
    // console.log("pushHandler :" + project + ", " + story);
    push("/" + project.toString() + "/" + story.toString());
    if (storyTimer) storyTimer.reset();
  };

  function handleProjects(direction) {
    if (direction == "next") {
      pushHandler(next.project, next.story);
    } else if (direction == "prev") {
      pushHandler(prev.project, prev.story);
    } else if (direction == "nextProject") {
      pushHandler(nextProject, activeStories[nextProject]);
    } else if (direction == "prevProject") {
      pushHandler(prevProject, activeStories[prevProject]);
    }
  }

  function gestureDown(e) {
    //when a gesture starts
    if (navOpen) {
      navOpen = false; //close nav
      storyTimer.resume(); //pause story timer
    } else {
      storyTimer.pause(); //pause story timer
      // navOpen = false; //close nav
      held = true; //start holding gesture
      gestureTimedOut = false; //reset gestureTimedOut, hasn't timed out yet

      e.type == "touchstart"
        ? (gesture_start = Math.round(e.changedTouches[0].pageX)) //where the event starts
        : (gesture_start = e.pageX);

      gesture_active = gesture_start;

      gestureTimer = setTimeout(() => {
        gestureTimedOut = true; //start gesture timer
      }, 300);
    }
  }

  function gestureMove(e) {
    //when ya movin
    e.type == "touchmove"
      ? (gesture_active = Math.round(e.changedTouches[0].pageX))
      : (gesture_active = e.pageX);

    gesture_gap = gesture_active - gesture_start; //set the gap between start and where you've dragged
    gesture_gap > 0 ? (swipeDirection = "left") : (swipeDirection = "right");
  }

  async function gestureUp(e) {
    storyTimer.resume();
    if (!gestureTimedOut) {
      //if the gesture hasn't timed out
      if (gesture_active > gesture_start + swipeSensitivity) {
        handleProjects("prevProject");
      } else if (gesture_active < gesture_start - swipeSensitivity) {
        handleProjects("nextProject");
      } else {
        //JUST GO NEXT OR PREV
        if (Math.abs(gesture_gap) < 10) {
          gesture_active > window.innerWidth / 2
            ? handleProjects("next")
            : handleProjects("prev");
        }
      }
    } else {
      //if the gesture has timed out
      if (gesture_active > gesture_start + 200) {
        handleProjects("prevProject");
      } else if (gesture_active < gesture_start - 200) {
        handleProjects("nextProject");
      }
      //reset stuff
    }
    // if (storyTimer) storyTimer.reset();
    if (gestureTimer) clearTimeout(gestureTimer);
    held = false; //end holding gesture
    gesture_start = 0;
    gesture_active = 0;
    gesture_gap = 0;
  }

  function handleKeydown(e) {
    if (e.keyCode == 39 || e.keyCode == 32 || e.keyCode == 68) {
      handleProjects("next");
    } else if (e.keyCode == 37 || e.keyCode == 8 || e.keyCode == 65) {
      handleProjects("prev");
    }
  }

  onMount(() => {
    //when first mounts; basically on page load
    storyTimer = new Timer(() => {
      handleProjects("next");
    }, storyTimerTime);

    function callback(e) {
      var e = window.e || e;
      if (e.target.tagName !== "A") return;
      // Do something
      // console.log("uhhhhhh what is this callback thing");
      // console.log();
      window.location.href = e.srcElement.href; //go to link
    }

    if (document.addEventListener)
      document.addEventListener("touchend", callback, false);
    else document.attachEvent("onclick", callback);
  });
</script>

<style>
  :root {
    --width-border: 460px;
    --height-border: 812px;
  }

  .grabbing {
    cursor: grabbing !important;
  }

  main {
    height: calc(100vh - 30px);
    max-height: var(--height-border);
    /* this is where the height gets limiteeeed */
    position: relative;
    width: 100vw;
    max-width: var(--width-border);
    padding: 0;
    margin: 0;
    transform-style: preserve-3d;
    will-change: transform;
  }
  @media screen and (max-width: 550px) {
    /* Mobile */
    main {
      border-radius: 0px;
      margin: 0;
      height: 100vh;
      max-height: 100vh;
      max-width: 100vw;
      /* width: 100vw; */
    }
  }

  .project {
    /* max-width: 460px; */
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transition: left 0.5s ease, transform 0.5s ease;
    display: none;
    overflow: hidden;
    background: transparent;
    will-change: transform;
  }

  .prevProject {
    display: block;
    transform: translateX(-100%) rotateY(-90deg);
    -webkit-transform: translateX(-100%) rotateY(-90deg);
    z-index: -1;
    position: absolute;
    top: 0;
    /* left: -100%; */
  }

  .currentProject {
    display: block;
    transform: translateX(0%) rotateY(0deg);
    -webkit-transform: translateX(0%) rotateY(0deg);
    position: absolute;
    top: 0;
    left: 0%;
  }

  .nextProject {
    display: block;
    z-index: -1;
    position: absolute;
    top: 0;
    transform: translateX(100%) rotateY(90deg);
    -webkit-transform: translateX(100%) rotateY(90deg);
    /* left: 100%; */
  }

  #indicators {
    height: 2px;
    top: 8px;
    left: 6px;
    right: 6px;
    z-index: 1;
    position: absolute;
    display: flex;
    justify-content: space-between;
    align-items: stretch;
  }

  #indicators div {
    background-color: white;
    height: 100%;
    flex-grow: 1;
    border-radius: 2px;
    margin: 0 2px;
  }
  .nextIndicators {
    opacity: 0.5;
  }

  #indicators #currentIndicator {
    background-color: rgba(255, 255, 255, 0.5);
    position: relative;
    overflow: hidden;
  }

  #indicators div #loadingBar {
    position: absolute;
    top: 0px;
    left: 0px;
    margin: 0px;
    height: 100%;
    background: white;
    animation: progress 6s linear;
    -moz-animation: progress 6s linear;
    -o-animation: progress 6s linear;

    animation-name: progress;
    animation-duration: 6s;
    animation-timing-function: linear;
    animation-fill-mode: forwards;

    -webkit-animation-name: progress;
    -webkit-animation-duration: 6s;
    -webkit-animation-timing-function: linear;
    -webkit-animation-fill-mode: forwards;
  }

  .paused {
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

<Nav
  projectIndex={parseInt(params.project)}
  {navOpen}
  on:message={showNav}
  on:project={handleNavProject} />
<div
  style="overflow: hidden; height: 100vh; width: 100vw; display: flex;
  align-items: center; justify-content: center; perspective: 1080px; cursor:
  ew-resize"
  on:mousedown={e => {
    gestureDown(e);
  }}
  on:mousemove={e => {
    if (held) gestureMove(e);
  }}
  on:mouseup={e => {
    if (held) gestureUp(e);
  }}
  on:touchstart|preventDefault={e => {
    gestureDown(e);
  }}
  on:touchmove|passive={e => {
    if (held) gestureMove(e);
  }}
  on:touchend|preventDefault={e => {
    if (held) gestureUp(e);
  }}
  class={held ? 'grabbing' : 'no'}>

  <main
    style="transform: translateX({held ? Math.max(Math.min(gesture_gap * 1.1, 460), -460) : 0}px);
    {held ? 'transition: transform 0s;' : 'transition: transform .5s ease;'}">

    {#each projectArray as { name, stories }, i}
      <!-- each project -->

      <div
        class="project {params.project == i ? 'currentProject ' : ''}{i == nextProject ? 'nextProject ' : ''}{i == prevProject ? 'prevProject ' : ''}"
        style="{held && (i == params.project || i == nextProject || i == prevProject) ? 'transform: translateX(' + (i == prevProject ? -100 : i == nextProject ? 100 : 0) + '%) rotateY(' + (Math.min(Math.max(gesture_gap / 4.2, -90), 90) + (i == nextProject ? 90 : 0) + (i == prevProject ? -90 : 0)) + 'deg) ;' : ''}
        {params.project == i ? 'transform-origin: center ' + swipeDirection + ';' : ''}{nextProject == i ? 'transform-origin: center left; ' : ' '}{prevProject == i ? 'transform-origin: center right; ' : ' '}{!held ? 'transition: left .5s ease, transform .5s ease; ' : 'transition: left 0s, transform 0s '}">
        <!-- {(i == prevProject ? 'translateX(-100%) ' : '')} {(i == nextProject ? 'translateX(100%) ' : '')} -->

        {#if params.project == i}
          <!-- if it's the current project -->
          <div id="indicators">
            {#each stories as story, p}
              {#if params.story > p}
                <div />
              {:else if params.story == p}
                <div id="currentIndicator">
                  <div
                    id="loadingBar"
                    class={held || navOpen ? 'paused' : 'no'} />
                </div>
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
            nextCover={i == nextProject ? (j == activeStories[nextProject] ? true : false) : i == prevProject ? (j == activeStories[prevProject] ? true : false) : false} />
        {/each}
      </div>
      <!-- close project div -->
    {/each}
    <!-- //close 3d div -->

  </main>
</div>
