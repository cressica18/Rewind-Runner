import { HISTORY_MAX_FRAMES } from '../core/constants';

export interface FrameSnapshot<T> {
  time: number;
  state: T;
}

export class HistoryBuffer<T> {
  private frames: FrameSnapshot<T>[] = [];
  private maxFrames: number;

  constructor(maxFrames = HISTORY_MAX_FRAMES) {
    this.maxFrames = maxFrames;
  }

  record(time: number, state: T): void {
    if (this.frames.length >= this.maxFrames) {
      this.frames.shift();
    }
    this.frames.push({ time, state });
  }

  peek(): FrameSnapshot<T> | null {
    return this.frames.length > 0 ? this.frames[this.frames.length - 1] : null;
  }

  pop(): FrameSnapshot<T> | null {
    return this.frames.pop() ?? null;
  }

  get length(): number { return this.frames.length; }
  get isEmpty(): boolean { return this.frames.length === 0; }

  getFillRatio(): number {
    return this.frames.length / this.maxFrames;
  }

  clear(): void { this.frames = []; }

  getFrame(index: number): FrameSnapshot<T> | null {
    return this.frames[index] ?? null;
  }

  truncateTo(count: number): void {
    if (this.frames.length > count) {
      this.frames = this.frames.slice(0, count);
    }
  }
}
