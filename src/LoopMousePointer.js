import loop from './assets/icons/loop.svg';

class LoopMousePointer extends PIXI.Sprite {
  constructor(parent) {
    super(PIXI.Texture.from(loop));
    this.x = -100;
    this.y = -100;
    this.width = 6;
    this.height = 12;
    this.isVisible = true;
    this.zIndex = 999999;
    parent.addChild(this);
  }

  tick() {
    this.x = this.x;
    this.y = this.y;
  }
}

export default LoopMousePointer;
