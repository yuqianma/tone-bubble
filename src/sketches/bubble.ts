import p5 from "p5";
import * as Tone from "tone";

interface Point {
  x: number;
  y: number;
  radius: number;
  time: number;
};

// interaction limits
const MIN_RADIUS = 5;
const MAX_RADIUS = 100;

const MAX_PRESS_TIME = 2000;

const Chords = ["C3", "D3", "E3", "F3", "G3", "A4", "B4"];

const synth = new Tone.Synth().toDestination();

const sketchBubble = ( p: p5 ) => {

  const width = p.windowWidth;
  const height = p.windowHeight;
  const attackLineY = 200;

  const spaceWidth = width;
  const spaceHeight = height - attackLineY;

  const bubblingTime = 5 * 1000;
  const consumingTime = 2 * 1000;

  const pressStartInfo = { x: 0, y: 0, startTime: 0 };

  const interactingCircle = {
    x: 0,
    y: 0,
    radius: 0,
  };

  let pointsToConsume: Point[] = [];
  let consumingPoints: Point[] = [];

  p.setup = () => {
    p.createCanvas(width, height);
  };

  p.draw = () => {
    p.background(255);

    p.stroke("#ccc");
    p.strokeWeight(2);
    p.line(0, attackLineY, width, attackLineY);

    p.strokeWeight(1);
    // p.fill(220);
    // p.circle(200, 200, 100);

    const now = Date.now();

    const nextPointsToConsume: Point[] = [];
    const nextConsumingPoints: Point[] = [];

    pointsToConsume.forEach((point) => {
      if (getPointTimeLeftToAttack(now, point) <= 0) {
        nextConsumingPoints.push(point);
        // tone
        const duration = getPointConsumingTimeLeft(now, point);
        const c = Chords[point.x / width * 7 | 0];
        // console.log(c, duration);
        synth.triggerAttackRelease(c, duration);
      } else {
        nextPointsToConsume.push(point);
      }
    });

    pointsToConsume = nextPointsToConsume;

    pointsToConsume.forEach((point) => {
      p.fill(100, 100, 100, 100);
      const y = getPointCurrentY(now, point);
      p.circle(point.x, y, point.radius * 2 * MAX_RADIUS);
    });

    consumingPoints.forEach((point) => {
      p.fill(50, 50, 50, 100);
      const consumingTimeLeft = getPointConsumingTimeLeft(now, point);
      const radius = consumingTimeLeft / consumingTime;
      p.circle(point.x, attackLineY, radius * 2 * MAX_RADIUS);
      if (consumingTimeLeft > 0) {
        nextConsumingPoints.push(point);
      }
    });

    consumingPoints = nextConsumingPoints;

    if (p.mouseIsPressed) {
      mousePressing();
      const fillColor = p.color("#0bd");
      fillColor.setAlpha(100);
      p.fill(fillColor);
      p.stroke("#0bd");
    } else {
      p.fill("#0bd");
      p.noStroke();
    }

    // p.noStroke();

    let { x, y, radius } = interactingCircle;
    if (radius) {
      p.circle(x, y, radius * 2);
    }
  };

  p.mousePressed = () => {
    interactingCircle.x = p.mouseX;
    interactingCircle.y = p.mouseY;
    interactingCircle.radius = MIN_RADIUS;
    pressStartInfo.x = p.mouseX;
    pressStartInfo.y = p.mouseY;
    pressStartInfo.startTime = Date.now();
  }

  function mousePressing() {
    const delta = (Date.now() - pressStartInfo.startTime) / MAX_PRESS_TIME * MAX_RADIUS;
    interactingCircle.radius = Math.min(interactingCircle.radius + delta, MAX_RADIUS);
  }

  p.mouseReleased = () => {
    pointsToConsume.push({
      x: interactingCircle.x,
      y: interactingCircle.y,
      radius: interactingCircle.radius / MAX_RADIUS,
      time: Date.now(),
    });

    interactingCircle.radius = 0;
  }

  function getPointTimeLeftToAttack(now: number, point: Point) {
    const initTimeLeft = (point.y - attackLineY) / spaceHeight * bubblingTime;
    const timeLeft = initTimeLeft - (now - point.time);
    return timeLeft;
  }

  function getPointConsumingTimeLeft(now: number, point: Point) {
    const attackTimeLeft = getPointTimeLeftToAttack(now, point);
    const attackTimePassed = - attackTimeLeft;
    const initConsumingTimeLeft = point.radius * consumingTime;
    return initConsumingTimeLeft - attackTimePassed;
  }

  function getPointCurrentY(now: number, point: Point) {
    const timeLeft = getPointTimeLeftToAttack(now, point);
    const y = attackLineY + timeLeft / bubblingTime * spaceHeight;
    return y;
  }

};

export function createSketchBubble(node: HTMLElement) {
  if (node) {
    node.innerHTML = "";
  }
  let myp5 = new p5(sketchBubble, node);
  (window as any).myp5 = myp5;
}
