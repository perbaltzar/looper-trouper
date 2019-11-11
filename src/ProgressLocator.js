class ProgressLocator extends PIXI.Sprite {
  constructor(x, height) {
    super(Texture.fromImage('./assets/locator.png'));
    this.x = x;
    this.y = 0;
    this.height = height;
  }
}

export default ProgressLocator;
