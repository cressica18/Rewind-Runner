import { GRAVITY, MAX_FALL_SPEED, PALETTE, clamp } from '../core/constants';
import type { Rect } from '../core/constants';
import type { ParticleSystem } from '../systems/ParticleSystem';
import type { AudioManager } from '../audio/AudioManager';

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facing: number;
  animFrame: number;
  animTimer: number;
  isDead: boolean;
  coyoteTime: number;
  jumpBufferTime: number;
}

export class Player {
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  w = 28;
  h = 40;
  onGround = false;
  facing = 1;
  animFrame = 0;
  animTimer = 0;
  isDead = false;
  isRewinding = false;
  private coyoteTime = 0;
  private jumpBufferTime = 0;
  private wasOnGround = false;
  private trailTimer = 0;

  readonly WALK_SPEED = 280;
  readonly JUMP_FORCE = -660;
  readonly COYOTE_TIME = 0.1;
  readonly JUMP_BUFFER = 0.12;
  readonly ANIM_SPEED = 0.08;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  get rect(): Rect { return { x: this.x, y: this.y, w: this.w, h: this.h }; }
  get cx(): number { return this.x + this.w / 2; }
  get cy(): number { return this.y + this.h / 2; }
  get foot(): number { return this.y + this.h; }

  getState(): PlayerState {
    return {
      x: this.x, y: this.y, vx: this.vx, vy: this.vy,
      onGround: this.onGround, facing: this.facing,
      animFrame: this.animFrame, animTimer: this.animTimer,
      isDead: this.isDead, coyoteTime: this.coyoteTime,
      jumpBufferTime: this.jumpBufferTime,
    };
  }

  restoreState(s: PlayerState): void {
    this.x = s.x; this.y = s.y; this.vx = s.vx; this.vy = s.vy;
    this.onGround = s.onGround; this.facing = s.facing;
    this.animFrame = s.animFrame; this.animTimer = s.animTimer;
    this.isDead = s.isDead; this.coyoteTime = s.coyoteTime;
    this.jumpBufferTime = s.jumpBufferTime;
  }

  update(
    dt: number,
    left: boolean,
    right: boolean,
    jumpPressed: boolean,
    jumpHeld: boolean,
    particles: ParticleSystem,
    audio: AudioManager,
  ): void {
    if (this.isDead) return;

    if (jumpPressed) this.jumpBufferTime = this.JUMP_BUFFER;
    this.jumpBufferTime = Math.max(0, this.jumpBufferTime - dt);

    const targetVX = (right ? 1 : 0) - (left ? 1 : 0);
    this.vx = clamp(this.vx + (targetVX * this.WALK_SPEED - this.vx) * Math.min(1, dt * 18), -this.WALK_SPEED, this.WALK_SPEED);

    if (targetVX !== 0) this.facing = targetVX > 0 ? 1 : -1;

    if (this.onGround) this.coyoteTime = this.COYOTE_TIME;
    else this.coyoteTime = Math.max(0, this.coyoteTime - dt);

    if (this.jumpBufferTime > 0 && this.coyoteTime > 0) {
      this.vy = this.JUMP_FORCE;
      this.coyoteTime = 0;
      this.jumpBufferTime = 0;
      this.onGround = false;
      audio.jump();
      particles.burst(this.cx, this.foot, 6, PALETTE.accent, 100, 0.3, 3);
    }

    if (!jumpHeld && this.vy < -200) this.vy += 800 * dt;

    this.vy = Math.min(this.vy + GRAVITY * dt, MAX_FALL_SPEED);

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (!this.wasOnGround && this.onGround) {
      audio.land();
      if (Math.abs(this.vy) > 400) {
        particles.burst(this.cx, this.foot, 5, PALETTE.platform, 80, 0.25, 2);
      }
    }
    this.wasOnGround = this.onGround;
    this.onGround = false;

    this.animTimer += dt;
    if (this.animTimer > this.ANIM_SPEED) {
      this.animTimer = 0;
      if (!this.onGround) this.animFrame = 2;
      else if (Math.abs(this.vx) > 10) {
        this.animFrame = (this.animFrame + 1) % 4;
      } else {
        this.animFrame = 0;
      }
    }

    this.trailTimer += dt;
    if (this.trailTimer > 0.04 && !this.onGround) {
      this.trailTimer = 0;
      if (this.isRewinding) {
        particles.rewindTrail(this.cx, this.cy);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.cx, this.cy);
    if (this.facing < 0) ctx.scale(-1, 1);

    const bodyColor = this.isDead ? '#555' : PALETTE.accent;
    const headColor = this.isDead ? '#444' : '#e8d5b7';

    // Body
    ctx.fillStyle = bodyColor;
    this.roundRect(ctx, -this.w / 2, -this.h / 2 + 14, this.w, this.h - 14, 4);
    ctx.fill();

    // Head
    ctx.fillStyle = headColor;
    this.roundRect(ctx, -10, -this.h / 2, 20, 20, 5);
    ctx.fill();

    // Eye
    ctx.fillStyle = PALETTE.bg;
    ctx.beginPath();
    ctx.arc(5, -this.h / 2 + 10, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.isRewinding ? PALETTE.rewindBlue : PALETTE.accentDim;
    ctx.beginPath();
    ctx.arc(5, -this.h / 2 + 10, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Scarf (temporal energy)
    const scarf = this.isRewinding ? PALETTE.rewindBlue : PALETTE.green;
    ctx.strokeStyle = scarf;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-6, -this.h / 2 + 20);
    ctx.quadraticCurveTo(2 + Math.sin(this.animTimer * 8) * 3, -this.h / 2 + 28, -10, -this.h / 2 + 36);
    ctx.stroke();

    // Run legs animation
    if (this.onGround && Math.abs(this.vx) > 20) {
      const legSwing = Math.sin(this.animFrame * Math.PI / 2) * 8;
      ctx.fillStyle = bodyColor;
      ctx.fillRect(-7, this.h / 2 - 14, 5, 14 + legSwing);
      ctx.fillRect(2, this.h / 2 - 14, 5, 14 - legSwing);
    } else {
      ctx.fillStyle = bodyColor;
      ctx.fillRect(-7, this.h / 2 - 14, 5, 14);
      ctx.fillRect(2, this.h / 2 - 14, 5, 14);
    }

    if (this.isRewinding) {
      const gAlpha = 0.3 + Math.sin(Date.now() / 150) * 0.15;
      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 28);
      grad.addColorStop(0, `rgba(168, 85, 247, ${gAlpha})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  kill(particles: ParticleSystem, audio: AudioManager): void {
    if (this.isDead) return;
    this.isDead = true;
    audio.die();
    particles.burst(this.cx, this.cy, 20, PALETTE.warn, 250, 0.8, 5, true);
    particles.burst(this.cx, this.cy, 10, PALETTE.accent, 150, 0.6, 3);
  }

  resolveCollisionY(platformY: number, platformFoot: number): void {
    if (this.vy >= 0 && this.foot <= platformY + 4 && this.foot + this.vy * 0.016 >= platformY) {
      this.y = platformY - this.h;
      this.vy = 0;
      this.onGround = true;
    } else if (this.vy < 0 && this.y >= platformFoot - 4) {
      this.y = platformFoot;
      this.vy = 0;
    }
  }
}