import { writable, derived } from 'svelte/store';

// export const current = writable(1); //export current number... and total number so it knows when to cycle?
export const currentPos = writable({ project: 0, story: 0 }); //export current number... and total number so it knows when to cycle?

export const projectList = writable([
	{ name: 'project 0', type: 'image', stories: [1] },
	{ name: 'project 1', type: 'image', stories: [4, 5] },
	{ name: 'project 2', type: 'image', stories: [6, 7, 8] },
	{ name: 'project 3', type: 'image', stories: [9, 10, 11, 12] },
]);

export const prevPos = writable({ project: 0, story: 1 }); //export current number... and total number so it knows when to cycle?
export const nextPos = writable({ project: 0, story: 1 }); //export current number... and total number so it knows when to cycle?

//could I make a derived store if I didn't make projectlist a store? and just a static json file?
