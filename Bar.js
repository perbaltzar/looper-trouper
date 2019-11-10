class Bar extends PIXI.Graphics {
  constructor(x, y, width, height, parent) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = 0x00ff00;
    this.parent = parent;
    this.beginFill(this.color);
    this.drawRect(x, y, width, height);
    this.endFill();
    this.played = false;
    parent.addChild(this);
  }

  draw() {
    this.color = 0x00ff00;
    if (this.played) this.color = 0x0000ff;
    this.beginFill(this.color);
    this.drawRect(this.x, this.y, this.width, this.height);
    this.endFill();
  }
}

export default Bar;
