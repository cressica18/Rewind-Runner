import { rectOverlap } from './core/constants';
import { Player } from './entities/Player';
import { TimeEcho } from './entities/TimeEcho';
import { ParticleSystem } from './systems/ParticleSystem';
import { RewindSystem } from './systems/RewindSystem';
import { FireEffect } from './fx/FireEffect';
import { Background } from './fx/Background';
export class World {
    constructor(config, audio) {
        // Core entities
        Object.defineProperty(this, "player", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "platforms", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "hazards", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "collectibles", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "switches", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "doors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "portal", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "checkpoints", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Systems
        Object.defineProperty(this, "particles", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "rewind", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fire", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "background", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "echo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // State
        Object.defineProperty(this, "levelTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "score", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "rewindsUsed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "activeCheckpoint", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "portalReached", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "playerDead", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "deathTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "DEATH_RESPAWN_TIME", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 2.0
        });
        // Level info
        Object.defineProperty(this, "levelWidth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "levelHeight", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.player = new Player(config.playerStart.x, config.playerStart.y);
        this.platforms = config.platforms;
        this.hazards = config.hazards;
        this.collectibles = config.collectibles;
        this.switches = config.switches;
        this.doors = config.doors;
        this.portal = config.portal;
        this.checkpoints = config.checkpoints;
        this.levelWidth = config.width;
        this.levelHeight = config.height;
        this.particles = new ParticleSystem();
        this.rewind = new RewindSystem();
        this.fire = new FireEffect(config.firePositions);
        this.background = new Background(config.bgStyle, config.width);
        this.echo = new TimeEcho(3);
        void audio; // audio passed through to update calls
    }
    update(dt, left, right, jumpPressed, jumpHeld, wantsRewind, wantsInteract, audio) {
        this.levelTime += dt;
        // Rewind system tick
        const snapshot = this.rewind.update(dt, wantsRewind);
        if (this.rewind.justStartedRewind) {
            audio.rewindStart();
            this.rewindsUsed++;
        }
        if (this.rewind.justEndedRewind) {
            audio.rewindEnd();
        }
        if (snapshot) {
            // Restore world from history
            this.applySnapshot(snapshot);
            this.particles.update(dt);
            this.fire.update(dt, true);
            this.background.update(dt);
            return;
        }
        // Normal forward simulation
        if (!this.playerDead) {
            // Record echo
            this.echo.record(this.player.getState());
            // Player update (applies velocity, physics)
            this.player.isRewinding = false;
            this.player.update(dt, left, right, jumpPressed, jumpHeld, this.particles, audio);
            // Platform updates
            for (const p of this.platforms) {
                p.update(dt, this.particles, audio);
            }
            // Resolve collisions
            this.resolveCollisions(dt, audio);
            // Hazard updates
            for (const h of this.hazards) {
                h.update(dt, this.levelTime, this.particles);
            }
            // Collectible updates
            for (const c of this.collectibles) {
                c.update(dt);
            }
            // Switch / door updates
            for (const sw of this.switches) {
                sw.update(dt);
            }
            for (const door of this.doors) {
                const sw = this.switches.find(s => s.id === door.switchId);
                door.update(dt, sw?.activated ?? false);
            }
            // Portal update
            this.portal.update(dt, this.particles);
            // Checkpoint updates
            for (const cp of this.checkpoints) {
                cp.update(dt);
            }
            // Player interactions
            this.handleInteractions(wantsInteract, audio);
            // Death check: fall off world
            if (this.player.y > this.levelHeight + 100) {
                this.player.kill(this.particles, audio);
            }
            // Death logic
            if (this.player.isDead && !this.playerDead) {
                this.playerDead = true;
                this.deathTimer = this.DEATH_RESPAWN_TIME;
            }
        }
        else {
            this.deathTimer -= dt;
            if (this.deathTimer <= 0) {
                this.respawnPlayer();
            }
        }
        // Particles
        this.particles.update(dt);
        this.fire.update(dt, false);
        this.background.update(dt);
        this.echo.updateIdle(dt);
        // Record snapshot for rewind
        this.rewind.record(this.buildSnapshot());
    }
    resolveCollisions(dt, audio) {
        const p = this.player;
        for (const platform of this.platforms) {
            if (!platform.active || platform.collapsed)
                continue;
            if (platform.type === 'rewind_only' && !this.rewind.isRewinding)
                continue;
            if (platform.type === 'spike') {
                // Spike platforms kill on touch
                if (rectOverlap(p.rect, platform.rect)) {
                    p.kill(this.particles, audio);
                }
                continue;
            }
            // Door collision
            // (handled separately below)
            const pr = p.rect;
            const plr = platform.rect;
            // Only resolve if overlapping
            if (!rectOverlap(pr, plr))
                continue;
            // Figure out overlap depths
            const overlapLeft = (pr.x + pr.w) - plr.x;
            const overlapRight = (plr.x + plr.w) - pr.x;
            const overlapTop = (pr.y + pr.h) - plr.y;
            const overlapBottom = (plr.y + plr.h) - pr.y;
            const minOverlapX = Math.min(overlapLeft, overlapRight);
            const minOverlapY = Math.min(overlapTop, overlapBottom);
            if (minOverlapY < minOverlapX) {
                if (overlapTop < overlapBottom) {
                    // Landing on top
                    p.y = plr.y - pr.h;
                    p.vy = 0;
                    p.onGround = true;
                    // Crack crumbling platforms
                    if (platform.type === 'crumbling' && platform.crackLevel === 0) {
                        platform.crack(this.particles, audio);
                    }
                    // Bouncy platform
                    if (platform.type === 'bouncy') {
                        p.vy = -800;
                        audio.jump();
                    }
                }
                else {
                    // Hitting bottom
                    p.y = plr.y + plr.h;
                    p.vy = Math.max(0, p.vy);
                }
            }
            else {
                if (overlapLeft < overlapRight) {
                    p.x = plr.x - pr.w;
                }
                else {
                    p.x = plr.x + plr.w;
                }
                p.vx = 0;
            }
        }
        // Door collisions
        for (const door of this.doors) {
            const dr = door.rect;
            if (dr.h <= 0)
                continue;
            if (!rectOverlap(p.rect, dr))
                continue;
            const pr = p.rect;
            const overlapLeft = (pr.x + pr.w) - dr.x;
            const overlapRight = (dr.x + dr.w) - pr.x;
            const overlapTop = (pr.y + pr.h) - dr.y;
            const overlapBottom = (dr.y + dr.h) - pr.y;
            const minX = Math.min(overlapLeft, overlapRight);
            const minY = Math.min(overlapTop, overlapBottom);
            if (minY < minX) {
                if (overlapTop < overlapBottom) {
                    p.y = dr.y - p.h;
                    p.vy = 0;
                    p.onGround = true;
                }
                else {
                    p.y = dr.y + dr.h;
                    p.vy = Math.max(0, p.vy);
                }
            }
            else {
                if (overlapLeft < overlapRight)
                    p.x = dr.x - p.w;
                else
                    p.x = dr.x + dr.w;
                p.vx = 0;
            }
        }
        // Hazard collisions
        for (const h of this.hazards) {
            if (h.hitsRect(p.rect)) {
                p.kill(this.particles, audio);
            }
        }
    }
    handleInteractions(wantsInteract, audio) {
        const p = this.player;
        // Collectibles
        for (const c of this.collectibles) {
            if (!c.collected && rectOverlap(p.rect, c.rect)) {
                c.collect(this.particles);
                audio.collect();
                this.score += c.isStar ? 500 : 100;
            }
        }
        // Switches (E key or walk into)
        for (const sw of this.switches) {
            if (rectOverlap(p.rect, sw.rect)) {
                if (wantsInteract && !sw.activated) {
                    sw.activate();
                    audio.switchClick();
                }
            }
        }
        // Checkpoints
        for (const cp of this.checkpoints) {
            if (!cp.activated && rectOverlap(p.rect, cp.rect)) {
                cp.activated = true;
                this.activeCheckpoint = { x: cp.x, y: cp.y - cp.h };
                this.rewind.refillMeter();
                audio.checkpoint();
            }
        }
        // Portal
        if (this.portal.active && rectOverlap(p.rect, this.portal.rect)) {
            this.portalReached = true;
            audio.portalEnter();
        }
    }
    respawnPlayer() {
        const spawnX = this.activeCheckpoint?.x ?? 80;
        const spawnY = this.activeCheckpoint?.y ?? (this.levelHeight - 100);
        this.player = new Player(spawnX, spawnY);
        this.playerDead = false;
        this.rewind.reset();
    }
    buildSnapshot() {
        return {
            time: this.levelTime,
            player: this.player.getState(),
            platforms: this.platforms.map(p => p.getState()),
            hazards: this.hazards.map(h => h.getState()),
            collectibles: this.collectibles.map(c => c.getState()),
            switches: this.switches.map(s => s.getState()),
            doors: this.doors.map(d => d.getState()),
            portal: this.portal.getState(),
            checkpoints: this.checkpoints.map(cp => cp.getState()),
            rewindMeter: this.rewind.meter,
            score: this.score,
            levelTime: this.levelTime,
        };
    }
    applySnapshot(snap) {
        this.player.restoreState(snap.player);
        this.player.isRewinding = true;
        for (let i = 0; i < this.platforms.length; i++) {
            if (snap.platforms[i])
                this.platforms[i].restoreState(snap.platforms[i]);
        }
        for (let i = 0; i < this.hazards.length; i++) {
            if (snap.hazards[i])
                this.hazards[i].restoreState(snap.hazards[i]);
        }
        for (let i = 0; i < this.collectibles.length; i++) {
            if (snap.collectibles[i])
                this.collectibles[i].restoreState(snap.collectibles[i]);
        }
        for (let i = 0; i < this.switches.length; i++) {
            if (snap.switches[i])
                this.switches[i].restoreState(snap.switches[i]);
        }
        for (let i = 0; i < this.doors.length; i++) {
            if (snap.doors[i])
                this.doors[i].restoreState(snap.doors[i]);
        }
        this.portal.restoreState(snap.portal);
        for (let i = 0; i < this.checkpoints.length; i++) {
            if (snap.checkpoints[i])
                this.checkpoints[i].restoreState(snap.checkpoints[i]);
        }
        this.levelTime = snap.levelTime;
        this.score = snap.score;
    }
    draw(ctx, camera, time) {
        const isRewinding = this.rewind.isRewinding;
        // Background (drawn in screen space)
        this.background.draw(ctx, camera);
        // World space
        ctx.save();
        camera.apply(ctx);
        // Fire effects
        this.fire.draw(ctx, camera.screenX);
        // Platforms
        for (const p of this.platforms) {
            if (camera.isVisible(p.x, p.y, p.w, p.h + 8)) {
                p.draw(ctx, time, isRewinding);
            }
        }
        // Doors
        for (const d of this.doors) {
            d.draw(ctx);
        }
        // Switches
        for (const sw of this.switches) {
            sw.draw(ctx);
        }
        // Hazards
        for (const h of this.hazards) {
            h.draw(ctx);
        }
        // Collectibles
        for (const c of this.collectibles) {
            if (!c.collected)
                c.draw(ctx);
        }
        // Checkpoints
        for (const cp of this.checkpoints) {
            cp.draw(ctx);
        }
        // Portal
        this.portal.draw(ctx, time);
        // Time echo (ghost)
        this.echo.update(0.016);
        this.echo.draw(ctx);
        // Player
        this.player.draw(ctx);
        // Particles
        this.particles.draw(ctx);
        ctx.restore();
    }
    get collectiblesCollected() {
        return this.collectibles.filter(c => c.collected).length;
    }
    get totalCollectibles() {
        return this.collectibles.length;
    }
}
