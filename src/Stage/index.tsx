import { useRef, useEffect } from "react";
import { createSketchBubble } from "../sketches";
import p5 from "p5";

import "./index.css";

export const Stage = () => {
	const domRef = useRef<HTMLDivElement>(null);
	const sketchRef = useRef<p5 | null>(null);
	useEffect(() => {
		const dom = domRef.current;
		if (dom && !sketchRef.current) {
			sketchRef.current = createSketchBubble(dom);
		}
	}, []);

	return (<div className="stage" ref={domRef}></div>);
};

if (import.meta.hot) {
	import.meta.hot.on("vite:beforeUpdate", () => {
		import.meta.hot!.invalidate();
	});
}
