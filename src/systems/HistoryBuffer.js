import { HISTORY_MAX_FRAMES } from '../core/constants';
export class HistoryBuffer {
    constructor(maxFrames = HISTORY_MAX_FRAMES) {
        Object.defineProperty(this, "frames", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "maxFrames", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.maxFrames = maxFrames;
    }
    record(time, state) {
        if (this.frames.length >= this.maxFrames) {
            this.frames.shift();
        }
        this.frames.push({ time, state });
    }
    peek() {
        return this.frames.length > 0 ? this.frames[this.frames.length - 1] : null;
    }
    pop() {
        return this.frames.pop() ?? null;
    }
    get length() { return this.frames.length; }
    get isEmpty() { return this.frames.length === 0; }
    getFillRatio() {
        return this.frames.length / this.maxFrames;
    }
    clear() { this.frames = []; }
    getFrame(index) {
        return this.frames[index] ?? null;
    }
    truncateTo(count) {
        if (this.frames.length > count) {
            this.frames = this.frames.slice(0, count);
        }
    }
}
