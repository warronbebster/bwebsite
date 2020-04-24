import { writable, derived } from 'svelte/store';
// import { getNext, getPrev } from './orderFunctions.js';

// export const current = writable(1); //export current number... and total number so it knows when to cycle?
export const currentPos = writable({ project: 0, story: 0 }); //export current number... and total number so it knows when to cycle?

export const projectList = writable([
	{ name: 'project 0', type: 'image', stories: [1] },
	{ name: 'project 1', type: 'image', stories: [4, 5] },
	{ name: 'project 2', type: 'image', stories: [6, 7, 8] },
	{ name: 'project 3', type: 'image', stories: [9, 10, 11, 12] },
]);

export const projectArray = [
	{ name: 'project 0', type: 'image', stories: [1] },
	{ name: 'project 1', type: 'image', stories: [4, 5] },
	{ name: 'project 2', type: 'image', stories: [6, 7, 8] },
	{ name: 'project 3', type: 'image', stories: [9, 10, 11, 12] },
];

// export const prevPos = writable({ project: 0, story: 1 }); //export current number... and total number so it knows when to cycle?
// export const nextPos = writable({ project: 0, story: 1 }); //export current number... and total number so it knows when to cycle?

export const getNext = function (posToCheck) {
	// console.log(
	// 	'position getNext is checking: Project: ' +
	// 		posToCheck.project +
	// 		' Story: ' +
	// 		posToCheck.story
	// );
	let nextPos = { project: 0, story: 0 };
	nextPos.project = posToCheck.project; //start by setting a new variable to what we're checking against
	nextPos.story = posToCheck.story; //start by setting a new variable to what we're checking against
	//is the error that this basically *makes* nextPos $currentPos? like the whole object? and it updates?
	if (
		//if it's not the last story in a project
		posToCheck.story <
		projectArray[posToCheck.project].stories.length - 1
	) {
		nextPos.story++; //add 1 to story value
	} else {
		//if it's the last story in a project
		if (posToCheck.project < projectArray.length - 1) {
			//if it's not the last project
			nextPos.project++; //add 1 to story value
			nextPos.story = 0; //reset story to beginning
		} else {
			//if it's the last project
			nextPos.story = 0; //reset story to beginning
			nextPos.project = 0; //reset project to beginning;
		}
	}
	return nextPos;
};

export const getPrev = function (posToCheck) {
	let prevPos = { project: 0, story: 0 };
	prevPos.project = posToCheck.project; //start by setting a new variable to what we're checking against
	prevPos.story = posToCheck.story;
	if (
		//if it's not the first story in a project
		posToCheck.story > 0
	) {
		prevPos.story--;
	} else {
		//if it's the first story in a project
		if (posToCheck.project > 0) {
			//if it's not the first project
			prevPos.project--;
			prevPos.story = projectArray[posToCheck.project - 1].stories.length - 1;
		} else {
			//if it's the first project
			prevPos.project = projectArray.length - 1;
			prevPos.story = projectArray[projectArray.length - 1].stories.length - 1;
		}
	}
	return prevPos;
};

export const nextPos = derived(currentPos, ($currentPos) =>
	getNext($currentPos)
);

export const prevPos = derived(currentPos, ($currentPos) =>
	getPrev($currentPos)
);

//could I make a derived store if I didn't make projectlist a store? and just a static json file?
