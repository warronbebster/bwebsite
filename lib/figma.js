// @ts-nocheck
const fs = require("fs");
const https = require("https");

function saveImageToDisk(url, localPath) {
	//writes images to disk
	const file = fs.createWriteStream(localPath);
	const request = https.get(url, function (response) {
		response.pipe(file);
	});
}

function colorString(fill) {
	return `rgba(${Math.round(fill.color.r * 255)}, ${Math.round(fill.color.g * 255)}, ${Math.round(
		fill.color.b * 255
	)}, ${fill.opacity ? fill.opacity : fill.color.a})`;
}

function dropShadow(effect) {
	return `${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${colorString(effect)}`;
}

function innerShadow(effect) {
	return `inset ${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${colorString(
		effect
	)}`;
}

function backgroundSize(scaleMode) {
	if (scaleMode === "FILL") {
		return "cover";
	}
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
			return `${colorString(stop)} ${Math.round(stop.position * 100)}%`;
		})
		.join(", ");
	return `linear-gradient(${angle}rad, ${stops})`;
}

function paintToRadialGradient(paint) {
	const stops = paint.gradientStops
		.map((stop) => {
			return `${colorString(stop)} ${Math.round(stop.position * 60)}%`;
		})
		.join(", ");

	return `radial-gradient(${stops})`;
}

function JSToCSS(JS) {
	let cssString = "";
	const addPx = [
		"minHeight",
		"minWidth",
		"height",
		"width",
		"left",
		"right",
		"top",
		"bottom",
		"fontSize",
	];
	if (typeof JS === "object" && JS !== null) {
		for (let objectKey in JS) {
			cssString +=
				objectKey.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`) +
				": " +
				JS[objectKey] +
				//add "px" to end if it's one of the above types and is a number
				(addPx.includes(objectKey) && !isNaN(JS[objectKey]) ? "px" : "") +
				"; ";
		}

		return cssString;
	} else {
		return "";
	}
}

function containsHyperlink(checkNode) {
	if (
		checkNode.hasOwnProperty("style") &&
		"hyperlink" in checkNode.style &&
		checkNode.style.hyperlink.type == "URL"
	) {
		//if node has hyperlink as style
		return true;
	} else {
		if (
			checkNode.hasOwnProperty("styleOverrideTable") &&
			Object.keys(checkNode.styleOverrideTable).length !== 0
		) {
			//if there are things in styleOverrideTable
			for (const key of Object.keys(checkNode.styleOverrideTable)) {
				if (
					"hyperlink" in checkNode.styleOverrideTable[key] &&
					checkNode.styleOverrideTable[key].hyperlink.type == "URL"
				) {
					return true;
					break;
				}
			}
		} else {
			return false; //if it doesn't hit a hyperlink
		}
	}
}

function checkForLinksRecursive(checkNodeRecursive, found = []) {
	if (containsHyperlink(checkNodeRecursive)) {
		found.push(checkNodeRecursive);
	} else if (checkNodeRecursive.hasOwnProperty("children")) {
		for (childNode in checkNodeRecursive.children) {
			checkForLinksRecursive(checkNodeRecursive.children[childNode], found);
		}
	}
	return found;
}

//EXPANDCHILDREN STARTS HERE
function expandChildren(node, parent, minChildren, offset) {
	const children = node.children;
	let added = offset;

	if (children) {
		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			child.order = i + added;
			minChildren.push(child);
		}
		return added + children.length - offset;
	}
	return added - offset;
}

const createComponent = (component, imageFills, componentMap) => {
	const name = component.name.replace(/\W+/g, "");
	const instance = name + component.id.replace(";", "S").replace(":", "D");

	let doc = ""; //text to eventually add to file
	let artboardSize = { x: 360, y: 720 }; //default sizing

	function print(msg, indent) {
		//just a function to add something to 'doc'
		doc += `${msg}`;
	}

	//VISITNODE STARTS HERE
	//VISITNODE STARTS HERE

	const visitNode = (node, parent, lastVertical, indent) => {
		//i think this function visits nodes and builds an object
		//to be transferred to html/css/written to file
		let content = null;
		const styles = {};
		let minChildren = [];
		let bounds = null;
		let relativeTransform = null;

		if (parent != null) {
			//if this node is a child node
			relativeTransform = node.relativeTransform;

			const parentSize = parent.size;

			bounds = {
				left: relativeTransform[0][2],
				right: parentSize.x - (relativeTransform[0][2] + node.size.x),
				top: relativeTransform[1][2],
				bottom: parentSize.y - (relativeTransform[1][2] + node.size.y),
				//i could do some smartness here to only set based on this "size" variable if node has it
				width: node.size.x,
				height: node.size.y,
			};

			if (parent.name.startsWith("!")) {
				//if it's a top-level object in an artboard
				if (checkForLinksRecursive(node).length > 0) {
					//if any child has a link
					styles.zIndex = 21; //set the z-index higher than buttons
				}
			}
		} else {
			//if it's the first child; aka first level frame in Figma with !
			artboardSize = node.size;
		}

		//this runs that function above
		expandChildren(node, parent, minChildren, 0);
		//adds children to the object?

		const cHorizontal = node.constraints && node.constraints.horizontal;
		const cVertical = node.constraints && node.constraints.vertical;

		//if there is any rotation or matrix transform
		if (node.relativeTransform[0][0] !== 1) {
			styles.transform =
				"matrix(" +
				node.relativeTransform[0][0] +
				"," +
				node.relativeTransform[1][0] +
				"," +
				node.relativeTransform[0][1] +
				"," +
				node.relativeTransform[1][1] +
				",0,0)";
			styles.transformOrigin = "0% 0%";
		}

		if (cHorizontal === "LEFT_RIGHT") {
			if (bounds != null) {
				styles.position = "absolute";
				styles.left = bounds.left;
				styles.right = bounds.right;
				styles.flexGrow = 1;
			}
		} else {
			//if it's got width and isn't stuck to left and right
			if (bounds && bounds.width) {
				if (node.type === "TEXT" && node.style.textAutoResize) {
					if (node.style.textAutoResize !== "WIDTH_AND_HEIGHT") {
						//if it's an auto resize
						styles.width = bounds.width;
					}
				} else {
					// styles.width = bounds.width;
					if (!node.layoutMode) {
						//if it's not auto layout
						styles.width = bounds.width;
					} else if (node.layoutMode == "VERTICAL" && node.counterAxisSizingMode == "FIXED") {
						//if it's vertical auto layout and vertical is fixed
						styles.width = bounds.width;
					} else if (node.layoutMode == "HORIZONTAL" && node.primaryAxisSizingMode == "FIXED") {
						//if it's horizontal auto layout and vertical is fixed
						styles.width = bounds.width;
					}
				}
			}
			if (cHorizontal === "RIGHT" && bounds != null) {
				styles.position = "absolute";
				styles.right = bounds.right;
				// styles.minWidth = bounds.width;
			} else if (cHorizontal === "CENTER") {
				styles.position = "absolute";
				styles.left =
					"calc(50% - " +
					bounds.width / 2 +
					"px - " +
					// ((artboardSize.x - bounds.width) / 2 - bounds.left) +
					((parent.size.x - bounds.width) / 2 - bounds.left) +
					"px)";
			} else if (cHorizontal === "SCALE" && bounds != null) {
				const parentWidth = bounds.left + bounds.width + bounds.right;
				styles.width = `${(bounds.width * 100) / parentWidth}%`;
				styles.left = `${(bounds.left * 100) / parentWidth}%`;
			} else if (bounds != null) {
				// styles.marginLeft = bounds.left;
				styles.position = "absolute";
				styles.left = bounds.left;
				// styles.width = bounds.width;
				// styles.minWidth = bounds.width;
			}
		}

		if (cVertical === "TOP_BOTTOM") {
			//if it's stuck to the bottom & top
			if (bounds != null) {
				styles.top = bounds.top;
				styles.bottom = bounds.bottom;
			}
		} else {
			if (bounds && bounds.height) {
				if (!node.layoutMode) {
					//if it's not auto layout
					styles.height = bounds.height;
				} else if (node.layoutMode == "VERTICAL" && node.primaryAxisSizingMode == "FIXED") {
					//if it's vertical auto layout and vertical is fixed
					styles.height = bounds.height;
				} else if (node.layoutMode == "HORIZONTAL" && node.counterAxisSizingMode == "FIXED") {
					//if it's horizontal auto layout and vertical is fixed
					styles.height = bounds.height;
				}
			}

			if (cVertical === "CENTER") {
				styles.position = "absolute";
				styles.top =
					"calc(50% - " +
					bounds.height / 2 +
					"px - " +
					((parent.size.y - bounds.height) / 2 - bounds.top) +
					"px)";
			} else if (cVertical === "SCALE" && bounds != null) {
				//this seems chaotic; probably better to do with pos. absolute and setting all sides
				const parentHeight = bounds.top + bounds.height + bounds.bottom;
				styles.height = `${(bounds.height * 100) / parentHeight}%`;
				styles.top = `${(bounds.top * 100) / parentHeight}%`;
			} else if (cVertical === "TOP" && bounds != null) {
				styles.position = "absolute";
				styles.top = bounds.top;
			} else if (cVertical === "BOTTOM" && bounds != null) {
				styles.position = "absolute";
				styles.bottom = bounds.bottom;
			}
		}

		//if last 4 letters are .mp4
		if (node.name.slice(node.name.length - 4) == ".mp4") {
			styles.overflow = "hidden";
		}

		//if it's auto layout parent
		if (node.layoutMode) {
			styles.display = "flex";

			if (node.layoutMode == "HORIZONTAL") {
				styles.flexDirection = "row";
			} else if (node.layoutMode == "VERTICAL") {
				styles.flexDirection = "column";
			}

			styles.padding =
				node.paddingTop +
				"px " +
				node.paddingRight +
				"px " +
				node.paddingBottom +
				"px " +
				node.paddingLeft +
				"px";

			//primary axis
			if (node.primaryAxisAlignItems == "SPACE_BETWEEN") {
				styles.justifyContent = "space-between";
			} else if (node.primaryAxisAlignItems == "CENTER") {
				styles.justifyContent = "center";
			} else if (node.primaryAxisAlignItems == "MAX") {
				styles.justifyContent = "flex-end";
			} else {
				styles.justifyContent = "flex-start";
			}

			//secondary axis
			if (node.counterAxisAlignItems == "CENTER") {
				styles.alignItems = "center";
			} else if (node.counterAxisAlignItems == "MAX") {
				styles.alignItems = "flex-end";
			} else {
				styles.alignItems = "flex-start";
			}
		}

		//if it's auto layout child
		if (node.layoutAlign) {
			styles.flex = "none";
			styles.position = "static";
			if (node.layoutAlign == "MIN") {
				styles.alignSelf = "flex-start";
			} else if (node.layoutAlign == "CENTER") {
				styles.alignSelf = "center";
			} else if (node.layoutAlign == "MAX") {
				styles.alignSelf = "flex-end";
			} else if (node.layoutAlign == "STRETCH") {
				styles.alignSelf = "stretch";
			}

			styles.flexGrow = node.layoutGrow;

			if (
				parent.itemSpacing &&
				parent.itemSpacing !== 0 &&
				parent.primaryAxisAlignItems !== "SPACE_BETWEEN"
			) {
				//if parent has item spacing…
				//and it's not the last item…
				// console.log(parent.children.length + ' ' + parent.children.indexOf(node));
				if (parent.children.indexOf(node) < parent.children.length - 1) {
					parent.layoutMode == "HORIZONTAL"
						? (styles.marginRight = parent.itemSpacing + "px")
						: (styles.marginBottom = parent.itemSpacing + "px");
				}
			}
		}

		node.opacity ? (styles.opacity = node.opacity) : null;

		if (
			["FRAME", "RECTANGLE", "INSTANCE", "COMPONENT", "ELLIPSE", "GROUP"].indexOf(node.type) >= 0
		) {
			if (node.clipsContent) styles.overflow = "hidden";

			const lastFill = getPaint(node.fills);
			if (lastFill) {
				if (lastFill.type === "SOLID") {
					styles.backgroundColor = colorString(lastFill);
					// lastFill.opacity !== undefined ? (styles.opacity = lastFill.opacity) : null;
				} else if (lastFill.type === "IMAGE") {
					saveImageToDisk(imageFills[lastFill.imageRef], "./docs/images/" + node.name);
					styles.backgroundImage = "url(./images/" + node.name + ")";
					styles.backgroundSize = backgroundSize(lastFill.scaleMode);
					styles.backgroundPosition = "center";
				} else if (lastFill.type === "GRADIENT_LINEAR") {
					styles.background = paintToLinearGradient(lastFill);
				} else if (lastFill.type === "GRADIENT_RADIAL") {
					styles.background = paintToRadialGradient(lastFill);
				}
			}

			if (node.effects) {
				for (let i = 0; i < node.effects.length; i++) {
					const effect = node.effects[i];
					if (effect.type === "DROP_SHADOW") {
						styles.boxShadow = dropShadow(effect);
					} else if (effect.type === "INNER_SHADOW") {
						styles.boxShadow = innerShadow(effect);
					} else if (effect.type === "LAYER_BLUR") {
						styles.filter = `blur(${effect.radius}px)`;
					}
				}
			}

			const lastStroke = getPaint(node.strokes);
			if (lastStroke) {
				if (lastStroke.type === "SOLID") {
					const weight = node.strokeWeight || 1;
					styles.border = `${weight}px solid ${colorString(lastStroke)}`;
				}
			}
			if (node.type === "ELLIPSE") {
				styles.borderRadius = "50%";
			} else {
				console.dir(node.cornerRadius)
				const cornerRadii = node.cornerRadius;
				if (
					cornerRadii 
					// &&
					// cornerRadii.length === 4 &&
					// cornerRadii[0] + cornerRadii[1] + cornerRadii[2] + cornerRadii[3] > 0
				) {
					styles.borderRadius = `${cornerRadii}px`;
				}
			}
		} else if (node.type === "TEXT") {
			const lastFill = getPaint(node.fills);
			if (lastFill) {
				styles.color = colorString(lastFill);
			}

			const lastStroke = getPaint(node.strokes);
			if (lastStroke) {
				const weight = node.strokeWeight || 1;
				styles.WebkitTextStroke = `${weight}px ${colorString(lastStroke)}`;
			}

			const applyFontStyle = (_styles, fontStyle) => {
				if (fontStyle) {
					if (fontStyle.fontSize) _styles.fontSize = fontStyle.fontSize;
					if (fontStyle.fontWeight) _styles.fontWeight = fontStyle.fontWeight;
					if (fontStyle.fontFamily) _styles.fontFamily = fontStyle.fontFamily;
					_styles.fontFamily += ", IBM Plex Sans, sans-serif";
					if (fontStyle.textAlignHorizontal)
						_styles.textAlign = fontStyle.textAlignHorizontal.toLowerCase();
					_styles.fontStyle = fontStyle.italic ? "italic" : "normal";
					if (fontStyle.lineHeightPercent)
						_styles.lineHeight = `${fontStyle.lineHeightPercent * 1.25}%`;
					if (fontStyle.letterSpacing) _styles.letterSpacing = `${fontStyle.letterSpacing}px`;
					if (fontStyle.textDecoration == "UNDERLINE") {
						_styles.textDecorationLine = "underline";
					} else if (fontStyle.textDecoration == "STRIKETHROUGH") {
						_styles.textDecorationLine = "line-through";
					}
				}
			};
			applyFontStyle(styles, node.style); //this takes the fontStyle and applies it to 'styles' object

			//could do this with the title of the node tbh

			let para = "";
			const ps = []; //this holds the content?

			const styleCache = {};
			let currStyle = 0;

			const commitParagraph = (key) => {
				if (para !== "") {
					if (styleCache[currStyle] == null && currStyle !== 0) {
						styleCache[currStyle] = {};
						applyFontStyle(styleCache[currStyle], node.styleOverrideTable[currStyle]);
						const inlineFill = getPaint(node.styleOverrideTable[currStyle].fills);
						if (inlineFill) {
							styleCache[currStyle].color = colorString(inlineFill);
						}
					}

					const styleOverride = styleCache[currStyle] ? styleCache[currStyle] : {};

					Object.keys(styleOverride).length > 0 //if there are style overrides
						? "hyperlink" in node.styleOverrideTable[currStyle] &&
						  node.styleOverrideTable[currStyle].hyperlink.type == "URL" //if hyperlink exists in overrides
							? ps.push(
									`<span style="${JSToCSS(styleOverride)}" key="${key}"> <a href="${
										node.styleOverrideTable[currStyle].hyperlink.url
									}">` +
										para +
										`</a></span>`
							  )
							: ps.push(`<span style="${JSToCSS(styleOverride)}" key="${key}">${para}</span>`)
						: "hyperlink" in node.style && node.style.hyperlink.type == "URL" //if hyperlink exists
						? ps.push(`<span key="${key}"><a href="${node.style.hyperlink.url}">${para}</a></span>`)
						: ps.push(`<span key="${key}">${para}</span>`);
					//add a span to ps, then reset para
					para = "";
				}
			};

			for (const i in node.characters) {
				let idx = node.characterStyleOverrides[i]; //

				if (node.characters[i] === "\n") {
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
			commitParagraph("end"); //after all characters

			content = ps;
		}

		function printDiv(styles, indent) {
			//this is really "print div opening tag "
			print(`<div`, indent);
			print(` id="${node.id}"`, indent);
			print(` style="${JSToCSS(styles)}"`, indent);
			print(`>`, indent);
		}

		//PRINTING STARTS HERE
		//PRINTING STARTS HERE
		//PRINTING STARTS HERE

		//PRINT OPENING TAG:
		if (parent != null) {
			//if it's not the top layer
			if (!["VECTOR", "REGULAR_POLYGON", "LINE", "STAR"].includes(node.type))
				//if it's not a vector
				printDiv(styles, indent);
		} else {
			//if it is the top layer
			print(
				`<section class="frame" style="${JSToCSS(
					styles
				)} width:100%; height:100%; display:block;" >`,
				indent
			);
		}

		//PRINT CONTENT:
		if (node.id !== component.id && node.name.charAt(0) === "!") {
			//if this is a new top-level node?
			createComponent(node, imageFills, componentMap); //recurse and hit again;
		} else if (["VECTOR", "REGULAR_POLYGON", "LINE", "STAR"].includes(node.type)) {
			// print(`<div className="vector"> ${svgMap[node.id]} </div>`, indent);
			print(
				`<svg preserveAspectRatio="none" width="${node.size.x}" height="${
					node.size.y
				}" style="${JSToCSS(styles)}" viewBox="0 0 ${node.size.x} ${
					node.size.y
				}" xmlns="http://www.w3.org/2000/svg"> <path d="${
					node.fills.length > 0 ? node.fillGeometry[0].path : node.strokeGeometry[0].path
				}" fill="${node.fills.length > 0 ? colorString(getPaint(node.fills)) : ""}" stroke="${
					node.strokes.length > 0 ? colorString(getPaint(node.strokes)) : ""
				}" stroke-width="${node.strokeWeight || 1}"></path></svg>`,
				indent
			);
			//PRINT THE SVG HERE BAYBEEEE
			//maybe do multiple paths for vectors with multiple paths idk
		} else {
			//if it's not a vector or a first layer
			for (const child of minChildren) {
				//for each child, recurse into VisitNode
				visitNode(child, node, null, indent);
			}

			if (content != null) {
				for (const piece of content) {
					print(piece, indent);
				}
			}

			if (node.name.slice(node.name.length - 4) == ".mp4") {
				//if last 4 letters are .mp4
				print(
					`<video autoplay loop muted style="width: 100%; height: auto; position: absolute; top: 50%; left: 50%; transform: translateX(-50%) translateY(-50%)">`,
					indent
				);
				print('<source src="./videos/' + node.name + '" type="video/mp4"/>', indent);
				print(
					"Your browser does not support the video tag. I suggest you upgrade your browser.",
					indent
				);
				print(`</video>`, indent);
				console.log(node.name);
			}
		}

		//PRINT CLOSING TAG
		if (parent != null) {
			if (!["VECTOR", "REGULAR_POLYGON", "LINE", "STAR"].includes(node.type))
				print(`</div>`, indent);
		} else {
			print(`</section>`, indent);
		}
		//end of visitNode;
	};

	visitNode(component, null, null, " "); //here's where it runs that big ol function baybeee
	componentMap[component.id] = { instance, name, doc }; //adds component doc(printed html, basically) to componentMap
};

module.exports = { createComponent };
