import { CANVAS_WIDTH, CANVAS_HEIGHT } from './core/constants';
import type { GameState } from './core/constants';
import { InputManager } from './core/input';
import { Camera } from './core/camera';
import { AudioManager } from './audio/AudioManager';
import { VisualEffects } from './fx/VisualEffects';
import { HUD } from './ui/HUD';
import { MenuSystem } from './ui/MenuSystem';
import { loadSave, writeSave, updateLevelSave, calculateStars, calculateScore } from './ui/SaveSystem';
import type { SaveData } from './ui/SaveSystem';
import { LEVEL_BUILDERS } from './levels/LevelData';
import { World } from './World';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreen: HTMLCanvasElement;
  private offCtx: CanvasRenderingContext2D;

  private input: InputManager;
  private camera: Camera;
  private audio: AudioManager;
  private fx: VisualEffects;
  private hud: HUD;
  private menu: MenuSystem;

  private state: GameState = 'menu';
  private world: World | null = null;
  private currentLevel = 0;
  private saveData: SaveData;

  private time = 0;
  private lastFrameTime = 0;

  // Death overlay
  private deathOverlayAlpha = 0;

  // Menu interaction
  private hoveredBtn = 0;
  private mouseX = 0;
  private mouseY = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.ctx = canvas.getContext('2d')!;

    // Offscreen for post-processing
    this.offscreen = document.createElement('canvas');
    this.offscreen.width = CANVAS_WIDTH;
    this.offscreen.height = CANVAS_HEIGHT;
    this.offCtx = this.offscreen.getContext('2d')!;

    this.input = new InputManager();
    this.camera = new Camera();
    this.audio = new AudioManager();
    this.fx = new VisualEffects();
    this.hud = new HUD();
    this.menu = new MenuSystem();

    this.saveData = loadSave();

    // Mouse tracking for menus
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('click', this.onMouseClick);
  }

  start(): void {
    this.lastFrameTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  private loop = (now: number): void => {
    const rawDt = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;
    const dt = Math.min(rawDt, 0.05); // cap at 50ms
    this.time += dt;

    this.update(dt);
    this.render();

    this.input.flush();
    requestAnimationFrame(this.loop);
  };

  private update(dt: number): void {
    this.menu.update(dt);
    this.fx.update(dt);

    switch (this.state) {
      case 'menu':
        this.updateMenu();
        break;
      case 'levelselect':
        this.updateLevelSelect();
        break;
      case 'controls':
        this.updateControls();
        break;
      case 'playing':
        this.updatePlaying(dt);
        break;
      case 'paused':
        this.updatePaused();
        break;
      case 'gameover':
        this.updateGameOver();
        break;
      case 'levelcomplete':
        this.updateLevelComplete();
        break;
    }
  }

  private updateMenu(): void {
    const buttons = this.getMainMenuButtons();
    this.hoveredBtn = this.getHoveredButton(buttons);
    if (this.input.wasPressed('pause')) {
      // no-op on main menu
    }
  }

  private updateLevelSelect(): void {
    const buttons = this.getLevelSelectButtons();
    this.hoveredBtn = this.getHoveredButton(buttons);
    if (this.input.wasPressed('pause')) {
      this.state = 'menu';
    }
  }

  private updateControls(): void {
    if (this.input.wasPressed('pause')) {
      this.state = 'menu';
    }
  }

  private updatePlaying(dt: number): void {
    if (!this.world) return;
    if (this.input.wasPressed('pause')) {
      this.state = 'paused';
      this.hoveredBtn = 0;
      return;
    }

    const w = this.world;
    const isRewinding = w.rewind.isRewinding;

    w.update(
      dt,
      this.input.isHeld('left'),
      this.input.isHeld('right'),
      this.input.wasPressed('jump'),
      this.input.isHeld('jump'),
      this.input.isHeld('rewind'),
      this.input.wasPressed('interact'),
      this.audio,
    );

    // Camera
    this.camera.follow(
      w.player.cx, w.player.cy,
      w.levelWidth, w.levelHeight,
      dt,
    );

    // Visual effects
    this.fx.setRewindIntensity(isRewinding ? w.rewind.meter + 0.3 : Math.max(0, this.fx['rewindIntensity'] - dt * 3));
    if (w.rewind.justStartedRewind) {
      this.fx.triggerShockwave(
        w.player.cx - this.camera.screenX,
        w.player.cy - this.camera.screenY,
      );
    }

    // HUD
    this.hud.update(dt, {
      rewindMeter: w.rewind.meter,
      rewindHistoryFill: w.rewind.historyFill,
      isRewinding,
      score: w.score,
      collectibles: w.collectiblesCollected,
      totalCollectibles: w.totalCollectibles,
      levelTime: w.levelTime,
      levelName: LEVEL_BUILDERS[this.currentLevel] ? `Level ${this.currentLevel + 1}` : '',
      checkpointCount: w.checkpoints.filter(c => c.activated).length,
      currentLevel: this.currentLevel + 1,
      totalLevels: LEVEL_BUILDERS.length,
    });

    // Death overlay
    if (w.playerDead) {
      this.deathOverlayAlpha = Math.min(1, this.deathOverlayAlpha + dt * 2);
    } else {
      this.deathOverlayAlpha = Math.max(0, this.deathOverlayAlpha - dt * 4);
    }

    // Check win
    if (w.portalReached) {
      this.completLevel();
    }

    // Audio rewind ambient
    this.audio.rewindAmbient(isRewinding, w.rewind.meter);
  }

  private completLevel(): void {
    if (!this.world) return;
    const w = this.world;
    const stars = calculateStars(w.levelTime, w.rewindsUsed, w.collectiblesCollected, w.totalCollectibles);
    const score = calculateScore(w.levelTime, w.rewindsUsed, w.collectiblesCollected, w.totalCollectibles);

    this.saveData = updateLevelSave(this.saveData, this.currentLevel, {
      stars,
      time: w.levelTime,
      score,
      collectibles: w.collectiblesCollected,
      totalCollectibles: w.totalCollectibles,
    });
    writeSave(this.saveData);

    this.state = 'levelcomplete';
    this.hoveredBtn = 0;
  }

  private updatePaused(): void {
    const buttons = this.getPauseButtons();
    this.hoveredBtn = this.getHoveredButton(buttons);
    if (this.input.wasPressed('pause')) {
      this.state = 'playing';
    }
  }

  private updateGameOver(): void {
    const buttons = this.getGameOverButtons();
    this.hoveredBtn = this.getHoveredButton(buttons);
  }

  private updateLevelComplete(): void {
    const buttons = this.getLevelCompleteButtons();
    this.hoveredBtn = this.getHoveredButton(buttons);
  }

  private render(): void {
    const ctx = this.offCtx;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    switch (this.state) {
      case 'menu':
        this.menu.drawMainMenu(ctx, this.hoveredBtn);
        break;
      case 'levelselect':
        this.renderLevelSelect(ctx);
        break;
      case 'controls':
        this.menu.drawControls(ctx, this.hoveredBtn);
        break;
      case 'playing':
      case 'paused':
        this.renderGame(ctx);
        if (this.state === 'paused') {
          this.menu.drawPauseMenu(ctx, this.hoveredBtn);
        }
        break;
      case 'gameover':
        this.renderGame(ctx);
        this.menu.drawGameOver(ctx, this.hoveredBtn);
        break;
      case 'levelcomplete':
        this.renderGame(ctx);
        this.renderLevelComplete(ctx);
        break;
    }

    // Post-processing onto main canvas
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.ctx.drawImage(this.offscreen, 0, 0);

    if (this.state === 'playing' && this.world) {
      this.fx.applyPostProcessing(this.ctx, this.offscreen, this.world.rewind.isRewinding);
      this.fx.drawRewindUI(this.ctx, this.world.rewind.isRewinding ? 1 : 0);
    }
  }

  private renderGame(ctx: CanvasRenderingContext2D): void {
    if (!this.world) return;
    this.world.draw(ctx, this.camera, this.time);

    // HUD
    this.hud.draw(ctx, {
      rewindMeter: this.world.rewind.meter,
      rewindHistoryFill: this.world.rewind.historyFill,
      isRewinding: this.world.rewind.isRewinding,
      score: this.world.score,
      collectibles: this.world.collectiblesCollected,
      totalCollectibles: this.world.totalCollectibles,
      levelTime: this.world.levelTime,
      levelName: `Level ${this.currentLevel + 1}`,
      checkpointCount: this.world.checkpoints.filter(c => c.activated).length,
      currentLevel: this.currentLevel + 1,
      totalLevels: LEVEL_BUILDERS.length,
    });

    // Death overlay
    if (this.deathOverlayAlpha > 0.01) {
      this.hud.drawDeathOverlay(ctx, this.deathOverlayAlpha);
    }
  }

  private renderLevelSelect(ctx: CanvasRenderingContext2D): void {
    const levelData = LEVEL_BUILDERS.map((builder, i) => {
      const cfg = builder();
      return {
        name: cfg.name,
        subtitle: cfg.subtitle,
        stars: this.saveData.levels[i]?.stars ?? 0,
      };
    });
    this.menu.drawLevelSelect(ctx, this.hoveredBtn, this.saveData.unlockedLevels, levelData);
  }

  private renderLevelComplete(ctx: CanvasRenderingContext2D): void {
    if (!this.world) return;
    const w = this.world;
    const stars = calculateStars(w.levelTime, w.rewindsUsed, w.collectiblesCollected, w.totalCollectibles);
    const score = calculateScore(w.levelTime, w.rewindsUsed, w.collectiblesCollected, w.totalCollectibles);
    const cfg = LEVEL_BUILDERS[this.currentLevel]();

    this.menu.drawLevelComplete(ctx, {
      levelName: `${cfg.name}: ${cfg.subtitle}`,
      time: w.levelTime,
      collectibles: w.collectiblesCollected,
      totalCollectibles: w.totalCollectibles,
      rewindsUsed: w.rewindsUsed,
      stars,
      score,
      isLastLevel: this.currentLevel >= LEVEL_BUILDERS.length - 1,
      hoveredBtn: this.hoveredBtn,
    });
  }

  // ---- Button hit areas ----

  private getMainMenuButtons() {
    const bw = 280, bh = 52, bx = CANVAS_WIDTH / 2 - bw / 2;
    let by = 360;
    return [
      { x: bx, y: by, w: bw, h: bh },
      { x: bx, y: (by += bh + 16), w: bw, h: bh },
      { x: bx, y: (by += bh + 16), w: bw, h: bh },
    ];
  }

  private getPauseButtons() {
    const bw = 240, bx = CANVAS_WIDTH / 2 - bw / 2;
    const py = CANVAS_HEIGHT / 2 - 160;
    let by = py + 100;
    return [
      { x: bx, y: by, w: bw, h: 48 },
      { x: bx, y: (by += 64), w: bw, h: 48 },
      { x: bx, y: (by += 64), w: bw, h: 48 },
    ];
  }

  private getGameOverButtons() {
    return [
      { x: CANVAS_WIDTH / 2 - 140, y: CANVAS_HEIGHT / 2 + 100, w: 280, h: 52 },
      { x: CANVAS_WIDTH / 2 - 140, y: CANVAS_HEIGHT / 2 + 168, w: 280, h: 52 },
    ];
  }

  private getLevelCompleteButtons() {
    const px = CANVAS_WIDTH / 2 - 240;
    const py = 100; const pw = 480;
    return [
      { x: px + 40, y: py + 400, w: pw / 2 - 56, h: 48 },
      { x: CANVAS_WIDTH / 2 + 16, y: py + 400, w: pw / 2 - 56, h: 48 },
    ];
  }

  private getLevelSelectButtons() {
    const cards = LEVEL_BUILDERS.map((_, i) => {
      const cols = 3;
      const cardW = 260; const cardH = 160;
      const startX = CANVAS_WIDTH / 2 - (cols * (cardW + 20)) / 2 + 10;
      const col = i % cols;
      const row = Math.floor(i / cols);
      return { x: startX + col * (cardW + 20), y: 160 + row * (cardH + 20), w: cardW, h: cardH };
    });
    // Back button
    cards.push({ x: CANVAS_WIDTH / 2 - 100, y: CANVAS_HEIGHT - 80, w: 200, h: 48 });
    return cards;
  }

  private getHoveredButton(buttons: { x: number; y: number; w: number; h: number }[]): number {
    for (let i = 0; i < buttons.length; i++) {
      const b = buttons[i];
      if (this.mouseX >= b.x && this.mouseX < b.x + b.w && this.mouseY >= b.y && this.mouseY < b.y + b.h) {
        return i;
      }
    }
    return -1;
  }

  private onMouseMove = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    this.mouseX = (e.clientX - rect.left) * scaleX;
    this.mouseY = (e.clientY - rect.top) * scaleY;
  };

  private onMouseClick = (_e: MouseEvent): void => {
    this.audio['getCtx']?.(); // unlock audio context on first interaction
    switch (this.state) {
      case 'menu':
        this.handleMenuClick();
        break;
      case 'levelselect':
        this.handleLevelSelectClick();
        break;
      case 'controls':
        this.handleControlsClick();
        break;
      case 'paused':
        this.handlePauseClick();
        break;
      case 'gameover':
        this.handleGameOverClick();
        break;
      case 'levelcomplete':
        this.handleLevelCompleteClick();
        break;
    }
  };

  private handleMenuClick(): void {
    const buttons = this.getMainMenuButtons();
    const i = this.getHoveredButton(buttons);
    if (i === 0) this.startLevel(0);
    else if (i === 1) { this.state = 'levelselect'; this.hoveredBtn = -1; }
    else if (i === 2) { this.state = 'controls'; this.hoveredBtn = -1; }
    this.audio.uiSelect();
  }

  private handleLevelSelectClick(): void {
    const buttons = this.getLevelSelectButtons();
    const i = this.getHoveredButton(buttons);
    if (i === LEVEL_BUILDERS.length) {
      this.state = 'menu';
      this.audio.uiBack();
    } else if (i >= 0 && i < this.saveData.unlockedLevels) {
      this.startLevel(i);
      this.audio.uiSelect();
    }
  }

  private handleControlsClick(): void {
    const back = [{ x: CANVAS_WIDTH / 2 - 100, y: 640, w: 200, h: 48 }];
    if (this.getHoveredButton(back) === 0) {
      this.state = 'menu';
      this.audio.uiBack();
    }
  }

  private handlePauseClick(): void {
    const buttons = this.getPauseButtons();
    const i = this.getHoveredButton(buttons);
    if (i === 0) { this.state = 'playing'; this.audio.uiSelect(); }
    else if (i === 1) { this.startLevel(this.currentLevel); this.audio.uiSelect(); }
    else if (i === 2) { this.state = 'menu'; this.world = null; this.audio.uiBack(); }
  }

  private handleGameOverClick(): void {
    const buttons = this.getGameOverButtons();
    const i = this.getHoveredButton(buttons);
    if (i === 0) { this.startLevel(this.currentLevel); this.audio.uiSelect(); }
    else if (i === 1) { this.state = 'menu'; this.world = null; this.audio.uiBack(); }
  }

  private handleLevelCompleteClick(): void {
    const buttons = this.getLevelCompleteButtons();
    const i = this.getHoveredButton(buttons);
    if (i === 0) {
      // Next level or main menu
      if (this.currentLevel >= LEVEL_BUILDERS.length - 1) {
        this.state = 'menu';
        this.world = null;
      } else {
        this.startLevel(this.currentLevel + 1);
      }
      this.audio.uiSelect();
    } else if (i === 1) {
      this.state = 'levelselect';
      this.world = null;
      this.audio.uiSelect();
    }
  }

  private startLevel(index: number): void {
    this.currentLevel = index;
    const config = LEVEL_BUILDERS[index]();
    this.world = new World(config, this.audio);
    this.camera.x = 0;
    this.camera.y = 0;
    this.deathOverlayAlpha = 0;
    this.state = 'playing';
  }

  destroy(): void {
    this.input.destroy();
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('click', this.onMouseClick);
  }
}
