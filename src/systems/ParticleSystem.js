import { randomRange } from '../core/constants';
export class ParticleSystem {
    constructor() {
        Object.defineProperty(this, "particles", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    emit(cfg) {
        this.particles.push({
            x: cfg.x,
            y: cfg.y,
            vx: cfg.vx ?? 0,
            vy: cfg.vy ?? 0,
            life: cfg.life,
            maxLife: cfg.life,
            size: cfg.size,
            color: cfg.color,
            gravity: cfg.gravity ?? 0,
            fade: cfg.fade ?? true,
            shrink: cfg.shrink ?? true,
            glow: cfg.glow ?? false,
        });
    }
    burst(x, y, count, color, speed = 200, life = 0.5, size = 4, glow = false) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + randomRange(-0.3, 0.3);
            const s = randomRange(speed * 0.3, speed);
            this.emit({
                x: x + randomRange(-4, 4),
                y: y + randomRange(-4, 4),
                vx: Math.cos(angle) * s,
                vy: Math.sin(angle) * s,
                life: randomRange(life * 0.5, life),
                size: randomRange(size * 0.5, size),
                color,
                gravity: 400,
                glow,
            });
        }
    }
    burstDir(x, y, count, color, dirX, dirY, speed = 150, spread = 1, life = 0.4, size = 3) {
        for (let i = 0; i < count; i++) {
            const angle = Math.atan2(dirY, dirX) + randomRange(-spread, spread);
            const s = randomRange(speed * 0.5, speed);
            this.emit({
                x, y,
                vx: Math.cos(angle) * s,
                vy: Math.sin(angle) * s,
                life: randomRange(life * 0.5, life),
                size: randomRange(size * 0.5, size),
                color,
                gravity: 300,
            });
        }
    }
    sparkle(x, y, color, count = 6) {
        for (let i = 0; i < count; i++) {
            this.emit({
                x: x + randomRange(-8, 8),
                y: y + randomRange(-8, 8),
                vx: randomRange(-30, 30),
                vy: randomRange(-80, -20),
                life: randomRange(0.3, 0.7),
                size: randomRange(2, 4),
                color,
                gravity: 50,
                glow: true,
            });
        }
    }
    rewindTrail(x, y) {
        this.emit({
            x: x + randomRange(-8, 8),
            y: y + randomRange(-8, 8),
            vx: randomRange(-20, 20),
            vy: randomRange(-30, 10),
            life: randomRange(0.2, 0.5),
            size: randomRange(3, 8),
            color: `hsl(${randomRange(260, 300)}, 80%, 70%)`,
            gravity: -50,
            glow: true,
        });
    }
    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += p.gravity * dt;
            p.vx *= Math.pow(0.92, dt * 60);
        }
    }
    updateReverse(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            p.x -= p.vx * dt;
            p.y -= p.vy * dt;
        }
    }
    draw(ctx) {
        for (const p of this.particles) {
            const t = p.life / p.maxLife;
            const alpha = p.fade ? t : 1;
            const size = p.shrink ? p.size * t : p.size;
            if (p.glow) {
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2);
                grad.addColorStop(0, p.color);
                grad.addColorStop(1, 'transparent');
                ctx.globalAlpha = alpha * 0.6;
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.5, size), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
    getSnapshot() {
        return this.particles.map(p => ({ ...p }));
    }
    restoreSnapshot(snap) {
        this.particles = snap.map(p => ({ ...p }));
    }
    clear() { this.particles = []; }
    get count() { return this.particles.length; }
}
