import Stories from './components/Stories.svelte';
import { wrap } from 'svelte-spa-router';
// import { writable } from 'svelte/store';
const routes = {
	'/': Stories,
	'/:project/:story': Stories,
	'*': Stories,
};
export default routes;
// export const curRoute = writable('/');
