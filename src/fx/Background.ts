import { CANVAS_WIDTH, CANVAS_HEIGHT, PALETTE, randomRange } from '../core/constants';
import type { Camera } from '../core/camera';

interface Star { x: number; y: number; r: number; twinkle: number; }
interface Building { x: number; y: number; w: number; h: number; windows: { x: number; y: number; lit: boolean }[]; }

export class Background {
  private stars: Star[] = [];
  private buildings: Building[] = [];
  private bgStyle: string;
  private worldWidth: number;
  private time = 0;

  constructor(bgStyle: string, worldWidth: number) {
    this.bgStyle = bgStyle;
    this.worldWidth = worldWidth;
    this.generateStars();
    if (bgStyle === 'city' || bgStyle === 'ruins') this.generateBuildings();
  }

  private generateStars(): void {
    for (let i = 0; i < 180; i++) {
      this.stars.push({
        x: Math.random() * this.worldWidth,
        y: Math.random() * CANVAS_HEIGHT * 0.7,
        r: randomRange(0.5, 2.5),
        twinkle: Math.random() * Math.PI * 2,
      });
    }
  }

  private generateBuildings(): void {
    let bx = -200;
    while (bx < this.worldWidth + 400) {
      const bw = randomRange(80, 200);
      const bh = randomRange(100, 340);
      const windows: { x: number; y: number; lit: boolean }[] = [];
      const wCols = Math.floor(bw / 22);
      const wRows = Math.floor(bh / 28);
      for (let r = 0; r < wRows; r++) {
        for (let c = 0; c < wCols; c++) {
          windows.push({ x: c * 22 + 8, y: r * 28 + 8, lit: Math.random() < 0.45 });
        }
      }
      this.buildings.push({ x: bx, y: CANVAS_HEIGHT - bh, w: bw, h: bh, windows });
      bx += bw + randomRange(20, 60);
    }
  }

  update(dt: number): void {
    this.time += dt;
    for (const s of this.stars) s.twinkle += dt * (1 + s.r);
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const cx = camera.screenX;
    const cy = camera.screenY;

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    if (this.bgStyle === 'void') {
      sky.addColorStop(0, '#0a0020');
      sky.addColorStop(0.5, '#140840');
      sky.addColorStop(1, '#200050');
    } else if (this.bgStyle === 'factory') {
      sky.addColorStop(0, '#0f0a05');
      sky.addColorStop(0.5, '#1a0f0a');
      sky.addColorStop(1, '#250f0f');
    } else if (this.bgStyle === 'ruins') {
      sky.addColorStop(0, '#050210');
      sky.addColorStop(0.5, '#0d0820');
      sky.addColorStop(1, '#150a30');
    } else {
      sky.addColorStop(0, '#080615');
      sky.addColorStop(0.5, '#0d0a20');
      sky.addColorStop(1, '#150c28');
    }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Stars (parallax 0.05)
    for (const s of this.stars) {
      const sx = ((s.x - cx * 0.05) % CANVAS_WIDTH + CANVAS_WIDTH) % CANVAS_WIDTH;
      const sy = s.y - cy * 0.02;
      if (sy < 0 || sy > CANVAS_HEIGHT) continue;
      const brightness = 0.6 + Math.sin(s.twinkle * 1.5) * 0.4;
      ctx.fillStyle = `rgba(255,255,255,${brightness * 0.8})`;
      ctx.beginPath();
      ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Far buildings (parallax 0.2)
    if (this.bgStyle === 'city' || this.bgStyle === 'ruins') {
      for (const b of this.buildings) {
        const bx = b.x - cx * 0.2;
        const by = b.y - cy * 0.1 + CANVAS_HEIGHT * 0.1;
        if (bx + b.w < 0 || bx > CANVAS_WIDTH) continue;

        const dark = this.bgStyle === 'ruins' ? '#1a0d2a' : '#0d1020';
        ctx.fillStyle = dark;
        ctx.fillRect(bx, by, b.w, b.h);
        for (const w of b.windows) {
          if (!w.lit) continue;
          const fx = 0.5 + Math.sin(this.time * 0.3 + w.x) * 0.15;
          ctx.fillStyle = `rgba(255, 220, 100, ${fx * 0.6})`;
          ctx.fillRect(bx + w.x, by + w.y, 10, 14);
        }
      }
    }

    // Mid-layer elements (parallax 0.5)
    this.drawMidLayer(ctx, cx, cy);
  }

  private drawMidLayer(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    if (this.bgStyle === 'factory') {
      // Pipes and machinery silhouettes
      ctx.fillStyle = 'rgba(30,15,10,0.7)';
      for (let i = 0; i < 20; i++) {
        const px = ((i * 230 - cx * 0.5) % (this.worldWidth + 400) + this.worldWidth) % (this.worldWidth + 400) - 200;
        const py = CANVAS_HEIGHT - 150 - (i % 3) * 40;
        ctx.fillRect(px, py, 20, 150);
        ctx.fillRect(px - 20, py + 20, 60, 20);
      }
    } else if (this.bgStyle === 'void') {
      // Floating ruins
      ctx.fillStyle = 'rgba(30,0,60,0.5)';
      for (let i = 0; i < 12; i++) {
        const px = ((i * 350 - cx * 0.4) % (this.worldWidth + 400) + this.worldWidth + 400) % (this.worldWidth + 400) - 200;
        const py = 150 + (i % 4) * 60 - cy * 0.15;
        ctx.fillRect(px, py, 60 + i * 10, 20);
        ctx.fillRect(px + 10, py - 30, 30, 30);
      }
      // Nebula patches
      for (let i = 0; i < 5; i++) {
        const nx = ((i * 700 - cx * 0.1) % (CANVAS_WIDTH + 400) + CANVAS_WIDTH + 400) % (CANVAS_WIDTH + 400);
        const ny = 100 + i * 80;
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, 120);
        grad.addColorStop(0, `rgba(${60 + i * 20}, 0, ${100 + i * 15}, 0.06)`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(nx, ny, 120, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
