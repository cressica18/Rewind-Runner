import { CANVAS_WIDTH, CANVAS_HEIGHT, lerp, clamp } from './constants';
export class Camera {
    constructor() {
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "shakeIntensity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "shakeDecay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 8
        });
        Object.defineProperty(this, "offsetX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "offsetY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    follow(targetX, targetY, worldWidth, worldHeight, dt) {
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
        }
        else {
            this.shakeIntensity = 0;
            this.offsetX = 0;
            this.offsetY = 0;
        }
    }
    shake(intensity) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    }
    get screenX() { return this.x + this.offsetX; }
    get screenY() { return this.y + this.offsetY; }
    apply(ctx) {
        ctx.translate(-this.screenX, -this.screenY);
    }
    worldToScreen(wx, wy) {
        return { x: wx - this.screenX, y: wy - this.screenY };
    }
    isVisible(x, y, w, h) {
        return x + w > this.screenX && x < this.screenX + CANVAS_WIDTH &&
            y + h > this.screenY && y < this.screenY + CANVAS_HEIGHT;
    }
}
