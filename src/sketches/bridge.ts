const query = new URLSearchParams(window.location.search);
const isController = query.has("controller");
console.log("isController", isController);

console.log(import.meta.env.VITE_WS_URL);

declare global {
	interface Window {
		_pause: boolean;
	}
}

class Bridge {
	ws?: WebSocket;
	constructor() {
		if (isController) {
			const ws = new WebSocket(import.meta.env.VITE_WS_URL);
			console.log(ws);
			this.ws = ws;
			ws.onopen = () => {
				console.log("ws open");
			}
		}
	}

	hit(num: number) {
		console.log(num);
		this.hitToAngle(num, 110);
	}

	hitToAngle(num: number, angle: number, duration = 50) {
		// $mode,servoNum,hitAngle,duration
		return this.send(`$2,${num},${angle},${duration},`);
	}

	async send(msg: string) {
		if (!isController) {
			return;
		}
		if (window._pause) {
			return;
		}
		this.ws?.send(msg);
	}
}

export const bridge = new Bridge();
