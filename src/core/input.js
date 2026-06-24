const KEY_MAP = {
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
    constructor() {
        Object.defineProperty(this, "held", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "justPressed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "justReleased", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "onKeyDown", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (e) => {
                e.preventDefault();
                const action = KEY_MAP[e.code];
                if (action && !this.held.has(action)) {
                    this.held.add(action);
                    this.justPressed.add(action);
                }
            }
        });
        Object.defineProperty(this, "onKeyUp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (e) => {
                const action = KEY_MAP[e.code];
                if (action) {
                    this.held.delete(action);
                    this.justReleased.add(action);
                }
            }
        });
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    }
    isHeld(action) {
        return this.held.has(action);
    }
    wasPressed(action) {
        return this.justPressed.has(action);
    }
    wasReleased(action) {
        return this.justReleased.has(action);
    }
    flush() {
        this.justPressed.clear();
        this.justReleased.clear();
    }
    destroy() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
    }
}
