/**
 * Web Audio API Sci-Fi sound design for FESTORA:
 * - transition: rising filtered-noise whoosh + low sub-sweep
 * - hover: soft high blip
 * - click: short digital chirp
 * - confirm: three-note rising shimmer (registration done)
 * - checkin: scanner "beep-boop" then chime
 * - error: low detuned buzz
 * - undo: descending glide
 * - redo: ascending glide
 * - ambient: quiet sci-fi drone loop
 * - master volume & persisted mute toggle
 */

class SoundFxManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOscs: OscillatorNode[] = [];
  private isAmbientPlaying: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute =
        localStorage.getItem('festora_muted') ||
        localStorage.getItem('campus_post_muted');
      this.isMuted = savedMute === 'true';
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.isMuted ? 0 : 0.65;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private getOutputNode(): GainNode | null {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return null;
    if (this.isMuted) return null;
    return this.masterGain;
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('festora_muted', String(muted));
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.65, this.ctx.currentTime);
    }
  }

  toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // Rising filtered-noise whoosh + low sub-sweep synced to page transition
  playTransition() {
    try {
      const out = this.getOutputNode();
      const ctx = this.getContext();
      if (!ctx || !out) return;
      const now = ctx.currentTime;

      // Sub bass sweep (40Hz -> 110Hz -> 30Hz)
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(45, now);
      sub.frequency.exponentialRampToValueAtTime(120, now + 0.45);
      sub.frequency.exponentialRampToValueAtTime(32, now + 0.9);

      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(0.28, now + 0.35);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

      sub.connect(subGain);
      subGain.connect(out);
      sub.start(now);
      sub.stop(now + 1.0);

      // Noise whoosh with swept bandpass filter
      const bufferSize = ctx.sampleRate * 0.75;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / bufferSize);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 3.5;
      filter.frequency.setValueAtTime(280, now);
      filter.frequency.exponentialRampToValueAtTime(2200, now + 0.5);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.75);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.linearRampToValueAtTime(0.18, now + 0.4);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(out);
      noise.start(now);
    } catch {
      // Audio fallback
    }
  }

  // Soft high blip on interactive hover
  playHover() {
    try {
      const out = this.getOutputNode();
      const ctx = this.getContext();
      if (!ctx || !out) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.04);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(out);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Audio fallback
    }
  }

  // Short digital chirp on click
  playClick() {
    try {
      const out = this.getOutputNode();
      const ctx = this.getContext();
      if (!ctx || !out) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.06);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(out);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Audio fallback
    }
  }

  // Three-note rising shimmer (registration confirmed)
  playConfirm() {
    try {
      const out = this.getOutputNode();
      const ctx = this.getContext();
      if (!ctx || !out) return;
      const now = ctx.currentTime;
      const notes = [587.33, 739.99, 880.0]; // D5, F#5, A5 shimmer

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0.16, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.38);

        osc.connect(gain);
        gain.connect(out);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.4);
      });
    } catch {
      // Audio fallback
    }
  }

  // Scanner beep-boop then green chime on valid checkin
  playCheckin() {
    try {
      const out = this.getOutputNode();
      const ctx = this.getContext();
      if (!ctx || !out) return;
      const now = ctx.currentTime;

      // Beep-boop
      const osc1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now);
      g1.gain.setValueAtTime(0.18, now);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc1.connect(g1);
      g1.connect(out);
      osc1.start(now);
      osc1.stop(now + 0.08);

      const osc2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.51, now + 0.08);
      g2.gain.setValueAtTime(0.2, now + 0.08);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.08 + 0.12);
      osc2.connect(g2);
      g2.connect(out);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.22);

      // Harmonious green chime
      setTimeout(() => {
        const chord = [659.25, 830.61, 987.77];
        const ctx2 = this.getContext();
        const out2 = this.getOutputNode();
        if (!ctx2 || !out2) return;
        const now2 = ctx2.currentTime;
        chord.forEach((freq) => {
          const cOsc = ctx2.createOscillator();
          const cG = ctx2.createGain();
          cOsc.type = 'triangle';
          cOsc.frequency.setValueAtTime(freq, now2);
          cG.gain.setValueAtTime(0.14, now2);
          cG.gain.exponentialRampToValueAtTime(0.001, now2 + 0.45);
          cOsc.connect(cG);
          cG.connect(out2);
          cOsc.start(now2);
          cOsc.stop(now2 + 0.48);
        });
      }, 160);
    } catch {
      // Audio fallback
    }
  }

  // Low detuned buzz on error / duplicate
  playError() {
    try {
      const out = this.getOutputNode();
      const ctx = this.getContext();
      if (!ctx || !out) return;
      const now = ctx.currentTime;

      [146.83, 155.56].forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);
        osc.frequency.linearRampToValueAtTime(f * 0.85, now + 0.28);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        osc.connect(gain);
        gain.connect(out);
        osc.start(now);
        osc.stop(now + 0.34);
      });
    } catch {
      // Audio fallback
    }
  }

  // Descending glide for Undo
  playUndo() {
    try {
      const out = this.getOutputNode();
      const ctx = this.getContext();
      if (!ctx || !out) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.28);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(out);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch {
      // Audio fallback
    }
  }

  // Ascending glide for Redo
  playRedo() {
    try {
      const out = this.getOutputNode();
      const ctx = this.getContext();
      if (!ctx || !out) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.28);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(out);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch {
      // Audio fallback
    }
  }

  // Toggle optional quiet sci-fi drone
  toggleAmbient(enable?: boolean): boolean {
    const shouldEnable = enable !== undefined ? enable : !this.isAmbientPlaying;
    if (!shouldEnable) {
      this.ambientOscs.forEach((osc) => {
        try {
          osc.stop();
        } catch {}
      });
      this.ambientOscs = [];
      this.isAmbientPlaying = false;
      return false;
    }

    try {
      const out = this.getOutputNode();
      const ctx = this.getContext();
      if (!ctx || !out) return false;

      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.03, ctx.currentTime);
      this.ambientGain.connect(out);

      const freqs = [65.41, 98.0, 130.81]; // C2, G2, C3 deep ambient drone
      this.ambientOscs = freqs.map((f) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        osc.connect(this.ambientGain!);
        osc.start();
        return osc;
      });
      this.isAmbientPlaying = true;
      return true;
    } catch {
      return false;
    }
  }

  // Legacy aliases to preserve existing codebase calls seamlessly
  playStampThump() {
    this.playConfirm();
  }
  playDuplicateBuzz() {
    this.playError();
  }
  playInvalidSound() {
    this.playError();
  }
  playTypewriterTick() {
    this.playHover();
  }
  playLetterArrived() {
    this.playConfirm();
  }
}

export const soundFx = new SoundFxManager();
export const postalSoundFx = soundFx; // backwards compatibility alias
