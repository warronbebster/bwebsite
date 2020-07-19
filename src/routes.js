import Stories from './components/Stories.svelte';
const routes = {
	'/': Stories,
	'/:project/:story': Stories,
	'*': Stories,
};
export default routes;
