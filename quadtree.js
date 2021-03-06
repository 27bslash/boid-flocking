class QuadTree {
  constructor(boundary) {
    this.boundary = boundary;
    this.capacity = 1;
    this.points = [];
    this.divided = false;
  }
  divide() {
    let x = this.boundary.x,
      y = this.boundary.y,
      w = this.boundary.w,
      h = this.boundary.h;

    let nw = new Rectangle(x - w / 2, y - h / 2, w / 2, h / 2);
    this.northwest = new QuadTree(nw);
    let ne = new Rectangle(x + w / 2, y - h / 2, w / 2, h / 2);
    this.northeast = new QuadTree(ne);
    let sw = new Rectangle(x - w / 2, y + h / 2, w / 2, h / 2);
    this.southwest = new QuadTree(sw);
    let se = new Rectangle(x + w / 2, y + h / 2, w / 2, h / 2);
    this.southeast = new QuadTree(se);
    this.divided = true;
  }
  insert(point) {
    if (!this.boundary.contains(point)) {
      return false;
    }
    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    } else {
      if (!this.divided) {
        this.divide();
        this.divided = true;
      }
      if (this.northeast.insert(point)) {
        return true;
      } else if (this.northwest.insert(point)) {
        return true;
      } else if (this.southwest.insert(point)) {
        return true;
      } else if (this.southeast.insert(point)) {
        return true;
      }
    }
  }
  query(range, found) {
    if (!found) found = [];
    if (!this.boundary.intersects(range)) {
      return;
    } else {
      for (let p of this.points) {
        if (range.contains(p)) {
          found.push(p);
        }
      }
      if (this.divided) {
        this.northwest.query(range, found);
        this.northeast.query(range, found);
        this.southwest.query(range, found);
        this.southeast.query(range, found);
      }
      return found;
    }
  }
  show() {
    noFill();
    rectMode(CENTER);
    stroke(255);
    rect(
      this.boundary.x,
      this.boundary.y,
      this.boundary.w * 2,
      this.boundary.h * 2
    );
    if (this.divided) {
      this.northwest.show();
      this.northeast.show();
      this.southeast.show();
      this.southwest.show();
    }
  }
}
class Rectangle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  contains(point) {
    return (
      point.x > this.x - this.w &&
      point.x < this.x + this.w &&
      point.y > this.y - this.h &&
      point.y < this.y + this.h
    );
  }
  intersects(range) {
    return !(
      range.x - range.w > this.x + this.w ||
      range.x + range.w < this.x - this.w ||
      range.y - range.h > this.y + this.h ||
      range.y + range.h < this.y - this.h
    );
  }
}
class Point {
  constructor(x, y, data) {
    this.x = x;
    this.y = y;
    this.userData = data;
  }
}
