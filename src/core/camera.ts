import { CANVAS_WIDTH, CANVAS_HEIGHT, lerp, clamp } from './constants';

export class Camera {
  x = 0;
  y = 0;
  shakeIntensity = 0;
  shakeDecay = 8;
  private offsetX = 0;
  private offsetY = 0;

  follow(targetX: number, targetY: number, worldWidth: number, worldHeight: number, dt: number): void {
    const desiredX = targetX - CANVAS_WIDTH / 2;
    const desiredY = targetY - CANVAS_HEIGHT / 2 + 80;
    this.x = lerp(this.x, desiredX, 1 - Math.pow(0.01, dt * 6));
    this.y = lerp(this.y, desiredY, 1 - Math.pow(0.01, dt * 4));
    this.x = clamp(this.x, 0, Math.max(0, worldWidth - CANVAS_WIDTH));
    this.y = clamp(this.y, 0, Math.max(0, worldHeight - CANVAS_HEIGHT));

    if (this.shakeIntensity > 0.1) {
      this.offsetX = (Math.random() - 0.5) * 2 * this.shakeIntensity;
      this.offsetY = (Math.random() - 0.5) * 2 * this.shakeIntensity;
      this.shakeIntensity = lerp(this.shakeIntensity, 0, 1 - Math.pow(0.01, dt * this.shakeDecay));
    } else {
      this.shakeIntensity = 0;
      this.offsetX = 0;
      this.offsetY = 0;
    }
  }

  shake(intensity: number): void {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  get screenX(): number { return this.x + this.offsetX; }
  get screenY(): number { return this.y + this.offsetY; }

  apply(ctx: CanvasRenderingContext2D): void {
    ctx.translate(-this.screenX, -this.screenY);
  }

  worldToScreen(wx: number, wy: number): { x: number; y: number } {
    return { x: wx - this.screenX, y: wy - this.screenY };
  }

  isVisible(x: number, y: number, w: number, h: number): boolean {
    return x + w > this.screenX && x < this.screenX + CANVAS_WIDTH &&
           y + h > this.screenY && y < this.screenY + CANVAS_HEIGHT;
  }
}
