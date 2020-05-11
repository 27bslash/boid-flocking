let flock = [],
  predators = [],
  numOfBoids = 200,
  numOfPredators = 0,
  fovRads = 360,
  fovDegrees = 360,
  debugging = false,
  vFlocking = false,
  walls = false,
  lastLoop = new Date(),
  boundary,
  qt,
  dropdown = false,
  quadTreeVisuals = false;
function setup() {
  createCanvas(1600, 900);
  frameRate(60);
  for (let i = 0; i < numOfBoids; i++) {
    flock.push(new Boid(random(100, width - 100), random(100, height - 100)));
  }
  for (let i = 0; i < numOfPredators; i++) {
    predators.push(new Predator(random(width), random(height)));
  }
}
function dropDown() {
  dropdown = !dropdown;
  document.getElementById("control").classList.toggle("show");
  let c = document.getElementById("control").children;
  for (item of c) {
    console.log(item);
    let ic = item.children;
    item.classList.toggle("show");
    for (let j of ic) {
      j.classList.toggle("show");
    }
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
    case "grid":
      quadTreeVisuals = !quadTreeVisuals;
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
  }
}
function fovChange(val) {
  fovDegrees = val;
  fovRads = 2 * PI - fovDegrees * (PI / 180);
  console.log(fovRads);
}
function addBoids(val) {
  numOfBoids = val;
  while (flock.length < numOfBoids) {
    let boid = new Boid(random(100, width - 100), random(100, height - 100));
    flock.push(boid);
  }
  while (flock.length > numOfBoids) {
    flock.pop();
  }
  document.getElementById("boidSlider").value = flock.length;
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
  if (!dropdown) {
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
      if (flock.length < 500) {
        flock.push(new Boid(mouseX, mouseY));
        numOfBoids = flock.length;
      }
    }
  }
}
function controlPanel() {
  // fovDegrees = (2 * PI - fovRads) * 57.3;
  document.getElementById(
    "numOfBoids-label"
  ).textContent = `BOIDS: ${numOfBoids}`;
  document.getElementById("fov-label").textContent = `FOV: ${fovDegrees}`;
  document.getElementById(
    "predator-label"
  ).textContent = `Predators: ${numOfPredators}`;
}
function mouseDragged() {
  mousePressed();
}
function draw() {
  colorMode(RGB);
  background(0, 0, 0, 40);
  stroke(0, 255, 0);
  let thisLoop = new Date();
  let fps = 1000 / (thisLoop - lastLoop);
  lastLoop = thisLoop;
  fps = Math.floor(fps);
  boundary = new Rectangle(width / 2, height / 2, width / 2, height / 2);
  qt = new QuadTree(boundary);
  for (boid of flock) {
    let point = new Point(boid.pos.x, boid.pos.y, boid);
    qt.insert(point);
    for (pred of predators) {
      boid.flee(pred);
      pred.target(boid);
    }
  }
  for (pred of predators) {
    pred.run(predators);
    pred.flee(predators);
  }
  for (boid of flock) {
    boid.run(flock, qt);
  }
  document.getElementById("fps").textContent = `FPS: ${fps}`;
  controlPanel();
  if (quadTreeVisuals) {
    qt.show();
  }
}
