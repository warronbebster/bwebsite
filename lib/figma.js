const fs = require('fs');

const VECTOR_TYPES = ['VECTOR', 'LINE', 'REGULAR_POLYGON', 'ELLIPSE'];
const GROUP_TYPES = ['GROUP', 'BOOLEAN_OPERATION'];

function colorString(color) {
	return `rgba(${Math.round(color.r * 255)}, ${Math.round(
		color.g * 255
	)}, ${Math.round(color.b * 255)}, ${color.a})`;
}

function dropShadow(effect) {
	return `${effect.offset.x}px ${effect.offset.y}px ${
		effect.radius
	}px ${colorString(effect.color)}`;
}

function innerShadow(effect) {
	return `inset ${effect.offset.x}px ${effect.offset.y}px ${
		effect.radius
	}px ${colorString(effect.color)}`;
}

function JSToCSS(JS) {
	let cssString = '';
	const addPx = [
		'minHeight',
		'minWidth',
		'height',
		'width',
		'left',
		'right',
		'top',
		'bottom',
		'fontSize',
	];
	if (typeof JS === 'object' && JS !== null) {
		for (let objectKey in JS) {
			cssString +=
				objectKey.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`) +
				': ' +
				JS[objectKey] +
				//add "px" to end if it's one of the above types and is a number
				(addPx.includes(objectKey) && !isNaN(JS[objectKey]) ? 'px' : '') +
				'; ';
		}

		return cssString;
	} else {
		return '';
	}
}

function backgroundSize(scaleMode) {
	if (scaleMode === 'FILL') {
		return 'cover';
	}
}

function nodeSort(a, b) {
	if (a.absoluteBoundingBox.y < b.absoluteBoundingBox.y) return -1;
	else if (a.absoluteBoundingBox.y === b.absoluteBoundingBox.y) return 0;
	else return 1;
}

function getPaint(paintList) {
	//this should really be called "get top paint"
	if (paintList && paintList.length > 0) {
		return paintList[paintList.length - 1];
	}

	return null;
}

function paintToLinearGradient(paint) {
	const handles = paint.gradientHandlePositions;
	const handle0 = handles[0];
	const handle1 = handles[1];

	const ydiff = handle1.y - handle0.y;
	const xdiff = handle0.x - handle1.x;

	const angle = Math.atan2(-xdiff, -ydiff);
	const stops = paint.gradientStops
		.map((stop) => {
			return `${colorString(stop.color)} ${Math.round(stop.position * 100)}%`;
		})
		.join(', ');
	return `linear-gradient(${angle}rad, ${stops})`;
}

function paintToRadialGradient(paint) {
	const stops = paint.gradientStops
		.map((stop) => {
			return `${colorString(stop.color)} ${Math.round(stop.position * 60)}%`;
		})
		.join(', ');

	return `radial-gradient(${stops})`;
}

//EXPANDCHILDREN STARTS HERE
function expandChildren(node, parent, minChildren, offset) {
	const children = node.children;
	let added = offset;

	if (children) {
		for (let i = 0; i < children.length; i++) {
			const child = children[i];

			// if (
			// 	parent != null &&
			// 	(node.type === 'COMPONENT' || node.type === 'INSTANCE')
			// ) {
			// 	child.constraints = {
			// 		vertical: 'TOP_BOTTOM',
			// 		horizontal: 'LEFT_RIGHT',
			// 	};
			// }

			// if (GROUP_TYPES.indexOf(child.type) >= 0) {
			// 	added += expandChildren(child, parent, minChildren, added + i);
			// 	continue;
			// }

			child.order = i + added;

			minChildren.push(child);
		}
		minChildren.sort(nodeSort);

		return added + children.length - offset;
	}
	return added - offset;
}

const createComponent = (component, svgMap, imageFills, componentMap) => {
	const name = component.name.replace(/\W+/g, '');
	const instance = name + component.id.replace(';', 'S').replace(':', 'D');

	let doc = ''; //text to eventually add to file

	//this is where I can build the JSON structure I want
	//this is where I can build the JSON structure I want
	//this is where I can build the JSON structure I want

	// print(`class ${instance} extends PureComponent {`, '');
	// print(`  render() {`, '');
	// print(`    return (`, '');

	// const path = `src/components/${name}.js`;

	// 	if (!fs.existsSync(path)) {
	// 		const componentSrc = `import React, { PureComponent } from 'react';
	// import { getComponentFromId } from '../figmaComponents';

	// export class ${name} extends PureComponent {
	//   state = {};

	//   render() {
	//     const Component = getComponentFromId(this.props.nodeId);
	//     return <Component {...this.props} {...this.state} />;
	//   }
	// }
	// `;
	// 		fs.writeFile(path, componentSrc, function (err) {
	// 			if (err) console.log(err);
	// 			console.log(`wrote ${path}`);
	// 		});
	// 	}

	function print(msg, indent) {
		//just a function to add something to doc
		doc += `${indent}${msg}\n`;
	}

	//VISITNODE STARTS HERE
	//VISITNODE STARTS HERE

	const visitNode = (node, parent, lastVertical, indent) => {
		//i think this function visits nodes and builds an object
		//to be transferred to html/css/written to file
		let content = null;
		let img = null;
		const styles = {};
		let minChildren = [];
		// const maxChildren = [];
		// const centerChildren = [];
		let bounds = null;
		let nodeBounds = null;
		let size = null;
		let relativeTransform = null;
		let artboardSize = { x: 360, y: 720 };

		if (parent != null) {
			//if there's a parent node:
			nodeBounds = node.absoluteBoundingBox;
			size = node.size;
			relativeTransform = node.relativeTransform;

			const nx2 = nodeBounds.x + nodeBounds.width;
			const ny2 = nodeBounds.y + nodeBounds.height;
			const parentBounds = parent.absoluteBoundingBox;
			const parentSize = parent.size;
			const px = parentBounds.x;
			const py = parentBounds.y;

			bounds = {
				left: relativeTransform[0][2],
				right: parentSize.x - (relativeTransform[0][2] + size.x),
				top: relativeTransform[1][2],
				bottom: parentSize.y - (relativeTransform[1][2] + size.y),
				// width: nodeBounds.width,
				// height: nodeBounds.height,
				//i could do some smartness here to only set based on this "size" variable if node has it
				width: size.x,
				height: size.y,
			};
		} else {
			artboardSize = node.size;
		}

		//this runs that function above
		expandChildren(node, parent, minChildren, 0);
		//adds children to the object?

		// let outerClass = 'outerDiv';
		let innerClass = 'innerDiv';
		const cHorizontal = node.constraints && node.constraints.horizontal;
		const cVertical = node.constraints && node.constraints.vertical;
		const outerStyle = {};

		if (node.order) {
			outerStyle.zIndex = node.order;
		}

		//somewhere in here, add check for rotation
		if (node.relativeTransform[0][0] !== 1) {
			//if there is any rotation or matrix transform
			styles.transform =
				'matrix(' +
				node.relativeTransform[0][0] +
				',' +
				node.relativeTransform[1][0] +
				',' +
				node.relativeTransform[0][1] +
				',' +
				node.relativeTransform[1][1] +
				',0,0)';
			styles.transformOrigin = '0% 0%';
		}

		if (cHorizontal === 'LEFT_RIGHT') {
			if (bounds != null) {
				styles.position = 'absolute';
				styles.left = bounds.left;
				styles.right = bounds.right;
				styles.flexGrow = 1;
			}
		} else if (cHorizontal === 'RIGHT') {
			if (bounds != null) {
				styles.position = 'absolute';
				styles.right = bounds.right;
				styles.width = bounds.width;
				styles.minWidth = bounds.width;
			}
		} else if (cHorizontal === 'CENTER') {
			styles.position = 'absolute';
			styles.left =
				'calc(50% - ' +
				bounds.width / 2 +
				'px - ' +
				((artboardSize.x - bounds.width) / 2 - bounds.left) +
				'px)';
		} else if (cHorizontal === 'SCALE') {
			if (bounds != null) {
				const parentWidth = bounds.left + bounds.width + bounds.right;
				styles.width = `${(bounds.width * 100) / parentWidth}%`;
				styles.left = `${(bounds.left * 100) / parentWidth}%`;
			}
		} else {
			if (bounds != null) {
				// styles.marginLeft = bounds.left;
				styles.position = 'absolute';
				styles.left = bounds.left;
				styles.width = bounds.width;
				styles.minWidth = bounds.width;
			}
		}

		if (bounds && bounds.height && cVertical !== 'TOP_BOTTOM') {
			styles.height = bounds.height;
		}

		if (cVertical === 'TOP_BOTTOM') {
			outerClass += ' centerer';
			if (bounds != null) {
				styles.top = bounds.top;
				styles.bottom = bounds.bottom;
			}
		} else if (cVertical === 'CENTER') {
			styles.position = 'absolute';
			styles.top =
				'calc(50% - ' +
				bounds.height / 2 +
				'px - ' +
				((artboardSize.y - bounds.height) / 2 - bounds.top) +
				'px)';
		} else if (cVertical === 'SCALE') {
			if (bounds != null) {
				//this seems chaotic; probably better to do with pos. absolute and setting all sides
				const parentHeight = bounds.top + bounds.height + bounds.bottom;
				styles.height = `${(bounds.height * 100) / parentHeight}%`;
				styles.top = `${(bounds.top * 100) / parentHeight}%`;
			}
		} else if (cVertical === 'TOP') {
			if (bounds != null) {
				styles.position = 'absolute';
				styles.top = bounds.top;
				styles.minHeight = styles.height;
			}
		} else if (cVertical === 'BOTTOM') {
			if (bounds != null) {
				styles.position = 'absolute';
				styles.bottom = bounds.bottom;
				styles.minHeight = styles.height;
			}
		}

		if (
			[
				'FRAME',
				'RECTANGLE',
				'INSTANCE',
				'COMPONENT',
				'ELLIPSE',
				'GROUP',
			].indexOf(node.type) >= 0
		) {
			if (['FRAME', 'COMPONENT', 'INSTANCE', 'GROUP'].indexOf(node.type) >= 0) {
				// styles.backgroundColor = colorString(node.backgroundColor);
				//update this for .fills
				if (node.clipsContent) styles.overflow = 'hidden';
				const lastFill = getPaint(node.fills);
				//basically this just grabs the TOP paint style.
				//hence why my color isn't showing for the rect with color & image.
				if (lastFill) {
					if (lastFill.type === 'SOLID') {
						styles.backgroundColor = colorString(lastFill.color);
						lastFill.opacity !== undefined
							? (styles.opacity = lastFill.opacity)
							: null;
					} else if (lastFill.type === 'IMAGE') {
						styles.backgroundImage =
							'url(' + imageFills[lastFill.imageRef] + ')';
						styles.backgroundSize = backgroundSize(lastFill.scaleMode);
					} else if (lastFill.type === 'GRADIENT_LINEAR') {
						styles.background = paintToLinearGradient(lastFill);
					} else if (lastFill.type === 'GRADIENT_RADIAL') {
						styles.background = paintToRadialGradient(lastFill);
					}
				}
			} else if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE') {
				const lastFill = getPaint(node.fills);
				if (lastFill) {
					if (lastFill.type === 'SOLID') {
						styles.backgroundColor = colorString(lastFill.color);
						lastFill.opacity !== undefined
							? (styles.opacity = lastFill.opacity)
							: null;
					} else if (lastFill.type === 'IMAGE') {
						styles.backgroundImage =
							'url(' + imageFills[lastFill.imageRef] + ')';
						styles.backgroundSize = backgroundSize(lastFill.scaleMode);
					} else if (lastFill.type === 'GRADIENT_LINEAR') {
						styles.background = paintToLinearGradient(lastFill);
					} else if (lastFill.type === 'GRADIENT_RADIAL') {
						styles.background = paintToRadialGradient(lastFill);
					}
				}

				if (node.effects) {
					for (let i = 0; i < node.effects.length; i++) {
						const effect = node.effects[i];
						if (effect.type === 'DROP_SHADOW') {
							styles.boxShadow = dropShadow(effect);
						} else if (effect.type === 'INNER_SHADOW') {
							styles.boxShadow = innerShadow(effect);
						} else if (effect.type === 'LAYER_BLUR') {
							styles.filter = `blur(${effect.radius}px)`;
						}
					}
				}

				const lastStroke = getPaint(node.strokes);
				if (lastStroke) {
					if (lastStroke.type === 'SOLID') {
						const weight = node.strokeWeight || 1;
						styles.border = `${weight}px solid ${colorString(
							lastStroke.color
						)}`;
					}
				}
				if (node.type === 'ELLIPSE') {
					styles.borderRadius = '50%';
				} else {
					const cornerRadii = node.rectangleCornerRadii;
					if (
						cornerRadii &&
						cornerRadii.length === 4 &&
						cornerRadii[0] + cornerRadii[1] + cornerRadii[2] + cornerRadii[3] >
							0
					) {
						styles.borderRadius = `${cornerRadii[0]}px ${cornerRadii[1]}px ${cornerRadii[2]}px ${cornerRadii[3]}px`;
					}
				}
			}
		} else if (node.type === 'TEXT') {
			const lastFill = getPaint(node.fills);
			if (lastFill) {
				styles.color = colorString(lastFill.color);
			}

			const lastStroke = getPaint(node.strokes);
			if (lastStroke) {
				const weight = node.strokeWeight || 1;
				styles.WebkitTextStroke = `${weight}px ${colorString(
					lastStroke.color
				)}`;
			}

			// const fontStyle = node.style;

			const applyFontStyle = (_styles, fontStyle) => {
				if (fontStyle) {
					if (fontStyle.fontSize) _styles.fontSize = fontStyle.fontSize;
					if (fontStyle.fontWeight) _styles.fontWeight = fontStyle.fontWeight;
					if (fontStyle.fontFamily) _styles.fontFamily = fontStyle.fontFamily;
					if (fontStyle.textAlignHorizontal)
						_styles.textAlign = fontStyle.textAlignHorizontal.toLowerCase();
					_styles.fontStyle = fontStyle.italic ? 'italic' : 'normal';
					if (fontStyle.lineHeightPercent)
						_styles.lineHeight = `${fontStyle.lineHeightPercent * 1.25}%`;
					if (fontStyle.letterSpacing)
						_styles.letterSpacing = `${fontStyle.letterSpacing}px`;
					if (fontStyle.textDecoration == 'UNDERLINE') {
						_styles.textDecorationLine = 'underline';
					} else if (fontStyle.textDecoration == 'STRIKETHROUGH') {
						_styles.textDecorationLine = 'line-through';
					}
				}
			};
			applyFontStyle(styles, node.style); //this takes the fontStyle and applies it to 'styles' object

			//could do this with the title of the node tbh

			// if (node.characterStyleOverrides.length > 0) {
			let para = '';
			const ps = []; //this holds the content?
			const styleCache = {};
			let currStyle = 0;

			const commitParagraph = (key) => {
				if (para !== '') {
					if (styleCache[currStyle] == null && currStyle !== 0) {
						styleCache[currStyle] = {};
						applyFontStyle(
							styleCache[currStyle],
							node.styleOverrideTable[currStyle]
						);
						const inlineFill = getPaint(
							node.styleOverrideTable[currStyle].fills
						);
						if (inlineFill) {
							styleCache[currStyle].color = colorString(inlineFill.color);
						}
					}

					const styleOverride = styleCache[currStyle]
						? styleCache[currStyle]
						: {};

					Object.keys(styleOverride).length > 0 //if there are style overrides
						? ps.push(
								`<span style="${JSToCSS(
									styleOverride
								)}" key="${key}">${para}</span>`
						  )
						: ps.push(`<span key="${key}">${para}</span>`);
					//add a span to ps, then reset para
					para = '';
				}
			};

			for (const i in node.characters) {
				let idx = node.characterStyleOverrides[i]; //

				if (node.characters[i] === '\n') {
					//if there's a new line?
					commitParagraph(i);
					ps.push(`<br key="${`br${i}`}" />`);
					continue;
				}

				if (idx == null) idx = 0;
				if (idx !== currStyle) {
					//hits commitParagraph every time the style changes?
					commitParagraph(i);
					currStyle = idx;
				}

				para += node.characters[i]; //adds to para, this is what gets committed
			}
			commitParagraph('end'); //after all characters

			content = ps;
			// } else {
			// 	content = node.characters;
			// }

			// could adjust this to pick up links?
			if (node.name.substring(0, 7) === 'http://') {
				content = [
					`<a href="${node.name}" >
					${node.characters} 
					</a>`,
				];
			}
		}

		function printDiv(styles, outerStyle, indent) {
			print(`  <div`, indent);
			print(`    id="${node.id}"`, indent);
			print(`    style="${JSToCSS(styles) + JSToCSS(outerStyle)}"`, indent);
			print(`    className="${innerClass}"`, indent);
			print(`  >`, indent);
		}

		//here's where it starts printing
		//here's where it starts printing
		//here's where it starts printing
		//here's where it starts printing
		//here's where it starts printing
		//here's where it starts printing
		if (parent != null) {
			printDiv(styles, outerStyle, indent);
		} else {
			print(
				`<section class="frame" style="
				${JSToCSS(styles)} width:100%; height:100%; display:block;" >`,
				indent
			);
		}
		//above just prints the beginning

		if (node.id !== component.id && node.name.charAt(0) === '#') {
			//if this is a new node?
			createComponent(node, svgMap, imageFills, componentMap); //recurse and hit again;
		} else if (node.type === 'VECTOR') {
			print(`<div className="vector"> ${svgMap[node.id]} </div>`, indent);
		} else {
			// let first = true;
			for (const child of minChildren) {
				//for each child, recurse into VisitNode
				visitNode(child, node, null, indent + '      ');
				// first = false; //set first after visitNode-ing each node
			}

			if (content != null) {
				for (const piece of content) {
					print(piece, indent + '      ');
				}
			}
		}

		//end of printing
		//end of printing
		if (parent != null) {
			print(`  </div>`, indent);
		} else {
			print(`</section>`, indent);
		}
		//end of visitNode;
	};

	visitNode(component, null, null, '  '); //here's where it runs that big ol function baybeee
	componentMap[component.id] = { instance, name, doc }; //adds component doc(printed html, basically) to componentMap
};

module.exports = { createComponent, colorString };
