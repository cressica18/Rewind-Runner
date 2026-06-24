import { REWIND_MAX_SECONDS, REWIND_DRAIN_RATE, REWIND_RECHARGE_RATE, clamp } from '../core/constants';
import { HistoryBuffer } from './HistoryBuffer';
import type { PlayerState } from '../entities/Player';
import type { PlatformState } from '../entities/Platform';
import type { HazardState } from '../entities/Hazard';
import type { CollectibleState, SwitchState, DoorState, PortalState, CheckpointState } from '../entities/Interactables';

export interface WorldSnapshot {
  time: number;
  player: PlayerState;
  platforms: PlatformState[];
  hazards: HazardState[];
  collectibles: CollectibleState[];
  switches: SwitchState[];
  doors: DoorState[];
  portal: PortalState;
  checkpoints: CheckpointState[];
  rewindMeter: number;
  score: number;
  levelTime: number;
}

export class RewindSystem {
  private buffer: HistoryBuffer<WorldSnapshot>;
  meter = 1.0; // 0 to 1
  isRewinding = false;
  private wasRewinding = false;
  justStartedRewind = false;
  justEndedRewind = false;

  constructor() {
    this.buffer = new HistoryBuffer<WorldSnapshot>();
  }

  record(snapshot: WorldSnapshot): void {
    if (!this.isRewinding) {
      this.buffer.record(snapshot.time, snapshot);
    }
  }

  update(dt: number, wantsRewind: boolean): WorldSnapshot | null {
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
    } else {
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

  get fillRatio(): number { return this.meter; }
  get historyFill(): number { return this.buffer.getFillRatio(); }
  get hasHistory(): boolean { return !this.buffer.isEmpty; }

  reset(): void {
    this.buffer.clear();
    this.meter = 1.0;
    this.isRewinding = false;
    this.wasRewinding = false;
    this.justStartedRewind = false;
    this.justEndedRewind = false;
  }

  refillMeter(): void {
    this.meter = 1.0;
  }
}
