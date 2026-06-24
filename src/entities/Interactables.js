import { PALETTE, rectOverlap, randomRange } from '../core/constants';
export class Collectible {
    constructor(x, y, isStar = false) {
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "w", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 20
        });
        Object.defineProperty(this, "h", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 20
        });
        Object.defineProperty(this, "collected", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "bobTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "isStar", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.x = x;
        this.y = y;
        this.isStar = isStar;
    }
    get rect() { return { x: this.x - 10, y: this.y - 10, w: this.w, h: this.h }; }
    getState() { return { collected: this.collected, bobTimer: this.bobTimer }; }
    restoreState(s) {
        this.collected = s.collected;
        this.bobTimer = s.bobTimer;
    }
    update(dt) {
        if (!this.collected)
            this.bobTimer += dt;
    }
    collect(particles) {
        if (this.collected)
            return;
        this.collected = true;
        const color = this.isStar ? PALETTE.gold : PALETTE.green;
        particles.burst(this.x, this.y, 12, color, 200, 0.6, 5, true);
        particles.sparkle(this.x, this.y, color, 8);
    }
    draw(ctx) {
        if (this.collected)
            return;
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
        }
        else {
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
    drawStar(ctx, cx, cy, outerR, innerR, points) {
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const a = (i * Math.PI) / points - Math.PI / 2;
            if (i === 0)
                ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
            else
                ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
        }
        ctx.closePath();
    }
}
export class Switch {
    constructor(x, y, id, countdownDuration = 0) {
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "w", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 24
        });
        Object.defineProperty(this, "h", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 16
        });
        Object.defineProperty(this, "activated", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "timer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "countdownDuration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.x = x;
        this.y = y;
        this.id = id;
        this.countdownDuration = countdownDuration;
    }
    get rect() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }
    getState() { return { activated: this.activated, timer: this.timer }; }
    restoreState(s) { this.activated = s.activated; this.timer = s.timer; }
    update(dt) {
        if (this.activated && this.countdownDuration > 0) {
            this.timer -= dt;
            if (this.timer <= 0) {
                this.activated = false;
                this.timer = 0;
            }
        }
    }
    activate() {
        this.activated = true;
        if (this.countdownDuration > 0)
            this.timer = this.countdownDuration;
    }
    draw(ctx) {
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
export class Door {
    constructor(x, y, w, h, switchId) {
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "w", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "h", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "open", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "openAmount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "switchId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.switchId = switchId;
    }
    get rect() {
        if (this.openAmount >= 0.95)
            return { x: this.x, y: -1000, w: this.w, h: 0 };
        return { x: this.x, y: this.y + this.h * this.openAmount, w: this.w, h: this.h * (1 - this.openAmount) };
    }
    getState() { return { open: this.open, openAmount: this.openAmount }; }
    restoreState(s) { this.open = s.open; this.openAmount = s.openAmount; }
    update(dt, switchActivated) {
        this.open = switchActivated;
        const target = this.open ? 1 : 0;
        this.openAmount += (target - this.openAmount) * Math.min(1, dt * 5);
    }
    draw(ctx) {
        if (this.openAmount >= 0.99)
            return;
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
export class Portal {
    constructor(x, y) {
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "w", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 40
        });
        Object.defineProperty(this, "h", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 64
        });
        Object.defineProperty(this, "active", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "spinAngle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        this.x = x;
        this.y = y;
    }
    get rect() { return { x: this.x - 20, y: this.y - 32, w: this.w, h: this.h }; }
    getState() { return { active: this.active, spinAngle: this.spinAngle }; }
    restoreState(s) { this.active = s.active; this.spinAngle = s.spinAngle; }
    update(dt, particles) {
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
    draw(ctx, time) {
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
    touches(r) {
        return rectOverlap(this.rect, r);
    }
}
export class Checkpoint {
    constructor(x, y, id) {
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "w", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 12
        });
        Object.defineProperty(this, "h", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 48
        });
        Object.defineProperty(this, "activated", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "flagAnim", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        this.x = x;
        this.y = y;
        this.id = id;
    }
    get rect() { return { x: this.x - 16, y: this.y - 48, w: 40, h: 64 }; }
    getState() { return { activated: this.activated }; }
    restoreState(s) { this.activated = s.activated; }
    update(dt) { this.flagAnim += dt; }
    draw(ctx) {
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
