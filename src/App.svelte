<script>
  import Router from "svelte-spa-router";
  import { projectArray } from "./stores.js";
  import { replace } from "svelte-spa-router";

  import routes from "./routes.js";

  function routeLoaded(event) {
    console.log(event.detail.location);
    let loadedRoute = event.detail.location.split("/");
    loadedRoute.shift();
    console.log(loadedRoute);

    if (loadedRoute[0]) {
      //if there's even a value there
      if (Number.isInteger(parseInt(loadedRoute[0]))) {
        //if it's a number
        if (
          //if it's higher than the number of projects
          parseInt(loadedRoute[0]) >= projectArray.length ||
          parseInt(loadedRoute[0]) < 0
        ) {
          replace("/");
        } else {
          //if the first number is in range
          if (loadedRoute.length == 2) {
            //if there's a second value
            if (Number.isInteger(parseInt(loadedRoute[1]))) {
              //& it's a number
              if (
                parseInt(loadedRoute[1]) >=
                projectArray[parseInt(loadedRoute[0])].stories.length
              ) {
                // if it's higher than the amount of stories in that project
                replace("/" + loadedRoute[0] + "/0");
              }
            } else {
              //if second value is not a number
              replace("/" + loadedRoute[0] + "/0");
            }
          } else if ((loadedRoute.length = 1)) {
            //if there's only the first number
            replace("/" + loadedRoute[0] + "/0");
          }
        }
      } else {
        //if first value is not even a number
        replace("/");
      }
    }
  }
</script>

<!--ROUTE-->
<Router {routes} on:routeLoaded={routeLoaded} />
<!--ROUTE DONE-->

<!-- Module context… sharing variables across all instances of a module? -->
<!-- <script context="module">
	let current; //basically… this is a shared variable between all of those types of modules?
</script> -->

<!-- pause execution to debug -->
<!-- {@debug [value to inspect]} -->
