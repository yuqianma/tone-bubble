import { useRef, useEffect } from "react";
import { createSketchBubble } from "../sketches";

import "./index.css";

export const Stage = () => {
	const domRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const dom = domRef.current;
		if (dom) {
			createSketchBubble(dom);
		}
	}, []);

	return (<div className="stage" ref={domRef}></div>);
};

if (import.meta.hot) {
	import.meta.hot.on("vite:beforeUpdate", () => {
		import.meta.hot!.invalidate();
	});
}
