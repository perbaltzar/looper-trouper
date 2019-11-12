import locator from './assets/locator.png';
class ProgressLocator extends PIXI.Sprite {
  constructor(x, height, parent) {
    super(PIXI.Texture.from(locator));
    this.x = 0;
    this.y = 0;
    this.height = height;
    this.scale.set(0.1, 0.1);
    parent.addChild(this);
    this.tick(-100);
  }
  tick(progress) {
    this.x = progress - this.width / 2;
    this.scale.set(0.15, 0.15);
  }

  moveTo(position) {
    this.x = position;
  }
}

export default ProgressLocator;
