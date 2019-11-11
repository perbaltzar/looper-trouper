class ProgressLocator extends PIXI.Graphics {
  constructor(x, height, parent) {
    super();
    this.x = x;
    this.height = height;
    this.color = 0xffffff;
    this.parent = parent;
    this.lineWidth = 0.5;
    this.lineStyle(this.lineWidth, this.color);
    this.moveTo(x, 0);
    this.lineTo(x, height);
    parent.addChild(this);
  }
  update(x) {
    this.clear();
    this.lineStyle(this.lineWidth, this.color);
    this.moveTo(x, 0);
    this.lineTo(x, 150);
  }
}

export default ProgressLocator;
