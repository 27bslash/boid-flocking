let flock = [],
  predators = [],
  numOfBoids = 50,
  numOfPredators = 0,
  fovValue = 0,
  debugging = false,
  vFlocking = false,
  walls = false,
  lastLoop = new Date();
// TODO quadtree query
function setup() {
  createCanvas(900, 900);
  frameRate(60);
  for (let i = 0; i < numOfBoids; i++) {
    flock.push(new Boid(random(100, width - 100), random(100, height - 100)));
  }
  for (let i = 0; i < numOfPredators; i++) {
    predators.push(new Predator(random(width), random(height)));
  }
}
function clear() {}
function dropDown() {
  let c = document.getElementById("control").children;
  for (item of c) {
    item.classList.toggle("show");
  }
}
function toggle(x) {
  switch (x) {
    case "walls":
      walls = !walls;
      break;
    case "vf":
      vFlocking = !vFlocking;
      break;
    case "debug":
      debugToggle();
      break;
    default:
      break;
  }
}
function debugToggle() {
  flock = [];
  console.log("l", flock.length, numOfBoids);
  debugging = !debugging;
  if (debugging) {
    numOfBoids = 1;
    numOfPredators = 0;
  } else {
    numOfBoids = 100;
  }
  for (let i = 0; i < numOfBoids; i++) {
    let boid = new Boid(random(100, width - 100), random(100, height - 100));
    flock.push(boid);
    // qt.insert(boid);
  }
}
function fovChange(val) {
  fovValue = val;
}
function addPredators(val) {
  numOfPredators = val;
  if (predators.length < numOfPredators) {
    predators.push(new Predator(random(width), random(height)));
  } else if (predators.length > numOfPredators) {
    predators.pop();
  }
}
function mousePressed() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    if (flock.length <= numOfBoids + 50) {
      flock.push(new Boid(mouseX, mouseY));
    }
  }
}
function mouseDagged() {
  mousePressed();
}
function draw() {
  let thisLoop = new Date();
  let fps = 1000 / (thisLoop - lastLoop);
  lastLoop = thisLoop;
  fps = Math.floor(fps);
  colorMode(RGB);
  background(0, 0, 0, 20);
  noStroke();
  addPredators();
  let boundary = new Rectangle(width / 2, height / 2, width / 2, height / 2);
  let qt = new QuadTree(boundary);
  for (boid of flock) {
    boid.run(flock);
    qt.insert(boid.pos);
    qt.show();
    for (pred of predators) {
      boid.flee(pred);
      pred.target(boid);
    }
  }
  for (pred of predators) {
    pred.run(predators);
    pred.flee(predators);
  }

  document.getElementById("fps").textContent = `FPS: ${fps}`;
}
