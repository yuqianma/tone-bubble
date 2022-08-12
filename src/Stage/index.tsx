import { useRef, useEffect } from "react";
import { createSketchBubble, createSketchBubbleForGlass } from "../sketches";
import p5 from "p5";

import "./index.css";

const query = new URLSearchParams(window.location.search);
console.log(query.get("sketch"));

export const Stage = () => {
	const domRef = useRef<HTMLDivElement>(null);
	const sketchRef = useRef<p5 | null>(null);
	useEffect(() => {
		const dom = domRef.current;
		if (dom && !sketchRef.current) {
			if (query.get("sketch") === "sats") {
				sketchRef.current = createSketchBubbleForGlass(dom);
			} else {
				sketchRef.current = createSketchBubble(dom);
			}
		}
	}, []);

	return (<div className="stage" ref={domRef}></div>);
};

if (import.meta.hot) {
	import.meta.hot.on("vite:beforeUpdate", () => {
		import.meta.hot!.invalidate();
	});
}
