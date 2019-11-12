class Bar extends PIXI.Graphics {
  constructor(x, y, width, height, parent) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = 0xc43f51;
    this.parent = parent;
    this.beginFill(this.color);
    this.drawRect(x, y, width, height);
    this.endFill();
    this.played = false;
    parent.addChild(this);
  }

  draw() {
    this.color = this.played ? 0x414141 : 0xc43f51;
    this.beginFill(this.color);
    this.drawRect(this.x, this.y, this.width, this.height);
    this.endFill();
  }
  tick(progress) {
    if (!this.played && this.x < progress) {
      this.played = true;
      this.draw();
    } else if (this.played && this.x > progress) {
      this.played = false;
      this.draw();
    }
  }
}

export default Bar;
