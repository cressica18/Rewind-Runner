import { randomRange } from '../core/constants';
export class FireEffect {
    constructor(positions) {
        Object.defineProperty(this, "particles", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "positions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        this.positions = positions;
    }
    update(dt, isRewinding) {
        this.timer += dt;
        if (!isRewinding) {
            for (const pos of this.positions) {
                const count = Math.floor(randomRange(1, 4));
                for (let i = 0; i < count; i++) {
                    this.particles.push({
                        x: pos.x + randomRange(-12, 12),
                        y: pos.y,
                        vx: randomRange(-20, 20),
                        vy: randomRange(-80, -160),
                        life: randomRange(0.3, 0.8),
                        maxLife: 0.8,
                        size: randomRange(6, 14),
                        hue: randomRange(0, 40),
                    });
                }
            }
        }
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            if (isRewinding) {
                p.life -= dt * 2;
            }
            else {
                p.life -= dt;
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.vx *= Math.pow(0.9, dt * 60);
                p.vy *= Math.pow(0.97, dt * 60);
            }
            if (p.life <= 0)
                this.particles.splice(i, 1);
        }
    }
    draw(ctx, cameraX) {
        for (const p of this.particles) {
            const t = p.life / p.maxLife;
            const alpha = t * 0.8;
            const size = p.size * t;
            const hue = p.hue + (1 - t) * 20;
            const sat = 90 - (1 - t) * 30;
            const light = 50 + t * 20;
            ctx.save();
            ctx.globalAlpha = alpha;
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
            grad.addColorStop(0, `hsl(${hue}, ${sat}%, ${light}%)`);
            grad.addColorStop(0.6, `hsla(${hue}, 90%, 40%, 0.5)`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}
