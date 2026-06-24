import { CANVAS_WIDTH, CANVAS_HEIGHT, PALETTE, lerp, clamp } from '../core/constants';

export interface HUDData {
  rewindMeter: number;
  rewindHistoryFill: number;
  isRewinding: boolean;
  score: number;
  collectibles: number;
  totalCollectibles: number;
  levelTime: number;
  levelName: string;
  checkpointCount: number;
  currentLevel: number;
  totalLevels: number;
}

export class HUD {
  private rewindMeterAnim = 1;
  private rewindFlash = 0;
  private scoreAnim = 0;
  private lastScore = 0;

  update(dt: number, data: HUDData): void {
    this.rewindMeterAnim = lerp(this.rewindMeterAnim, data.rewindMeter, 1 - Math.pow(0.01, dt * 12));
    if (data.isRewinding) this.rewindFlash = (this.rewindFlash + dt * 8) % (Math.PI * 2);
    if (data.score !== this.lastScore) {
      this.scoreAnim = 1;
      this.lastScore = data.score;
    }
    this.scoreAnim = Math.max(0, this.scoreAnim - dt * 4);
  }

  draw(ctx: CanvasRenderingContext2D, data: HUDData): void {
    ctx.save();

    // Top bar background
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 56);

    // Level info
    ctx.fillStyle = PALETTE.muted;
    ctx.font = '12px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${data.levelName}`, 16, 18);
    ctx.fillStyle = PALETTE.text;
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.fillText(`LVL ${data.currentLevel}/${data.totalLevels}`, 16, 36);

    // Time
    const mins = Math.floor(data.levelTime / 60);
    const secs = Math.floor(data.levelTime % 60);
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
    ctx.textAlign = 'center';
    ctx.font = '18px "Courier New", monospace';
    ctx.fillStyle = PALETTE.text;
    ctx.fillText(timeStr, CANVAS_WIDTH / 2, 32);

    // Score
    const scoreScale = 1 + this.scoreAnim * 0.3;
    ctx.textAlign = 'right';
    ctx.save();
    ctx.translate(CANVAS_WIDTH - 140, 32);
    ctx.scale(scoreScale, scoreScale);
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillStyle = this.scoreAnim > 0 ? PALETTE.gold : PALETTE.text;
    ctx.fillText(data.score.toString().padStart(6, '0'), 0, 0);
    ctx.restore();

    // Collectible count
    ctx.textAlign = 'right';
    ctx.font = '13px "Courier New", monospace';
    ctx.fillStyle = PALETTE.green;
    ctx.fillText(`◆ ${data.collectibles}/${data.totalCollectibles}`, CANVAS_WIDTH - 16, 48);

    // Rewind meter
    this.drawRewindMeter(ctx, data);

    ctx.restore();
  }

  private drawRewindMeter(ctx: CanvasRenderingContext2D, data: HUDData): void {
    const mx = 16;
    const my = CANVAS_HEIGHT - 28;
    const mw = 220;
    const mh = 14;

    // Label
    ctx.fillStyle = data.isRewinding
      ? `rgba(0, 212, 255, ${0.8 + Math.sin(this.rewindFlash) * 0.2})`
      : PALETTE.muted;
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('REWIND', mx, my - 4);

    // Background track
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(mx, my, mw, mh);

    // History fill (dim background)
    ctx.fillStyle = 'rgba(127, 90, 240, 0.15)';
    ctx.fillRect(mx + 1, my + 1, (mw - 2) * data.rewindHistoryFill, mh - 2);

    // Meter fill
    const fillW = (mw - 2) * this.rewindMeterAnim;
    if (fillW > 0) {
      const grad = ctx.createLinearGradient(mx + 1, 0, mx + 1 + fillW, 0);
      if (data.isRewinding) {
        grad.addColorStop(0, '#a855f7');
        grad.addColorStop(0.5, '#00d4ff');
        grad.addColorStop(1, '#a855f7');
      } else {
        grad.addColorStop(0, '#7f5af0');
        grad.addColorStop(1, '#2cb67d');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(mx + 1, my + 1, fillW, mh - 2);
    }

    // Glow when rewinding
    if (data.isRewinding) {
      ctx.shadowColor = '#00d4ff';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = `rgba(0, 212, 255, ${0.5 + Math.sin(this.rewindFlash) * 0.3})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(mx, my, mw, mh);
      ctx.shadowBlur = 0;
    }

    // Key hint
    if (!data.isRewinding && data.rewindMeter > 0.1) {
      ctx.fillStyle = 'rgba(148,161,178,0.6)';
      ctx.font = '9px "Courier New", monospace';
      ctx.fillText('[SHIFT/Z] HOLD', mx + mw + 8, my + 10);
    }

    if (data.rewindMeter < 0.15 && !data.isRewinding) {
      const warn = 0.5 + Math.sin(Date.now() / 200) * 0.5;
      ctx.fillStyle = `rgba(255, 77, 77, ${warn * 0.8})`;
      ctx.fillText('RECHARGING...', mx + mw + 8, my + 10);
    }
  }

  drawDeathOverlay(ctx: CanvasRenderingContext2D, alpha: number): void {
    ctx.save();
    ctx.fillStyle = `rgba(255, 50, 50, ${alpha * 0.25})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (alpha > 0.5) {
      ctx.fillStyle = `rgba(255, 77, 77, ${(alpha - 0.5) * 2})`;
      ctx.font = 'bold 48px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TEMPORAL FAILURE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
      ctx.font = '18px "Courier New", monospace';
      ctx.fillStyle = `rgba(200,200,200,${(alpha - 0.5) * 2})`;
      ctx.fillText('Hold SHIFT/Z to rewind • ESC to pause', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
    }
    ctx.restore();
  }
}
