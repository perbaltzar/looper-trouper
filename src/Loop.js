class Loop extends PIXI.Graphics {
  constructor(start, end, height, parent) {
    super();
    this.x = x;
    this.width = width;
    this.height = height;
    this.parent = parent;
    this.color = 0x99ff00;
    parent.addChild(this);
  }

  draw() {
    this.beginFill(this.color);
    this.drawRect(this.x, 0, this.width, this.height);
    this.endFill();
  }
  tick() {}
}

export default Bar;
