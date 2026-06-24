import { CANVAS_WIDTH, CANVAS_HEIGHT, PALETTE } from '../core/constants';
export class MenuSystem {
    constructor() {
        Object.defineProperty(this, "time", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "particles", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    update(dt) {
        this.time += dt;
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.life <= 0)
                this.particles.splice(i, 1);
        }
        if (Math.random() < 0.3) {
            this.particles.push({
                x: Math.random() * CANVAS_WIDTH,
                y: CANVAS_HEIGHT + 10,
                vx: (Math.random() - 0.5) * 60,
                vy: -(Math.random() * 80 + 40),
                life: Math.random() * 3 + 1,
                color: Math.random() < 0.5 ? PALETTE.accent : PALETTE.green,
            });
        }
    }
    drawBackground(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        grad.addColorStop(0, '#050310');
        grad.addColorStop(1, '#0d0820');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        for (const p of this.particles) {
            const a = p.life > 1 ? 0.6 : p.life * 0.6;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = a;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        // Grid lines
        ctx.strokeStyle = 'rgba(127,90,240,0.06)';
        ctx.lineWidth = 1;
        for (let x = 0; x < CANVAS_WIDTH; x += 60) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_HEIGHT);
            ctx.stroke();
        }
        for (let y = 0; y < CANVAS_HEIGHT; y += 60) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_WIDTH, y);
            ctx.stroke();
        }
    }
    drawMainMenu(ctx, hoveredBtn) {
        this.drawBackground(ctx);
        // Title
        const pulse = Math.sin(this.time * 2) * 0.05 + 1;
        ctx.save();
        ctx.translate(CANVAS_WIDTH / 2, 200);
        ctx.scale(pulse, pulse);
        ctx.shadowColor = PALETTE.accent;
        ctx.shadowBlur = 32;
        ctx.font = 'bold 72px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const titleGrad = ctx.createLinearGradient(-200, 0, 200, 0);
        titleGrad.addColorStop(0, '#00d4ff');
        titleGrad.addColorStop(0.5, '#a855f7');
        titleGrad.addColorStop(1, '#2cb67d');
        ctx.fillStyle = titleGrad;
        ctx.fillText('REWIND', 0, -30);
        ctx.fillText('RUNNER', 0, 50);
        ctx.shadowBlur = 0;
        ctx.font = '14px "Courier New", monospace';
        ctx.fillStyle = PALETTE.muted;
        ctx.fillText('— A TEMPORAL PLATFORMER —', 0, 110);
        ctx.restore();
        // Buttons
        const buttons = [
            { label: 'PLAY', action: 'play' },
            { label: 'LEVEL SELECT', action: 'levelselect' },
            { label: 'CONTROLS', action: 'controls' },
        ];
        const bw = 280, bh = 52, bx = CANVAS_WIDTH / 2 - bw / 2;
        let by = 360;
        for (let i = 0; i < buttons.length; i++) {
            const hovered = hoveredBtn === i;
            this.drawButton(ctx, bx, by, bw, bh, buttons[i].label, hovered);
            by += bh + 16;
        }
        // Version
        ctx.font = '10px "Courier New", monospace';
        ctx.fillStyle = 'rgba(148,161,178,0.4)';
        ctx.textAlign = 'right';
        ctx.fillText('v1.0.0', CANVAS_WIDTH - 16, CANVAS_HEIGHT - 8);
        return null;
    }
    drawButton(ctx, x, y, w, h, label, hovered) {
        ctx.save();
        const alpha = hovered ? 1 : 0.7;
        if (hovered) {
            ctx.shadowColor = PALETTE.accent;
            ctx.shadowBlur = 16;
        }
        const bg = hovered
            ? ctx.createLinearGradient(x, y, x + w, y + h)
            : null;
        if (bg) {
            bg.addColorStop(0, 'rgba(127,90,240,0.3)');
            bg.addColorStop(1, 'rgba(44,182,125,0.15)');
            ctx.fillStyle = bg;
        }
        else {
            ctx.fillStyle = 'rgba(20,15,35,0.8)';
        }
        this.roundRect(ctx, x, y, w, h, 6);
        ctx.fill();
        ctx.strokeStyle = hovered ? PALETTE.accent : 'rgba(127,90,240,0.3)';
        ctx.lineWidth = hovered ? 2 : 1;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.font = `bold 16px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = hovered ? '#ffffff' : PALETTE.muted;
        ctx.globalAlpha = alpha;
        ctx.fillText(label, x + w / 2, y + h / 2);
        ctx.restore();
    }
    drawPauseMenu(ctx, hoveredBtn) {
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        const px = CANVAS_WIDTH / 2 - 160;
        const py = CANVAS_HEIGHT / 2 - 160;
        ctx.fillStyle = 'rgba(10,8,18,0.95)';
        this.roundRect(ctx, px, py, 320, 320, 12);
        ctx.fill();
        ctx.strokeStyle = PALETTE.accent;
        ctx.lineWidth = 2;
        this.roundRect(ctx, px, py, 320, 320, 12);
        ctx.stroke();
        ctx.font = 'bold 28px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = PALETTE.text;
        ctx.fillText('PAUSED', CANVAS_WIDTH / 2, py + 50);
        const buttons = ['RESUME', 'RESTART LEVEL', 'MAIN MENU'];
        let by = py + 100;
        for (let i = 0; i < buttons.length; i++) {
            this.drawButton(ctx, CANVAS_WIDTH / 2 - 120, by, 240, 48, buttons[i], hoveredBtn === i);
            by += 64;
        }
    }
    drawLevelComplete(ctx, data) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        const px = CANVAS_WIDTH / 2 - 240;
        const py = 100;
        const pw = 480;
        const ph = 500;
        ctx.fillStyle = 'rgba(8,6,18,0.97)';
        this.roundRect(ctx, px, py, pw, ph, 16);
        ctx.fill();
        const grad = ctx.createLinearGradient(px, py, px + pw, py);
        grad.addColorStop(0, 'rgba(127,90,240,0.6)');
        grad.addColorStop(1, 'rgba(44,182,125,0.6)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        this.roundRect(ctx, px, py, pw, ph, 16);
        ctx.stroke();
        ctx.textAlign = 'center';
        ctx.font = 'bold 14px "Courier New", monospace';
        ctx.fillStyle = PALETTE.muted;
        ctx.fillText('LEVEL COMPLETE', CANVAS_WIDTH / 2, py + 35);
        ctx.font = 'bold 28px "Courier New", monospace';
        ctx.fillStyle = PALETTE.text;
        ctx.fillText(data.levelName, CANVAS_WIDTH / 2, py + 70);
        // Stars
        const starColors = ['#888', PALETTE.gold, PALETTE.gold];
        for (let i = 0; i < 3; i++) {
            const sx = CANVAS_WIDTH / 2 - 60 + i * 60;
            const sy = py + 110;
            const filled = i < data.stars;
            ctx.save();
            ctx.translate(sx, sy);
            this.drawStar(ctx, 0, 0, 16, 8, 5);
            ctx.fillStyle = filled ? PALETTE.gold : 'rgba(80,80,80,0.5)';
            ctx.fill();
            ctx.strokeStyle = filled ? '#fff8a0' : '#444';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        }
        // Stats
        const mins = Math.floor(data.time / 60);
        const secs = Math.floor(data.time % 60);
        const stats = [
            { label: 'TIME', value: `${mins}:${secs.toString().padStart(2, '0')}` },
            { label: 'COLLECTIBLES', value: `${data.collectibles}/${data.totalCollectibles}` },
            { label: 'REWINDS USED', value: data.rewindsUsed.toString() },
            { label: 'SCORE', value: data.score.toString().padStart(6, '0') },
        ];
        let sy2 = py + 160;
        for (const stat of stats) {
            ctx.font = '13px "Courier New", monospace';
            ctx.fillStyle = PALETTE.muted;
            ctx.textAlign = 'left';
            ctx.fillText(stat.label, px + 60, sy2);
            ctx.fillStyle = PALETTE.text;
            ctx.textAlign = 'right';
            ctx.fillText(stat.value, px + pw - 60, sy2);
            sy2 += 28;
        }
        // Buttons
        const nextLabel = data.isLastLevel ? 'MAIN MENU' : 'NEXT LEVEL';
        this.drawButton(ctx, px + 40, py + 400, pw / 2 - 56, 48, nextLabel, data.hoveredBtn === 0);
        this.drawButton(ctx, CANVAS_WIDTH / 2 + 16, py + 400, pw / 2 - 56, 48, 'LEVEL SELECT', data.hoveredBtn === 1);
    }
    drawGameOver(ctx, hoveredBtn) {
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.textAlign = 'center';
        ctx.font = 'bold 52px "Courier New", monospace';
        ctx.fillStyle = PALETTE.warn;
        ctx.shadowColor = PALETTE.warn;
        ctx.shadowBlur = 24;
        ctx.fillText('TEMPORAL', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
        ctx.fillText('COLLAPSE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.shadowBlur = 0;
        ctx.font = '16px "Courier New", monospace';
        ctx.fillStyle = PALETTE.muted;
        ctx.fillText('The timeline has been severed.', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 52);
        this.drawButton(ctx, CANVAS_WIDTH / 2 - 140, CANVAS_HEIGHT / 2 + 100, 280, 52, 'TRY AGAIN', hoveredBtn === 0);
        this.drawButton(ctx, CANVAS_WIDTH / 2 - 140, CANVAS_HEIGHT / 2 + 168, 280, 52, 'MAIN MENU', hoveredBtn === 1);
    }
    drawControls(ctx, hoveredBtn) {
        this.drawBackground(ctx);
        ctx.textAlign = 'center';
        ctx.font = 'bold 32px "Courier New", monospace';
        ctx.fillStyle = PALETTE.text;
        ctx.fillText('CONTROLS', CANVAS_WIDTH / 2, 80);
        const controls = [
            { key: 'A / ←', action: 'Move Left' },
            { key: 'D / →', action: 'Move Right' },
            { key: 'W / ↑ / Space', action: 'Jump' },
            { key: 'Shift / Z (Hold)', action: 'REWIND TIME' },
            { key: 'E', action: 'Interact (switches)' },
            { key: 'Escape', action: 'Pause / Menu' },
        ];
        const cx = CANVAS_WIDTH / 2;
        let ky = 160;
        for (const c of controls) {
            ctx.fillStyle = 'rgba(127,90,240,0.15)';
            ctx.fillRect(cx - 280, ky - 16, 560, 36);
            ctx.strokeStyle = 'rgba(127,90,240,0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(cx - 280, ky - 16, 560, 36);
            ctx.font = 'bold 14px "Courier New", monospace';
            ctx.fillStyle = PALETTE.accent;
            ctx.textAlign = 'left';
            ctx.fillText(c.key, cx - 270, ky + 6);
            ctx.fillStyle = PALETTE.text;
            ctx.textAlign = 'right';
            ctx.fillText(c.action, cx + 270, ky + 6);
            ky += 52;
        }
        // Tips
        ctx.textAlign = 'center';
        ctx.font = '13px "Courier New", monospace';
        ctx.fillStyle = PALETTE.muted;
        ctx.fillText('TIP: Rewind-only platforms ⟳ can only be stood on while rewinding time', cx, ky + 20);
        ctx.fillText('TIP: Switches with timers — rewind after activating for puzzle solutions', cx, ky + 44);
        this.drawButton(ctx, cx - 100, ky + 90, 200, 48, '← BACK', hoveredBtn === 0);
    }
    drawLevelSelect(ctx, hoveredBtn, unlockedLevels, levelData) {
        this.drawBackground(ctx);
        ctx.textAlign = 'center';
        ctx.font = 'bold 32px "Courier New", monospace';
        ctx.fillStyle = PALETTE.text;
        ctx.fillText('LEVEL SELECT', CANVAS_WIDTH / 2, 80);
        const cols = 3;
        const cardW = 260;
        const cardH = 160;
        const startX = CANVAS_WIDTH / 2 - (cols * (cardW + 20)) / 2 + 10;
        for (let i = 0; i < levelData.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const cx2 = startX + col * (cardW + 20);
            const cy = 160 + row * (cardH + 20);
            const unlocked = i < unlockedLevels;
            const hovered = hoveredBtn === i;
            ctx.save();
            ctx.fillStyle = hovered && unlocked ? 'rgba(127,90,240,0.25)' : 'rgba(15,12,25,0.8)';
            this.roundRect(ctx, cx2, cy, cardW, cardH, 10);
            ctx.fill();
            ctx.strokeStyle = hovered && unlocked ? PALETTE.accent : unlocked ? 'rgba(127,90,240,0.4)' : 'rgba(60,60,80,0.5)';
            ctx.lineWidth = hovered ? 2 : 1;
            this.roundRect(ctx, cx2, cy, cardW, cardH, 10);
            ctx.stroke();
            ctx.textAlign = 'center';
            ctx.font = 'bold 18px "Courier New", monospace';
            ctx.fillStyle = unlocked ? PALETTE.text : '#555';
            ctx.fillText(levelData[i].name, cx2 + cardW / 2, cy + 36);
            ctx.font = '12px "Courier New", monospace';
            ctx.fillStyle = unlocked ? PALETTE.muted : '#444';
            ctx.fillText(levelData[i].subtitle, cx2 + cardW / 2, cy + 58);
            // Stars
            for (let s = 0; s < 3; s++) {
                const sx2 = cx2 + cardW / 2 - 28 + s * 28;
                this.drawStar(ctx, sx2, cy + 90, 8, 4, 5);
                ctx.fillStyle = (unlocked && s < levelData[i].stars) ? PALETTE.gold : '#333';
                ctx.fill();
            }
            if (!unlocked) {
                ctx.font = '24px "Courier New", monospace';
                ctx.fillStyle = '#555';
                ctx.fillText('🔒', cx2 + cardW / 2, cy + cardH / 2 + 8);
            }
            ctx.restore();
        }
        this.drawButton(ctx, CANVAS_WIDTH / 2 - 100, CANVAS_HEIGHT - 80, 200, 48, '← BACK', hoveredBtn === levelData.length);
    }
    getButtonIndex(mx, my, buttons) {
        for (let i = 0; i < buttons.length; i++) {
            const b = buttons[i];
            if (mx >= b.x && mx < b.x + b.w && my >= b.y && my < b.y + b.h)
                return i;
        }
        return -1;
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
