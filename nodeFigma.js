// require('dotenv').config(); //dunno if this is necessary
const fetch = require('node-fetch'); //fetch behaviour
const fs = require('fs'); //file system
const figma = require('./lib/figma');

const headers = new fetch.Headers();
const componentList = [];
let devToken = '42909-59b7407f-9d5d-4efc-bbbe-1980e8e471a3';

if (process.argv.length < 3) {
	console.log('Usage: node setup.js <file-key> [figma-dev-token]');
	process.exit(0);
}

if (process.argv.length > 3) {
	devToken = process.argv[3];
}

headers.append('X-Figma-Token', devToken);

const fileKey = process.argv[2];
const baseUrl = 'https://api.figma.com';

const vectorMap = {};
const vectorList = [];
const vectorTypes = ['VECTOR', 'LINE', 'REGULAR_POLYGON', 'ELLIPSE', 'STAR'];

//shit begins after this
//shit begins after this
//shit begins after this

//DON'T DELETE
//DON'T DELETE
// function preprocessTree(node) {
// 	//this code runs once per frame with #
// 	let vectorsOnly = node.name.charAt(0) !== '#'; //things that don't start with #
// 	let vectorVConstraint = null;
// 	let vectorHConstraint = null;

// 	//this function just returns true if paints exist
// 	function paintsRequireRender(paints) {
// 		if (!paints) return false; //if no paints
// 		let numPaints = 0;
// 		for (const paint of paints) {
// 			if (paint.visible === false) continue; //jump this section of loop
// 			numPaints++;
// 			if (paint.type === 'EMOJI') return true; //wat
// 		}
// 		return numPaints > 1;
// 	}

// 	if (
// 		//if paints exist, fill or stroke
// 		paintsRequireRender(node.fills) ||
// 		paintsRequireRender(node.strokes) ||
// 		(node.blendMode != null &&
// 			['PASS_THROUGH', 'NORMAL'].indexOf(node.blendMode) < 0)
// 	) {
// 		node.type = 'VECTOR'; //set node type to vector?
// 	}

// 	const children =
// 		node.children && node.children.filter((child) => child.visible !== false);
// 	if (children) {
// 		//if there are children in the node
// 		for (let j = 0; j < children.length; j++) {
// 			if (vectorTypes.indexOf(children[j].type) < 0) {
// 				//if it's not one of the types listed above
// 				vectorsOnly = false; //set no vectors?
// 			} else {
// 				if (
// 					vectorVConstraint != null &&
// 					children[j].constraints.vertical != vectorVConstraint
// 				)
// 					vectorsOnly = false;
// 				if (
// 					vectorHConstraint != null &&
// 					children[j].constraints.horizontal != vectorHConstraint
// 				)
// 					vectorsOnly = false;
// 				vectorVConstraint = children[j].constraints.vertical;
// 				vectorHConstraint = children[j].constraints.horizontal;
// 			}
// 		}
// 	}
// 	node.children = children; //rewrite node.children with new thing

// 	if (children && children.length > 0 && vectorsOnly) {
// 		//if there are children, and "vectorsOnly"
// 		node.type = 'VECTOR';
// 		node.constraints = {
// 			vertical: vectorVConstraint,
// 			horizontal: vectorHConstraint,
// 		};
// 	}

// 	if (vectorTypes.indexOf(node.type) >= 0) {
// 		node.type = 'VECTOR';
// 		vectorMap[node.id] = node;
// 		vectorList.push(node.id); //adds to vectorlist
// 		node.children = [];
// 	}

// 	if (node.children) {
// 		//if there are children
// 		for (const child of node.children) {
// 			preprocessTree(child); //oh it's recursive baybee
// 		}
// 	}
// }
//DON'T DELETE
//DON'T DELETE

async function main() {
	let resp = await fetch(`${baseUrl}/v1/files/${fileKey}?geometry=paths`, {
		headers,
	});
	let data = await resp.json(); //data is what comes back from API request

	const doc = data.document; //figma document
	const canvas = doc.children[0]; //only grabbing first child = first page in project
	// const canvas2 = doc.children[0]; //only grabbing first child = first page in project

	//GRAB THE BACKGROUND IMAGES???
	let respImages = await fetch(`${baseUrl}/v1/files/${fileKey}/images`, {
		headers,
	});
	let imageFillJSON = await respImages.json(); //data is what comes back from API request
	// if (!imageFills.error && imageFills.meta.images)
	const imageFills = imageFillJSON.meta.images || {};

	debugger;
	//DON'T DELETE
	//DON'T DELETE
	// for (let i = 0; i < canvas.children.length; i++) {
	// 	//for each child  of canvas
	// 	const child = canvas.children[i];
	// 	if (child.name.charAt(0) === '#' && child.visible !== false) {
	// 		preprocessTree(child); //run preprocess function?
	// 		//for each frame
	// 	}
	// }
	//okay soooo it's unclear to me what "preprocess" does…
	//maybe it cleans up files if there's a bunch of extra stuff?
	//or stuff the system isn't expecting?
	//DON'T DELETE
	//DON'T DELETE

	//is this where it grabs SVGs? what's vectorList?
	//does it get populated by preprocess?
	//GU IDS ??
	let guids = vectorList.join(','); //this grabs the vectors?
	data = await fetch(
		`${baseUrl}/v1/images/${fileKey}?ids=${guids}&format=svg`,
		{ headers }
	); //grabs svgs of vectorList
	const imageJSON = await data.json(); //makes json out of them

	const images = imageJSON.images || {}; //if images exist?
	if (images) {
		//if images exist, process like this?
		let promises = [];
		let guids = [];
		for (const guid in images) {
			if (images[guid] == null) continue;
			guids.push(guid);
			promises.push(fetch(images[guid]));
		}

		let responses = await Promise.all(promises);
		promises = [];
		for (const resp of responses) {
			promises.push(resp.text());
		}

		responses = await Promise.all(promises);
		for (let i = 0; i < responses.length; i++) {
			//replace svg with svg preserveAspectRatio none
			images[guids[i]] = responses[i].replace(
				'<svg ',
				'<svg preserveAspectRatio="none" '
			);
		}
	}

	const componentMap = {}; //empty object for putting stuff in?
	let contents = ``; //this is what eventually gets written to filesystem
	let nextSection = ''; //container for what is to be added to 'contents'

	for (let i = 0; i < canvas.children.length; i++) {
		//for each artboard
		const child = canvas.children[i]; //child variable
		if (child.name.charAt(0) === '#' && child.visible !== false) {
			//if named & visible
			figma.createComponent(child, images, imageFills, componentMap);
			//hit figma lib
			//pass the frame and images?
			//returns object & updates componentMap object
		}
	}

	// console.log(componentMap);
	//so at this point, componentMap has {name, doc(aka html to write), instance} plus a key i don't understand (16:0?)

	for (const key in componentMap) {
		// contents += `  if (id === "${key}") return ${componentMap[key].instance};\n`;
		nextSection += componentMap[key].doc + '\n';
		//write that thing in componentMap to nextSection
	}

	contents += nextSection; //append nextSection to contents

	const path = './src/figmaComponents.js'; //so here, it writes one file.
	//here is where it could change to multiple files, one per project/frame
	fs.writeFile(path, contents, function (err) {
		//write the file
		if (err) console.log(err);
		console.log(`wrote ${path}`);
	});
}

main().catch((err) => {
	//run main
	console.error(err);
	console.error(err.stack);
});
