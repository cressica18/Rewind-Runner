import { PALETTE } from '../core/constants';
import type { PlayerState } from './Player';

export class TimeEcho {
  private frames: PlayerState[] = [];
  private playhead = 0;
  private playing = false;
  private loopDelay: number;
  private loopTimer = 0;
  opacity = 0.4;

  constructor(loopDelay = 2) {
    this.loopDelay = loopDelay;
  }

  record(state: PlayerState): void {
    this.frames.push({ ...state });
    if (this.frames.length > 300) this.frames.shift();
  }

  startPlayback(): void {
    if (this.frames.length < 10) return;
    this.playhead = 0;
    this.playing = true;
    this.loopTimer = this.loopDelay;
  }

  update(dt: number): void {
    if (!this.playing) return;
    this.playhead += dt * 60;
    if (this.playhead >= this.frames.length) {
      this.playing = false;
      this.loopTimer = this.loopDelay;
    }
  }

  updateIdle(dt: number): void {
    if (this.playing) return;
    this.loopTimer -= dt;
    if (this.loopTimer <= 0) this.startPlayback();
  }

  getCurrentState(): PlayerState | null {
    if (!this.playing) return null;
    const i = Math.floor(this.playhead);
    return this.frames[i] ?? null;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.playing) return;
    const state = this.getCurrentState();
    if (!state) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(state.x + 14, state.y + 20);
    if (state.facing < 0) ctx.scale(-1, 1);

    // Ghost silhouette
    ctx.fillStyle = PALETTE.echo;
    ctx.beginPath();
    ctx.ellipse(0, -8, 14, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Scan lines for ghost feel
    ctx.strokeStyle = 'rgba(127,90,240,0.3)';
    ctx.lineWidth = 1;
    for (let i = -24; i <= 8; i += 4) {
      ctx.beginPath();
      ctx.moveTo(-14, i);
      ctx.lineTo(14, i);
      ctx.stroke();
    }

    ctx.restore();
  }

  get hasFrames(): boolean { return this.frames.length > 10; }
  clear(): void { this.frames = []; this.playing = false; }
}
