import p5 from "p5";

const MAX_RADIUS = 100;

const sketchBubble = ( p: p5 ) => {

  const dragStartPos = { x: 0, y: 0 };

  const interactingCircle = {
    x: 0,
    y: 0,
    radius: 0,
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = () => {
    p.background(255);

    p.fill(220);
    p.circle(200, 200, 100);

    let { x, y, radius } = interactingCircle;
    if (radius) {
      p.fill(255, 255, 255, 100);
      p.stroke("#0bd");
      
      radius = Math.min(radius, MAX_RADIUS);
      p.circle(x, y, radius * 2);
    }
  };

  p.mousePressed = () => {
    interactingCircle.x = p.mouseX;
    interactingCircle.y = p.mouseY;
    interactingCircle.radius = 0;
    dragStartPos.x = p.mouseX;
    dragStartPos.y = p.mouseY;
  }

  p.mouseDragged = () => {
    const { x, y } = dragStartPos;
    const dx = p.mouseX - x;
    const dy = p.mouseY - y;
    interactingCircle.radius = Math.sqrt(dx * dx + dy * dy);
  }

  p.mouseReleased = () => {
    interactingCircle.radius = 0;
    // add one bubble
  }
};

export function createSketchBubble(node: HTMLElement) {
  if (node) {
    node.innerHTML = "";
  }
  let myp5 = new p5(sketchBubble, node);
  (window as any).myp5 = myp5;
}
