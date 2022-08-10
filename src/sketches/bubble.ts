import p5 from "p5";
import * as Tone from "tone";
import { app, db, collectionRef } from "../firebaseApp";
import { onSnapshot, query, where, addDoc } from "firebase/firestore";

interface Point {
  x: number;
  y: number;
  ratio: number;
  time: number;
};

// interaction limits
const MIN_RADIUS = 5;
const MIN_RADIUS_RATIO = 0.01;
const MAX_RADIUS_RATIO = 0.1;
const MIN_RATIO = 0.1; // duration

const ATTACK_LINE_Y_RATIO = 0.2;

const MAX_PRESS_TIME = 2 * 1000;
const BUBBLING_TIME = 5 * 1000;
const CONSUMING_TIME = 1 * 1000;

const Notes = [
  "C3", "D3", "E3", "F3", "G3", "A3", "B3",
  "C4", "D4", "E4", "F4", "G4", "A4", "B4",
];

const synth = new Tone.Synth().toDestination();

(window as any).Tone = Tone;
(window as any).synth = synth;

const sketchBubble = ( p: p5 ) => {

  const width = p.windowWidth;
  const height = p.windowHeight;

  const attackLineY = height * ATTACK_LINE_Y_RATIO;

  const spaceWidth = width;
  const spaceHeight = height - attackLineY;

  const maxPressTime = MAX_PRESS_TIME;
  const bubblingTime = BUBBLING_TIME;
  const consumingTime = CONSUMING_TIME;

  const length = Math.min(spaceWidth, spaceHeight);
  const minRadius = Math.max(length * MIN_RADIUS_RATIO, MIN_RADIUS);
  const maxRadius = length * MAX_RADIUS_RATIO;

  const interactingCircle = {
    x: 0,
    y: 0,
    ratio: 0,
    startTime: 0,
  };

  let pointsToConsume: Point[] = [];
  let consumingPoints: Point[] = [];

  let unsubscribe: () => void; 
  const listen = () => {
    if (unsubscribe) {
      unsubscribe();
    }
    const q = query(collectionRef, where("time", ">", Date.now() - 10 * 1000));
    unsubscribe = onSnapshot(q, (querySnapshot) => {
      const points: any[] = [];
      querySnapshot.forEach((doc) => {
          points.push(doc.data());
      });
      console.log("Current", points);
      pointsToConsume = points;
    });
  }

  // update every 10s to prevent getting old data
  setInterval(listen, 10 * 1000);

  async function addPoint(point: Point) {
    const docRef = await addDoc(collectionRef, point);
    console.log("Document written with ID: ", docRef.id);
  }

  p.setup = () => {
    p.createCanvas(width, height);
  };

  p.draw = () => {
    p.background(255);

    // attack line
    p.stroke("#ccc");
    p.strokeWeight(2);
    p.line(0, attackLineY, width, attackLineY);

    // Notes
    p.textAlign(p.CENTER, p.CENTER);
    p.fill("#aaa");
    p.strokeWeight(1);
    const colWidth = spaceWidth / Notes.length;
    for (let i = 0; i < Notes.length; i++) {
      const note = Notes[i];
      const x = colWidth * i;
      const y = attackLineY;
      p.line(x, y, x, y + spaceHeight);
      p.text(note, x + colWidth / 2, y + spaceHeight - 30);
    }

    p.noStroke();
    // p.fill(220);
    // p.circle(200, 200, 100);

    const now = Date.now();

    const nextPointsToConsume: Point[] = [];
    const nextConsumingPoints: Point[] = [];

    pointsToConsume.forEach((point) => {
      if (getPointTimeLeftToAttack(now, point) <= 0) {
        nextConsumingPoints.push(point);
        // tone
        const c = Notes[point.x * Notes.length | 0];
        const duration = getPointConsumingTimeLeft(now, point) / 1000;
        if (duration > 0) {
          console.log(c, duration);
          try {
            synth.triggerAttackRelease(c, duration);
          } catch (e) {
            // seems it cannot attack multiple notes if they are coming too close
          }
        }
      } else {
        nextPointsToConsume.push(point);
      }
    });

    pointsToConsume = nextPointsToConsume;

    pointsToConsume.forEach((point) => {
      const y = getPointCurrentYRatio(now, point);
      const fillColor = getCircleColor(point.ratio);
      p.fill(fillColor);
      drawCircle(point.x, y, point.ratio);
    });

    consumingPoints.forEach((point) => {
      const consumingTimeLeft = getPointConsumingTimeLeft(now, point);
      if (consumingTimeLeft > 0) {
        const fillColor = getCircleColor(point.ratio);
        p.fill(fillColor);
        drawCircle(point.x, 0, point.ratio * consumingTimeLeft / consumingTime);
        nextConsumingPoints.push(point);
      } 
    });

    consumingPoints = nextConsumingPoints;

    if (p.mouseIsPressed) {
      mousePressing();
      p.fill(100, 100, 100, 100);
      p.stroke("#0bd");
    } else {
      p.fill(100, 100, 100, 100);
      p.fill("#0bd");
      // p.noStroke();
    }

    let { x, y, ratio } = interactingCircle;
    if (ratio) {
      drawCircle(x, y, ratio);
    }
  };

  p.mousePressed = (e) => {
    if (interactingCircle.startTime) {
      return;
    }
    if (p.mouseY < attackLineY) {
      return;
    }
    interactingCircle.x = p.mouseX / spaceWidth;
    interactingCircle.y = (p.mouseY - attackLineY) / spaceHeight;
    interactingCircle.ratio = MIN_RATIO;
    interactingCircle.startTime = Date.now();
  }

  function mousePressing() {
    if (!interactingCircle.startTime) {
      return;
    }
    const delta = (Date.now() - interactingCircle.startTime) / maxPressTime;
    interactingCircle.ratio = Math.min(interactingCircle.ratio + delta, 1);
  }

  p.mouseReleased = (e) => {
    if (!interactingCircle.startTime) {
      return false;
    }
    const newPoint = {
      x: interactingCircle.x,
      y: interactingCircle.y,
      ratio: interactingCircle.ratio,
      time: Date.now(),
    };

    addPoint(newPoint);

    interactingCircle.ratio = 0;
    interactingCircle.startTime = 0;

    return false;
  }

  function getCircleColor(ratio: number) {
    const fillColor = p.color(`hsl(${(ratio * 360 + 180) % 360  | 0}, 60%, 70%)`);
    fillColor.setAlpha(100);
    return fillColor;
  }

  function drawCircle(xRatio: number, yRatio: number, ratio: number) {
    const radius = p.map(ratio, 0, 1, 0, maxRadius);
    p.circle(xRatio * spaceWidth, yRatio * spaceHeight + attackLineY, radius * 2);
  }

  function getPointTimeLeftToAttack(now: number, point: Point) {
    const initTimeLeft = point.y * bubblingTime;
    const timeLeft = initTimeLeft - (now - point.time);
    return timeLeft;
  }

  function getPointConsumingTimeLeft(now: number, point: Point) {
    const attackTimeLeft = getPointTimeLeftToAttack(now, point);
    const attackTimePassed = - attackTimeLeft;
    const initConsumingTimeLeft = point.ratio * consumingTime;
    return initConsumingTimeLeft - attackTimePassed;
  }

  function getPointCurrentYRatio(now: number, point: Point) {
    const timeLeft = getPointTimeLeftToAttack(now, point);
    return timeLeft / bubblingTime;
  }

};

let instance: p5;

export function createSketchBubble(node: HTMLElement) {
  if (instance) {
    instance.remove();
  }
  if (node) {
    node.innerHTML = "";
  }
  instance = new p5(sketchBubble, node);
  // for debug
  (window as any).myp5 = instance;
  return instance;
}
