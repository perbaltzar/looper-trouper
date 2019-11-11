class Loop extends PIXI.Graphics {
  constructor(start, end, height, parent) {
    super();
    this.start = start;
    this.end = end;
    this.height = 150;
    this.parent = parent;
    this.color = 0x99ff00;
    parent.addChild(this);
  }

  draw() {
    this.beginFill(this.color);
    this.drawRect(this.start, 0, this.end - this.start, this._height);
    this.endFill();
  }
  tick() {}

  placeEnd(end) {
    this.end = end;
  }
}

export default Loop;
