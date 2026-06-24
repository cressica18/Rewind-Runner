import type { InputAction } from './constants';

const KEY_MAP: Record<string, InputAction> = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ArrowUp: 'jump',
  KeyW: 'jump',
  Space: 'jump',
  KeyZ: 'rewind',
  ShiftLeft: 'rewind',
  ShiftRight: 'rewind',
  Escape: 'pause',
  KeyE: 'interact',
};

export class InputManager {
  private held = new Set<InputAction>();
  private justPressed = new Set<InputAction>();
  private justReleased = new Set<InputAction>();

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    e.preventDefault();
    const action = KEY_MAP[e.code];
    if (action && !this.held.has(action)) {
      this.held.add(action);
      this.justPressed.add(action);
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const action = KEY_MAP[e.code];
    if (action) {
      this.held.delete(action);
      this.justReleased.add(action);
    }
  };

  isHeld(action: InputAction): boolean {
    return this.held.has(action);
  }

  wasPressed(action: InputAction): boolean {
    return this.justPressed.has(action);
  }

  wasReleased(action: InputAction): boolean {
    return this.justReleased.has(action);
  }

  flush(): void {
    this.justPressed.clear();
    this.justReleased.clear();
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
