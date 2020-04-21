import { writable } from 'svelte/store';

export const current = writable(1); //export current number... and total number so it knows when to cycle?
export const projectArray = writable([
	'project 1',
	'project 2',
	'project 333',
	'projecr 4',
	'proejh 55,',
	'projer 6',
]); //export current number... and total number so it knows when to cycle?

// export const projectList = writable([
//     {name: 'project 1', position: 'current', type: 'image'},
//     {name: 'project 2', position: 'next', type: 'image'},
//     {name: 'project 3', position: 'none', type: 'image'},
//     {name: 'project 3', position: 'none', type: 'image'},
// 	'projecr 4',
// ]);

//store projects here?
