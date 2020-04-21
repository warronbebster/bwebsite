import { writable } from 'svelte/store';

export const current = writable(1); //export current number... and total number so it knows when to cycle?
export const currentPos = writable({ project: 0, story: 1 }); //export current number... and total number so it knows when to cycle?
export const projectArray = writable([
	'project 1',
	'project 2',
	'project 333',
	'projecr 4',
	'proejh 55,',
	'projer 6',
]); //export current number... and total number so it knows when to cycle?

export const projectList = writable([
	{ name: 'project 0', type: 'image', stories: [1] },
	{ name: 'project 1', type: 'image', stories: [4, 5] },
	{ name: 'project 2', type: 'image', stories: [6, 7, 8] },
	{ name: 'project 3', type: 'image', stories: [9, 10, 11, 12] },
]);

//store projects here?
