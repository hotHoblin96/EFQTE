/**
 * Web Audio API synthesizer for realistic mechanical mouse clicks,
 * QTE audio cues, success chords, and miss alerts.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Realistic mechanical mouse switch click sound (LMB down / up)
  playMouseClick(type: 'down' | 'up' = 'down') {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // High crisp snap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1200, t);

      osc.type = 'triangle';
      if (type === 'down') {
        osc.frequency.setValueAtTime(3200, t);
        osc.frequency.exponentialRampToValueAtTime(350, t + 0.025);
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
      } else {
        osc.frequency.setValueAtTime(2400, t);
        osc.frequency.exponentialRampToValueAtTime(450, t + 0.02);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
      }

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + (type === 'down' ? 0.035 : 0.025));
    } catch {
      // AudioContext policy fallback
    }
  }

  // QTE Warning Chime (like DBD heartbeat or GTA cue)
  playWarningCue() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, t); // D5
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.08); // A5

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.18);
    } catch {
      // Audio error safety
    }
  }

  // Perfect hit (Great / 100%)
  playSuccessHit(isPerfect: boolean = true) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      const baseFreq = isPerfect ? 880 : 659.25;
      osc1.frequency.setValueAtTime(baseFreq, t);
      osc2.frequency.setValueAtTime(baseFreq * 1.5, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.22);
      osc2.stop(t + 0.22);
    } catch {
      // ignore
    }
  }

  // Miss / Fail sound
  playFailBuzz() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.2);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.25);
    } catch {
      // ignore
    }
  }

  // Beep test / trigger detector sound
  playTriggerBeep() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, t); // C6

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.08);
    } catch {
      // ignore
    }
  }
}

export const soundEngine = new SoundEngine();
