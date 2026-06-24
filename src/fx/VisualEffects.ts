import { CANVAS_WIDTH, CANVAS_HEIGHT, lerp } from '../core/constants';

export class VisualEffects {
  private rewindIntensity = 0;
  private scanlineOffset = 0;
  private glitchTimer = 0;
  private chromaX = 0;
  private chromaY = 0;
  private noiseCanvas: HTMLCanvasElement;
  private noiseCtx: CanvasRenderingContext2D;
  private noiseTimer = 0;
  private shockwaveX = 0;
  private shockwaveY = 0;
  private shockwaveRadius = 0;
  private shockwaveActive = false;
  private vignetteAlpha = 0;

  constructor() {
    this.noiseCanvas = document.createElement('canvas');
    this.noiseCanvas.width = 128;
    this.noiseCanvas.height = 128;
    this.noiseCtx = this.noiseCanvas.getContext('2d')!;
  }

  setRewindIntensity(v: number): void {
    this.rewindIntensity = v;
  }

  triggerShockwave(x: number, y: number): void {
    this.shockwaveX = x;
    this.shockwaveY = y;
    this.shockwaveRadius = 0;
    this.shockwaveActive = true;
  }

  setVignetteAlpha(v: number): void {
    this.vignetteAlpha = v;
  }

  update(dt: number): void {
    this.scanlineOffset = (this.scanlineOffset + dt * 60) % 4;
    this.glitchTimer += dt;
    if (this.shockwaveActive) {
      this.shockwaveRadius += dt * 600;
      if (this.shockwaveRadius > 400) this.shockwaveActive = false;
    }

    if (this.rewindIntensity > 0.05) {
      const i = this.rewindIntensity;
      this.chromaX = (Math.random() - 0.5) * i * 8;
      this.chromaY = (Math.random() - 0.5) * i * 4;
      this.noiseTimer += dt;
      if (this.noiseTimer > 0.05) {
        this.noiseTimer = 0;
        this.generateNoise();
      }
    } else {
      this.chromaX = lerp(this.chromaX, 0, dt * 8);
      this.chromaY = lerp(this.chromaY, 0, dt * 8);
    }
  }

  private generateNoise(): void {
    const ctx = this.noiseCtx;
    const idata = ctx.createImageData(128, 128);
    const d = idata.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() < 0.12 ? (Math.random() * 80 | 0) : 0;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = v > 0 ? 180 : 0;
    }
    ctx.putImageData(idata, 0, 0);
  }

  applyPostProcessing(
    ctx: CanvasRenderingContext2D,
    gameCanvas: HTMLCanvasElement,
    isRewinding: boolean,
  ): void {
    if (!isRewinding && this.rewindIntensity < 0.02 && !this.shockwaveActive && this.vignetteAlpha < 0.01) return;

    const src = gameCanvas.width;
    const srh = gameCanvas.height;

    if (isRewinding && this.rewindIntensity > 0.1) {
      // Chromatic aberration
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.12 * this.rewindIntensity;
      ctx.drawImage(gameCanvas, this.chromaX * 2, this.chromaY, src, srh);
      ctx.globalAlpha = 0.1 * this.rewindIntensity;
      ctx.drawImage(gameCanvas, -this.chromaX, this.chromaY * 0.5, src, srh);
      ctx.restore();
    }

    // Scanlines
    if (this.rewindIntensity > 0.1) {
      ctx.save();
      ctx.globalAlpha = 0.12 * this.rewindIntensity;
      ctx.fillStyle = '#000';
      for (let y = (this.scanlineOffset | 0); y < CANVAS_HEIGHT; y += 4) {
        ctx.fillRect(0, y, CANVAS_WIDTH, 2);
      }
      ctx.restore();
    }

    // VHS noise
    if (isRewinding && this.rewindIntensity > 0.3) {
      ctx.save();
      ctx.globalAlpha = 0.08 * this.rewindIntensity;
      ctx.drawImage(this.noiseCanvas, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();

      // VHS tracking glitch lines
      if (Math.random() < 0.15 * this.rewindIntensity) {
        const gy = Math.random() * CANVAS_HEIGHT;
        const gh = randomRange(2, 12);
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.drawImage(gameCanvas, randomRange(-20, 20), gy, CANVAS_WIDTH, gh, 0, gy, CANVAS_WIDTH, gh);
        ctx.restore();
      }
    }

    // Rewind color tint (blue-purple)
    if (this.rewindIntensity > 0.1) {
      ctx.save();
      ctx.globalAlpha = 0.08 * this.rewindIntensity;
      ctx.fillStyle = '#7030ff';
      ctx.globalCompositeOperation = 'screen';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();
    }

    // Shockwave ring
    if (this.shockwaveActive) {
      const alpha = Math.max(0, 1 - this.shockwaveRadius / 400) * 0.6;
      ctx.save();
      ctx.strokeStyle = `rgba(127, 90, 240, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      const sx = this.shockwaveX;
      const sy = this.shockwaveY;
      ctx.arc(sx, sy, this.shockwaveRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Vignette
    if (this.vignetteAlpha > 0.01) {
      const vgrd = ctx.createRadialGradient(
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.3,
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.8,
      );
      vgrd.addColorStop(0, 'transparent');
      vgrd.addColorStop(1, `rgba(0,0,0,${this.vignetteAlpha})`);
      ctx.fillStyle = vgrd;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }

  drawRewindUI(ctx: CanvasRenderingContext2D, intensity: number): void {
    if (intensity < 0.05) return;
    // Corner temporal distortion
    ctx.save();
    ctx.globalAlpha = intensity * 0.5;
    const borderW = 4 + intensity * 4;
    const grad = ctx.createLinearGradient(0, 0, borderW * 3, 0);
    grad.addColorStop(0, '#00d4ff');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, borderW * 3, CANVAS_HEIGHT);
    const grad2 = ctx.createLinearGradient(CANVAS_WIDTH, 0, CANVAS_WIDTH - borderW * 3, 0);
    grad2.addColorStop(0, '#a855f7');
    grad2.addColorStop(1, 'transparent');
    ctx.fillStyle = grad2;
    ctx.fillRect(CANVAS_WIDTH - borderW * 3, 0, borderW * 3, CANVAS_HEIGHT);
    ctx.restore();
  }
}

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
