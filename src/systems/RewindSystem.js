import { REWIND_DRAIN_RATE, REWIND_RECHARGE_RATE, clamp } from '../core/constants';
import { HistoryBuffer } from './HistoryBuffer';
export class RewindSystem {
    constructor() {
        Object.defineProperty(this, "buffer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "meter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1.0
        }); // 0 to 1
        Object.defineProperty(this, "isRewinding", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "wasRewinding", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "justStartedRewind", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "justEndedRewind", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.buffer = new HistoryBuffer();
    }
    record(snapshot) {
        if (!this.isRewinding) {
            this.buffer.record(snapshot.time, snapshot);
        }
    }
    update(dt, wantsRewind) {
        this.wasRewinding = this.isRewinding;
        this.justStartedRewind = false;
        this.justEndedRewind = false;
        if (wantsRewind && this.meter > 0 && !this.buffer.isEmpty) {
            if (!this.wasRewinding) {
                this.isRewinding = true;
                this.justStartedRewind = true;
            }
            this.meter = clamp(this.meter - REWIND_DRAIN_RATE * dt, 0, 1);
            if (this.meter <= 0 || this.buffer.isEmpty) {
                this.isRewinding = false;
                this.justEndedRewind = true;
                return null;
            }
            const frame = this.buffer.pop();
            return frame ? frame.state : null;
        }
        else {
            if (this.wasRewinding) {
                this.isRewinding = false;
                this.justEndedRewind = true;
            }
            this.isRewinding = false;
            if (this.meter < 1) {
                this.meter = clamp(this.meter + REWIND_RECHARGE_RATE * dt, 0, 1);
            }
            return null;
        }
    }
    get fillRatio() { return this.meter; }
    get historyFill() { return this.buffer.getFillRatio(); }
    get hasHistory() { return !this.buffer.isEmpty; }
    reset() {
        this.buffer.clear();
        this.meter = 1.0;
        this.isRewinding = false;
        this.wasRewinding = false;
        this.justStartedRewind = false;
        this.justEndedRewind = false;
    }
    refillMeter() {
        this.meter = 1.0;
    }
}
