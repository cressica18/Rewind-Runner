import { PALETTE } from '../core/constants';
export class TimeEcho {
    constructor(loopDelay = 2) {
        Object.defineProperty(this, "frames", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "playhead", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "playing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "loopDelay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "loopTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "opacity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0.4
        });
        this.loopDelay = loopDelay;
    }
    record(state) {
        this.frames.push({ ...state });
        if (this.frames.length > 300)
            this.frames.shift();
    }
    startPlayback() {
        if (this.frames.length < 10)
            return;
        this.playhead = 0;
        this.playing = true;
        this.loopTimer = this.loopDelay;
    }
    update(dt) {
        if (!this.playing)
            return;
        this.playhead += dt * 60;
        if (this.playhead >= this.frames.length) {
            this.playing = false;
            this.loopTimer = this.loopDelay;
        }
    }
    updateIdle(dt) {
        if (this.playing)
            return;
        this.loopTimer -= dt;
        if (this.loopTimer <= 0)
            this.startPlayback();
    }
    getCurrentState() {
        if (!this.playing)
            return null;
        const i = Math.floor(this.playhead);
        return this.frames[i] ?? null;
    }
    draw(ctx) {
        if (!this.playing)
            return;
        const state = this.getCurrentState();
        if (!state)
            return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(state.x + 14, state.y + 20);
        if (state.facing < 0)
            ctx.scale(-1, 1);
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
    get hasFrames() { return this.frames.length > 10; }
    clear() { this.frames = []; this.playing = false; }
}
