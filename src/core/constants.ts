// Constants
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const TILE_SIZE = 32;
export const GRAVITY = 1800;
export const MAX_FALL_SPEED = 1000;
export const REWIND_MAX_SECONDS = 5;
export const REWIND_DRAIN_RATE = 1 / REWIND_MAX_SECONDS; // fraction per second
export const REWIND_RECHARGE_RATE = 1 / (REWIND_MAX_SECONDS * 1.5);
export const HISTORY_FPS = 60;
export const HISTORY_MAX_FRAMES = HISTORY_FPS * REWIND_MAX_SECONDS;

// Colors
export const PALETTE = {
  bg: '#0a0812',
  bgDeep: '#050408',
  accent: '#7f5af0',
  accentDim: '#4a2fa0',
  green: '#2cb67d',
  warn: '#ff4d4d',
  warnDim: '#7a1a1a',
  text: '#fffffe',
  muted: '#94a1b2',
  platform: '#3d3552',
  platformCracked: '#5a3a2a',
  platformBurning: '#8b3a00',
  gold: '#ffd700',
  silver: '#c0c0c0',
  bronze: '#cd7f32',
  rewindBlue: '#00d4ff',
  rewindPurple: '#a855f7',
  portal: '#00ffcc',
  spike: '#e8d5b7',
  blade: '#d4d4d4',
  debris: '#6b5b45',
  echo: 'rgba(127, 90, 240, 0.4)',
  timecrack: '#ff6b35',
};

// Game States
export type GameState = 'menu' | 'levelselect' | 'playing' | 'paused' | 'gameover' | 'levelcomplete' | 'controls';

// Input map
export type InputAction =
  | 'left' | 'right' | 'jump' | 'rewind' | 'pause' | 'interact';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function rectOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1));
}
