import { PALETTE, rectOverlap, randomRange } from '../core/constants';
import type { Rect } from '../core/constants';
import type { ParticleSystem } from '../systems/ParticleSystem';

export interface CollectibleState {
  collected: boolean;
  bobTimer: number;
}

export class Collectible {
  x: number;
  y: number;
  w = 20;
  h = 20;
  collected = false;
  bobTimer = 0;
  isStar: boolean;

  constructor(x: number, y: number, isStar = false) {
    this.x = x; this.y = y; this.isStar = isStar;
  }

  get rect(): Rect { return { x: this.x - 10, y: this.y - 10, w: this.w, h: this.h }; }

  getState(): CollectibleState { return { collected: this.collected, bobTimer: this.bobTimer }; }
  restoreState(s: CollectibleState): void {
    this.collected = s.collected; this.bobTimer = s.bobTimer;
  }

  update(dt: number): void {
    if (!this.collected) this.bobTimer += dt;
  }

  collect(particles: ParticleSystem): void {
    if (this.collected) return;
    this.collected = true;
    const color = this.isStar ? PALETTE.gold : PALETTE.green;
    particles.burst(this.x, this.y, 12, color, 200, 0.6, 5, true);
    particles.sparkle(this.x, this.y, color, 8);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.collected) return;
    const bob = Math.sin(this.bobTimer * 3) * 4;
    const py = this.y + bob;

    ctx.save();
    ctx.translate(this.x, py);

    if (this.isStar) {
      const grd = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
      grd.addColorStop(0, '#fff8a0');
      grd.addColorStop(0.5, PALETTE.gold);
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      this.drawStar(ctx, 0, 0, 5, 10, 5);
      ctx.fillStyle = PALETTE.gold;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      const grd = ctx.createRadialGradient(0, 0, 2, 0, 0, 12);
      grd.addColorStop(0, PALETTE.green);
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.green;
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.arc(-2, -2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number, innerR: number, points: number): void {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i * Math.PI) / points - Math.PI / 2;
      if (i === 0) ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      else ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
    ctx.closePath();
  }
}

export interface SwitchState {
  activated: boolean;
  timer: number;
}

export class Switch {
  x: number;
  y: number;
  w = 24;
  h = 16;
  activated = false;
  timer = 0;
  countdownDuration: number;
  id: string;

  constructor(x: number, y: number, id: string, countdownDuration = 0) {
    this.x = x; this.y = y;
    this.id = id;
    this.countdownDuration = countdownDuration;
  }

  get rect(): Rect { return { x: this.x, y: this.y, w: this.w, h: this.h }; }

  getState(): SwitchState { return { activated: this.activated, timer: this.timer }; }
  restoreState(s: SwitchState): void { this.activated = s.activated; this.timer = s.timer; }

  update(dt: number): void {
    if (this.activated && this.countdownDuration > 0) {
      this.timer -= dt;
      if (this.timer <= 0) { this.activated = false; this.timer = 0; }
    }
  }

  activate(): void {
    this.activated = true;
    if (this.countdownDuration > 0) this.timer = this.countdownDuration;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = this.activated ? PALETTE.green : '#555';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.fillStyle = this.activated ? '#afffcc' : '#888';
    ctx.fillRect(this.x + 4, this.y + 3, this.w - 8, this.h - 6);

    if (this.countdownDuration > 0 && this.activated && this.timer > 0) {
      const frac = this.timer / this.countdownDuration;
      ctx.fillStyle = `hsl(${120 * frac}, 80%, 50%)`;
      ctx.fillRect(this.x, this.y + this.h - 3, this.w * frac, 3);
    }
    ctx.restore();
  }
}

export interface DoorState {
  open: boolean;
  openAmount: number;
}

export class Door {
  x: number;
  y: number;
  w: number;
  h: number;
  open = false;
  openAmount = 0;
  switchId: string;

  constructor(x: number, y: number, w: number, h: number, switchId: string) {
    this.x = x; this.y = y; this.w = w; this.h = h; this.switchId = switchId;
  }

  get rect(): Rect {
    if (this.openAmount >= 0.95) return { x: this.x, y: -1000, w: this.w, h: 0 };
    return { x: this.x, y: this.y + this.h * this.openAmount, w: this.w, h: this.h * (1 - this.openAmount) };
  }

  getState(): DoorState { return { open: this.open, openAmount: this.openAmount }; }
  restoreState(s: DoorState): void { this.open = s.open; this.openAmount = s.openAmount; }

  update(dt: number, switchActivated: boolean): void {
    this.open = switchActivated;
    const target = this.open ? 1 : 0;
    this.openAmount += (target - this.openAmount) * Math.min(1, dt * 5);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.openAmount >= 0.99) return;
    const drawY = this.y + this.h * this.openAmount;
    const drawH = this.h * (1 - this.openAmount);
    ctx.save();
    ctx.fillStyle = '#2a1a3a';
    ctx.fillRect(this.x, drawY, this.w, drawH);
    ctx.strokeStyle = PALETTE.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, drawY, this.w, drawH);
    // Door panels
    ctx.fillStyle = '#3d2a50';
    ctx.fillRect(this.x + 4, drawY + 4, this.w / 2 - 6, drawH - 8);
    ctx.fillRect(this.x + this.w / 2 + 2, drawY + 4, this.w / 2 - 6, drawH - 8);
    ctx.restore();
  }
}

export interface PortalState {
  active: boolean;
  spinAngle: number;
}

export class Portal {
  x: number;
  y: number;
  w = 40;
  h = 64;
  active = true;
  spinAngle = 0;

  constructor(x: number, y: number) { this.x = x; this.y = y; }
  get rect(): Rect { return { x: this.x - 20, y: this.y - 32, w: this.w, h: this.h }; }

  getState(): PortalState { return { active: this.active, spinAngle: this.spinAngle }; }
  restoreState(s: PortalState): void { this.active = s.active; this.spinAngle = s.spinAngle; }

  update(dt: number, particles: ParticleSystem): void {
    this.spinAngle += dt * 2;
    if (Math.random() < 0.3) {
      const a = Math.random() * Math.PI * 2;
      particles.emit({
        x: this.x + Math.cos(a) * 16,
        y: this.y + Math.sin(a) * 28,
        vx: Math.cos(a) * -40 + randomRange(-10, 10),
        vy: Math.sin(a) * -40 + randomRange(-10, 10),
        life: randomRange(0.4, 0.8),
        size: randomRange(2, 5),
        color: PALETTE.portal,
        gravity: 0,
        glow: true,
      });
    }
  }

  draw(ctx: CanvasRenderingContext2D, time: number): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Outer glow
    const grd = ctx.createRadialGradient(0, 0, 10, 0, 0, 36);
    grd.addColorStop(0, 'rgba(0, 255, 204, 0.3)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 54, 0, 0, Math.PI * 2);
    ctx.fill();

    // Portal ring
    ctx.strokeStyle = PALETTE.portal;
    ctx.lineWidth = 3;
    ctx.shadowColor = PALETTE.portal;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 32, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner vortex
    for (let i = 0; i < 3; i++) {
      const a = this.spinAngle + i * (Math.PI * 2 / 3);
      const x = Math.cos(a) * 10;
      const y = Math.sin(a) * 16;
      ctx.fillStyle = `rgba(0, 255, 204, ${0.4 + i * 0.15})`;
      ctx.beginPath();
      ctx.ellipse(x, y, 4, 6, a, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center
    const pulseR = 6 + Math.sin(time * 5) * 2;
    const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseR);
    cg.addColorStop(0, '#ffffff');
    cg.addColorStop(0.5, PALETTE.portal);
    cg.addColorStop(1, 'transparent');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.ellipse(0, 0, pulseR, pulseR * 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  touches(r: Rect): boolean {
    return rectOverlap(this.rect, r);
  }
}

export interface CheckpointState {
  activated: boolean;
}

export class Checkpoint {
  x: number;
  y: number;
  w = 12;
  h = 48;
  activated = false;
  id: number;
  flagAnim = 0;

  constructor(x: number, y: number, id: number) { this.x = x; this.y = y; this.id = id; }
  get rect(): Rect { return { x: this.x - 16, y: this.y - 48, w: 40, h: 64 }; }

  getState(): CheckpointState { return { activated: this.activated }; }
  restoreState(s: CheckpointState): void { this.activated = s.activated; }

  update(dt: number): void { this.flagAnim += dt; }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    // Pole
    ctx.fillStyle = '#888';
    ctx.fillRect(this.x - 2, this.y - this.h, 4, this.h);
    // Flag
    const fw = Math.sin(this.flagAnim * 4) * 4;
    ctx.fillStyle = this.activated ? PALETTE.green : '#888';
    ctx.beginPath();
    ctx.moveTo(this.x + 2, this.y - this.h);
    ctx.lineTo(this.x + 22, this.y - this.h + 8 + fw);
    ctx.lineTo(this.x + 2, this.y - this.h + 16);
    ctx.closePath();
    ctx.fill();
    if (this.activated) {
      ctx.strokeStyle = '#afffcc';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  }
}
