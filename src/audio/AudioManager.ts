export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted = false;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.35;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private get gain(): GainNode {
    this.getCtx();
    return this.masterGain!;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol = 0.3, fadeOut = true): void {
    if (this.muted) return;
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.value = vol;
      if (fadeOut) g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(g);
      g.connect(this.gain);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) { /* silent fail */ }
  }

  private playNoise(duration: number, vol = 0.2, filterFreq = 2000): void {
    if (this.muted) return;
    try {
      const ctx = this.getCtx();
      const bufSize = ctx.sampleRate * duration;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = filterFreq;
      const g = ctx.createGain();
      g.gain.value = vol;
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      src.connect(filter);
      filter.connect(g);
      g.connect(this.gain);
      src.start();
    } catch (_) { /* silent fail */ }
  }

  jump(): void { this.playTone(300, 'sine', 0.12, 0.25); this.playTone(480, 'sine', 0.08, 0.15); }
  land(): void { this.playNoise(0.08, 0.15, 800); }
  die(): void { this.playTone(200, 'sawtooth', 0.4, 0.3); this.playTone(120, 'square', 0.5, 0.2); }
  rewindStart(): void { this.playTone(440, 'sawtooth', 0.2, 0.2); }
  rewindLoop(): void { /* ambient rewind handled by pitch-shifted noise */ }
  rewindEnd(): void { this.playTone(600, 'sine', 0.15, 0.2); }
  collect(): void { this.playTone(880, 'sine', 0.1, 0.2); this.playTone(1200, 'sine', 0.08, 0.08); }
  portalEnter(): void {
    [440, 550, 660, 880].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.3, 0.25), i * 80);
    });
  }
  switchClick(): void { this.playTone(700, 'square', 0.07, 0.2); }
  platformCrack(): void { this.playNoise(0.12, 0.1, 3000); }
  platformCollapse(): void { this.playNoise(0.25, 0.2, 500); }
  uiSelect(): void { this.playTone(440, 'sine', 0.06, 0.15); }
  uiBack(): void { this.playTone(220, 'sine', 0.06, 0.1); }
  checkpoint(): void { this.playTone(523, 'sine', 0.2, 0.2); this.playTone(659, 'sine', 0.2, 0.15); }

  rewindAmbient(active: boolean, intensity: number): void {
    if (this.muted || !active) return;
    try {
      const ctx = this.getCtx();
      const freq = 100 + intensity * 200;
      if (Math.random() < 0.1) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = freq * (0.8 + Math.random() * 0.4);
        g.gain.value = 0.03;
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(g);
        g.connect(this.gain);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (_) { /* silent fail */ }
  }

  setMuted(m: boolean): void { this.muted = m; }
  toggleMute(): boolean { this.muted = !this.muted; return this.muted; }
}
