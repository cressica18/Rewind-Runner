import { PALETTE, randomRange } from '../core/constants';
export class Platform {
    constructor(x, y, w, h, type = 'solid', opts = {}) {
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
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "crackLevel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "collapseTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "collapsed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "respawnTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "active", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        // For moving platforms
        Object.defineProperty(this, "moveT", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "moveSpeed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "moveRange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "moveAxis", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "originX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "originY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // For spike platforms
        Object.defineProperty(this, "spikeCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.type = type;
        this.moveSpeed = opts.moveSpeed ?? 80;
        this.moveRange = opts.moveRange ?? 100;
        this.moveAxis = opts.moveAxis ?? 'x';
        this.originX = x;
        this.originY = y;
        this.spikeCount = opts.spikeCount ?? Math.floor(w / 16);
    }
    get rect() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }
    get top() { return this.y; }
    getState() {
        return {
            x: this.x, y: this.y, crackLevel: this.crackLevel,
            collapseTimer: this.collapseTimer, collapsed: this.collapsed,
            respawnTimer: this.respawnTimer, moveT: this.moveT, active: this.active,
        };
    }
    restoreState(s) {
        this.x = s.x;
        this.y = s.y;
        this.crackLevel = s.crackLevel;
        this.collapseTimer = s.collapseTimer;
        this.collapsed = s.collapsed;
        this.respawnTimer = s.respawnTimer;
        this.moveT = s.moveT;
        this.active = s.active;
    }
    update(dt, particles, audio) {
        if (this.type === 'moving') {
            this.moveT += dt * this.moveSpeed / this.moveRange;
            const offset = Math.sin(this.moveT) * this.moveRange;
            if (this.moveAxis === 'x')
                this.x = this.originX + offset;
            else
                this.y = this.originY + offset;
        }
        if (this.type === 'crumbling' && this.crackLevel > 0 && !this.collapsed) {
            this.collapseTimer -= dt;
            if (Math.random() < 0.15 * dt * this.crackLevel * 60) {
                particles.emit({
                    x: this.x + randomRange(0, this.w),
                    y: this.y,
                    vx: randomRange(-20, 20),
                    vy: randomRange(-20, 40),
                    life: randomRange(0.3, 0.6),
                    size: randomRange(2, 4),
                    color: PALETTE.debris,
                    gravity: 200,
                });
            }
            if (this.collapseTimer <= 0) {
                this.collapse(particles, audio);
            }
        }
        if (this.collapsed && this.type === 'crumbling') {
            this.respawnTimer -= dt;
            if (this.respawnTimer <= 0) {
                this.collapsed = false;
                this.crackLevel = 0;
                this.active = true;
                this.collapseTimer = 0;
            }
        }
    }
    crack(particles, audio) {
        if (this.type !== 'crumbling' || this.collapsed)
            return;
        const prev = this.crackLevel;
        this.crackLevel = Math.min(3, this.crackLevel + 1);
        if (this.crackLevel !== prev) {
            audio.platformCrack();
            particles.burst(this.x + this.w / 2, this.y, 4, PALETTE.debris, 80, 0.3, 2);
            if (this.crackLevel === 1)
                this.collapseTimer = Platform.COLLAPSE_TIME;
        }
    }
    collapse(particles, audio) {
        this.collapsed = true;
        this.active = false;
        this.respawnTimer = Platform.RESPAWN_TIME;
        audio.platformCollapse();
        for (let i = 0; i < 12; i++) {
            particles.emit({
                x: this.x + randomRange(0, this.w),
                y: this.y + randomRange(0, this.h),
                vx: randomRange(-120, 120),
                vy: randomRange(-150, 50),
                life: randomRange(0.5, 1.2),
                size: randomRange(3, 8),
                color: PALETTE.debris,
                gravity: 400,
            });
        }
    }
    draw(ctx, time, isRewinding) {
        if (this.collapsed)
            return;
        if (!this.active && this.type !== 'crumbling')
            return;
        ctx.save();
        if (this.type === 'spike') {
            this.drawSpikes(ctx);
            ctx.restore();
            return;
        }
        if (this.type === 'rewind_only') {
            this.drawRewindOnly(ctx, time, isRewinding);
            ctx.restore();
            return;
        }
        if (this.type === 'bouncy') {
            ctx.fillStyle = '#2cb67d';
            this.roundRect(ctx, this.x, this.y, this.w, this.h, 6);
            ctx.fill();
            ctx.strokeStyle = '#1a8a5a';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
            return;
        }
        // Platform base color
        let topColor = PALETTE.platform;
        let sideColor = '#2a2340';
        if (this.type === 'crumbling') {
            const t = this.crackLevel / 3;
            topColor = `hsl(${20 + t * 0}, ${20 + t * 20}%, ${30 - t * 10}%)`;
            sideColor = '#1a120a';
        }
        else if (this.type === 'moving') {
            topColor = '#3a2a5a';
            sideColor = '#1e1430';
        }
        // Shadow/base
        ctx.fillStyle = sideColor;
        ctx.fillRect(this.x, this.y + 4, this.w, this.h);
        // Top surface
        ctx.fillStyle = topColor;
        this.roundRect(ctx, this.x, this.y, this.w, this.h - 2, 3);
        ctx.fill();
        // Top highlight
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(this.x + 2, this.y + 2, this.w - 4, 3);
        // Crack lines
        if (this.type === 'crumbling' && this.crackLevel > 0) {
            ctx.strokeStyle = 'rgba(0,0,0,0.7)';
            ctx.lineWidth = this.crackLevel;
            for (let c = 0; c < this.crackLevel * 2; c++) {
                const cx = this.x + 8 + (c / (this.crackLevel * 2)) * (this.w - 16);
                ctx.beginPath();
                ctx.moveTo(cx, this.y + 2);
                ctx.lineTo(cx + randomRange(-4, 4), this.y + this.h - 4);
                ctx.stroke();
            }
        }
        // Moving platform glow
        if (this.type === 'moving') {
            ctx.strokeStyle = PALETTE.accentDim;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(this.x + 1, this.y + 1, this.w - 2, this.h - 2);
            ctx.setLineDash([]);
        }
        ctx.restore();
    }
    drawSpikes(ctx) {
        const sw = this.w / this.spikeCount;
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(this.x, this.y + this.h * 0.6, this.w, this.h * 0.4);
        ctx.fillStyle = PALETTE.spike;
        for (let i = 0; i < this.spikeCount; i++) {
            const sx = this.x + i * sw;
            ctx.beginPath();
            ctx.moveTo(sx, this.y + this.h);
            ctx.lineTo(sx + sw / 2, this.y);
            ctx.lineTo(sx + sw, this.y + this.h);
            ctx.closePath();
            ctx.fill();
        }
    }
    drawRewindOnly(ctx, time, isRewinding) {
        const alpha = isRewinding ? 1 : (0.3 + Math.sin(time * 4) * 0.2);
        ctx.globalAlpha = alpha;
        const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
        grad.addColorStop(0, PALETTE.rewindBlue);
        grad.addColorStop(1, PALETTE.rewindPurple);
        ctx.fillStyle = grad;
        this.roundRect(ctx, this.x, this.y, this.w, this.h, 4);
        ctx.fill();
        ctx.strokeStyle = PALETTE.rewindBlue;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
        if (!isRewinding) {
            // Ghost arrows suggesting "rewind needed"
            ctx.fillStyle = `rgba(0, 212, 255, ${0.4 + Math.sin(time * 3) * 0.2})`;
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('⟳', this.x + this.w / 2, this.y + this.h / 2 + 4);
        }
    }
    roundRect(ctx, x, y, w, h, r) {
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
}
Object.defineProperty(Platform, "COLLAPSE_TIME", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 1.5
});
Object.defineProperty(Platform, "RESPAWN_TIME", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 6
});
