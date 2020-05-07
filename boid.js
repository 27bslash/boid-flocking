class Boid {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.r = 3;
    this.velocity = p5.Vector.random2D();
    this.acceleration = createVector(0, 0);
    this.maxSpeed = 4;
    this.maxForce = 0.1;
    this.ARC_RADIUS = 50;
    this.ROTATION_ANGLE = 0;
    this.ARC_ANGLE = +fovValue;
    this.saturation;
  }
  run(boids) {
    this.update();
    this.borders();
    this.walls();
    this.flock(boids);
    this.show();
  }
  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.pos.add(this.velocity);
    this.acceleration.mult(0);
  }
  flock(boids) {
    let cohesion = this.cohesion(boids);
    let separation = this.separation(boids);
    let align = this.align(boids);
    this.applyForce(cohesion);
    this.applyForce(separation);
    this.applyForce(align);
  }
  applyForce(force) {
    this.acceleration.add(force);
  }
  borders() {
    if (this.pos.x < this.r) this.pos.x = width + this.r;
    if (this.pos.y < this.r) this.pos.y = height + this.r;
    if (this.pos.x > width + this.r) this.pos.x = this.r;
    if (this.pos.y > height + this.r) this.pos.y = this.r;
  }
  flee(preds) {
    let desired = p5.Vector.sub(this.pos, preds.pos);
    let d = desired.mag();
    if (
      d < this.ARC_RADIUS &&
      !collidePointArc(
        preds.pos.x,
        preds.pos.y,
        this.pos.x,
        this.pos.y,
        this.ARC_RADIUS,
        this.ROTATION_ANGLE,
        +fovValue
      )
    ) {
      desired.normalize();
      desired.mult(this.maxSpeed * 5);
      this.applyForce(desired);
    }
  }
  walls() {
    if (walls) {
      let dist = this.ARC_RADIUS;
      let cent = createVector(
        random(dist, width - dist),
        random(dist, height - dist)
      );
      if (
        this.pos.x <= dist ||
        this.pos.y <= dist ||
        this.pos.x >= width - dist ||
        this.pos.y >= height - dist
      ) {
        let desired = p5.Vector.sub(cent, this.pos);
        desired.normalize();
        desired.mult(this.maxSpeed);
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxForce * 3);
        this.applyForce(steer);
      }
    }
  }
  seek(target) {
    let desired = p5.Vector.sub(target, this.pos);
    desired.normalize();
    desired.mult(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  }
  cohesion(boids) {
    let sum = createVector(0, 0),
      count = 0,
      vFov = fovValue;

    for (let other of boids) {
      let d = p5.Vector.dist(this.pos, other.pos),
        arcCollision = collidePointArc(
          other.pos.x,
          other.pos.y,
          this.pos.x,
          this.pos.y,
          this.ARC_RADIUS,
          this.ROTATION_ANGLE,
          +vFov
        );
      if (
        (d > 0 && d < this.ARC_RADIUS && !arcCollision) ||
        (d > 0 && d < this.ARC_RADIUS && vFlocking && arcCollision)
      ) {
        sum.add(other.pos);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      this.saturation = count * 25;
      return this.seek(sum);
    } else {
      return createVector(0, 0);
    }
  }
  align(boids) {
    let count = 0,
      sum = createVector(0, 0),
      steer,
      vFov = fovValue;
    for (let other of boids) {
      let d = p5.Vector.dist(this.pos, other.pos),
        arcCollision = collidePointArc(
          other.pos.x,
          other.pos.y,
          this.pos.x,
          this.pos.y,
          this.ARC_RADIUS,
          this.ROTATION_ANGLE,
          +vFov
        );
      if (
        (d > 0 && d < this.ARC_RADIUS && !arcCollision) ||
        (d > 0 && d < this.ARC_RADIUS && vFlocking && arcCollision)
      ) {
        count++;
        sum.add(other.velocity);
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxSpeed);
      steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxForce);
      return steer;
    } else {
      return createVector(0, 0);
    }
  }

  separation(boids) {
    let sum = createVector(0, 0),
      count = 0,
      distance = 25,
      maxForceMult = 1.5,
      vFov = fovValue;
    if (vFlocking) vFov = 5.82;
    for (let other of boids) {
      let arcCollision = collidePointArc(
          other.pos.x,
          other.pos.y,
          this.pos.x,
          this.pos.y,
          this.ARC_RADIUS,
          this.ROTATION_ANGLE,
          fovValue
        ),
        vFlockingCollision = collidePointArc(
          other.pos.x,
          other.pos.y,
          this.pos.x,
          this.pos.y,
          this.ARC_RADIUS,
          this.ROTATION_ANGLE,
          +vFov
        ),
        desired = p5.Vector.sub(this.pos, other.pos),
        d = p5.Vector.dist(this.pos, other.pos);
      if (
        (d > 0 && d < this.ARC_RADIUS && !arcCollision && d < distance) ||
        (d > 0 && d < 500 && vFlocking && vFlockingCollision)
      ) {
        desired.div(d * d);
        sum.add(desired);
        count++;
        if (count > 0) {
          sum.div(count);
        }
        sum.normalize();
        sum.mult(this.maxSpeed);
        sum.sub(this.velocity);
        sum.limit(this.maxForce * 3);
        return sum;
      }
    }
  }
  show() {
    let theta = this.velocity.heading() + radians(90),
      cx,
      cy,
      fovDegrees = (2 * PI - fovValue) * 57.3;
    if (fovDegrees > 360) fovDegrees = 360;
    if (walls) {
      cx = constrain(this.pos.x, this.r, width - this.r);
      cy = constrain(this.pos.y, this.r, height - this.r);
    } else {
      cx = this.pos.x;
      cy = this.pos.y;
    }
    document.getElementById("debug").textContent = `${fovDegrees.toPrecision(
      3
    )} walls: ${walls} V: ${vFlocking}`;

    if (!debugging) {
      colorMode(HSB);
      noStroke();
      push();
      translate(cx, cy);
      rotate(theta);
      beginShape();
      vertex(0, -this.r * 2);
      vertex(-this.r, this.r * 2);
      vertex(this.r, this.r * 2);
      fill(0 + Math.floor(this.pos.x / 5), this.saturation, 255, 255);
      endShape(CLOSE);
      pop();
    } else {
      this.ROTATION_ANGLE = theta + HALF_PI;
      push();
      translate(this.pos.x, this.pos.y);
      rotate(this.ROTATION_ANGLE);
      fill(255, 255, 255, 10);
      stroke(10);
      arc(
        0,
        0,
        2 * this.ARC_RADIUS,
        2 * this.ARC_RADIUS,
        -+fovValue / 2,
        +fovValue / 2
      );
      pop();
      point(mouseX, mouseY);
      push();
      translate(this.pos.x, this.pos.y);
      rotate(theta);
      stroke(255);
      line(0, 0, 0, -50);
      beginShape();
      vertex(0, -this.r * 2);
      vertex(-this.r, this.r * 2);
      vertex(this.r, this.r * 2);
      endShape(CLOSE);
      fill(255, 255, 255);
      pop();
      let hit = collidePointArc(
        mouseX,
        mouseY,
        this.pos.x,
        this.pos.y,
        this.ARC_RADIUS,
        this.ROTATION_ANGLE,
        +fovValue
      );
      if (hit) print("colliding? " + hit);
      strokeWeight(1);
      noFill();
    }
  }
}
function collidePointArc(
  px,
  py,
  ax,
  ay,
  arcRadius,
  arcHeading,
  arcAngle,
  buffer
) {
  if (buffer == undefined) {
    buffer = 0;
  }
  // point other.pos
  var point = this.createVector(px, py);
  // arc center point this.pos
  var arcPos = this.createVector(ax, ay);
  // arc radius vector perception rad
  var radius = this.createVector(arcRadius, 0).rotate(arcHeading);

  var pointToArc = point.copy().sub(arcPos);
  // if (arcAngle == 0) return false;
  if (point.dist(arcPos) <= arcRadius + buffer) {
    var dot = radius.dot(pointToArc);
    var angle = radius.angleBetween(pointToArc);
    if (dot > 0 && angle <= arcAngle / 2 && angle >= -arcAngle / 2) {
      return true;
    }
  }
  return false;
}
