import { PALETTE, rectOverlap, randomRange } from '../core/constants';
import type { Rect } from '../core/constants';
import type { ParticleSystem } from '../systems/ParticleSystem';

export interface HazardState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angleVel: number;
  phase: number;
  active: boolean;
}

export type HazardType = 'blade' | 'projectile' | 'debris' | 'fireball' | 'laser';

export class Hazard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  type: HazardType;
  angle = 0;
  angleVel: number;
  phase: number;
  active = true;
  originX: number;
  originY: number;
  amplitude: number;
  frequency: number;
  lifetime: number;
  maxLifetime: number;
  laserLength: number;

  constructor(
    x: number, y: number, type: HazardType,
    opts: {
      vx?: number; vy?: number; w?: number; h?: number;
      angleVel?: number; phase?: number; amplitude?: number;
      frequency?: number; lifetime?: number; laserLength?: number;
    } = {}
  ) {
    this.x = x; this.y = y;
    this.type = type;
    this.originX = x; this.originY = y;
    this.vx = opts.vx ?? 0;
    this.vy = opts.vy ?? 0;
    this.w = opts.w ?? 32;
    this.h = opts.h ?? 32;
    this.angleVel = opts.angleVel ?? (type === 'blade' ? 4 : 0);
    this.phase = opts.phase ?? 0;
    this.amplitude = opts.amplitude ?? 80;
    this.frequency = opts.frequency ?? 1;
    this.lifetime = opts.lifetime ?? 8;
    this.maxLifetime = this.lifetime;
    this.laserLength = opts.laserLength ?? 200;
  }

  get rect(): Rect {
    const r = this.w / 2;
    return { x: this.x - r, y: this.y - r, w: this.w, h: this.h };
  }

  getState(): HazardState {
    return { x: this.x, y: this.y, vx: this.vx, vy: this.vy, angle: this.angle, angleVel: this.angleVel, phase: this.phase, active: this.active };
  }

  restoreState(s: HazardState): void {
    this.x = s.x; this.y = s.y; this.vx = s.vx; this.vy = s.vy;
    this.angle = s.angle; this.angleVel = s.angleVel; this.phase = s.phase; this.active = s.active;
  }

  update(dt: number, time: number, particles: ParticleSystem): void {
    if (!this.active) return;
    this.angle += this.angleVel * dt;
    this.phase += dt;

    if (this.type === 'blade') {
      this.x = this.originX + Math.sin(this.phase * this.frequency) * this.amplitude;
    } else if (this.type === 'projectile') {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.lifetime -= dt;
      if (this.lifetime <= 0) this.active = false;
      if (Math.random() < 0.4) {
        particles.emit({
          x: this.x, y: this.y,
          vx: randomRange(-20, 20) - this.vx * 0.1,
          vy: randomRange(-20, 20),
          life: randomRange(0.1, 0.3),
          size: randomRange(2, 5),
          color: PALETTE.timecrack,
          gravity: 50,
          glow: true,
        });
      }
    } else if (this.type === 'debris') {
      this.vx *= Math.pow(0.98, dt * 60);
      this.vy += 600 * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.lifetime -= dt;
      if (this.lifetime <= 0) this.active = false;
    } else if (this.type === 'fireball') {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.lifetime -= dt;
      if (this.lifetime <= 0) this.active = false;
      if (Math.random() < 0.5) {
        particles.emit({
          x: this.x + randomRange(-6, 6),
          y: this.y + randomRange(-6, 6),
          vx: randomRange(-40, 40),
          vy: randomRange(-80, -20),
          life: randomRange(0.2, 0.5),
          size: randomRange(4, 8),
          color: Math.random() < 0.5 ? '#ff6b00' : '#ffcc00',
          gravity: -100,
          glow: true,
        });
      }
    } else if (this.type === 'laser') {
      this.phase += dt * 0.5;
    }
  }

  hitsRect(r: Rect): boolean {
    if (!this.active) return false;
    if (this.type === 'blade') {
      const cx = this.x, cy = this.y;
      const rr = this.w / 2;
      return r.x < cx + rr && r.x + r.w > cx - rr && r.y < cy + rr && r.y + r.h > cy - rr;
    }
    if (this.type === 'laser') {
      const laserRect: Rect = { x: this.x, y: this.y - 4, w: this.laserLength, h: 8 };
      return rectOverlap(laserRect, r);
    }
    return rectOverlap(this.rect, r);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;
    ctx.save();

    if (this.type === 'blade') {
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      // Blade body
      ctx.fillStyle = PALETTE.blade;
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.rotate(i * Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(0, -2);
        ctx.lineTo(this.w / 2, -4);
        ctx.lineTo(this.w / 2, 4);
        ctx.lineTo(0, 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      // Center hub
      ctx.fillStyle = '#888';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      // Glow
      const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, this.w / 2 + 4);
      grad.addColorStop(0, 'rgba(200,200,255,0.3)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, this.w / 2 + 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'projectile') {
      ctx.translate(this.x, this.y);
      ctx.rotate(Math.atan2(this.vy, this.vx));
      ctx.fillStyle = PALETTE.timecrack;
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      const grd = ctx.createRadialGradient(0, 0, 1, 0, 0, 12);
      grd.addColorStop(0, 'rgba(255,107,53,0.5)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'debris') {
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = PALETTE.debris;
      ctx.fillRect(-8, -6, 16, 12);
      ctx.fillStyle = '#4a3a28';
      ctx.fillRect(-6, -4, 12, 8);
    } else if (this.type === 'fireball') {
      ctx.translate(this.x, this.y);
      const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, 14);
      gr.addColorStop(0, '#fff8a0');
      gr.addColorStop(0.4, '#ff6b00');
      gr.addColorStop(1, 'transparent');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'laser') {
      const alpha = 0.7 + Math.sin(this.phase * 8) * 0.15;
      ctx.globalAlpha = alpha;
      // Beam
      ctx.strokeStyle = '#ff2040';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#ff2040';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.laserLength, this.y);
      ctx.stroke();
      // Core
      ctx.strokeStyle = '#ffaaaa';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }
}
