import locator from './assets/locator.png';
class ProgressLocator extends PIXI.Sprite {
  constructor(x, height, parent) {
    super(PIXI.Texture.from(locator));
    this.x = x;
    this.y = 0;
    this.height = height;
    this.width = (height / 200) * 20;
    // this.scale.set(0.5, 0.5);

    parent.addChild(this);
  }
  tick(progress) {
    this.x = progress - this.width / 2;
    this.scale.set(0.15, 0.15);
  }
}

export default ProgressLocator;
