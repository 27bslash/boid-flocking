class Predator {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.velocity = p5.Vector.random2D();
    this.acceleration = createVector(0, 0);
    this.maxSpeed = 5;
    this.maxForce = 0.01;
    this.r = 15;
    this.perceptionRadius = 100;
  }
  run() {
    this.update();
    this.borders();
    this.show();
  }
  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.pos.add(this.velocity);
    this.acceleration.mult(0);
  }
  applyForce(force) {
    this.acceleration.add(force);
  }
  borders() {
    if (this.pos.x < -this.r) this.pos.x = width + this.r;
    if (this.pos.y < -this.r) this.pos.y = height + this.r;
    if (this.pos.x > width + this.r) this.pos.x = -this.r;
    if (this.pos.y > height + this.r) this.pos.y = -this.r;
  }
  target(target) {
    let desired = p5.Vector.sub(target.pos, this.pos);
    let distance = desired.mag();
    if (distance < 300) {
      desired.normalize();
      let steer = p5.Vector.sub(desired, this.vel);
      this.applyForce(steer);
    } else {
      // this.velocity = createVector(0,random(height));
    }
  }
  flee(preds) {
    for (let pred of preds) {
      let desired = p5.Vector.sub(this.pos, pred.pos);
      let d = desired.mag();
      if (d < 300) {
        desired.normalize();
        desired.mult(this.maxSpeed);
        this.applyForce(desired);
      }
    }
  }
  show() {
    fill(255, 0, 0);
    noStroke()
    ellipse(this.pos.x, this.pos.y, this.r);
  }
}
