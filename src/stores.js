import { writable, derived } from 'svelte/store';
import { figmaProject } from './test.js';

// export const current = writable(1); //export current number... and total number so it knows when to cycle?
export const currentPos = writable({ project: 0, story: 0 }); //export current number... and total number so it knows when to cycle?

export const projectArray = figmaProject; //write output of figma script here

export const getNext = function (posToCheck) {
	let nextPos = { project: posToCheck.project, story: posToCheck.story };
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

export const plus1 = derived(currentPos, ($currentPos) => getNext($currentPos));

export const plus2 = derived(plus1, ($plus1) => getNext($plus1));

export const minus1 = derived(currentPos, ($currentPos) => getPrev($currentPos));

export const minus2 = derived(minus1, ($minus1) => getPrev($minus1));
