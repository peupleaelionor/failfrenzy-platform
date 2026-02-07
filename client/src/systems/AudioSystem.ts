/**
 * FAIL FRENZY - ULTIMATE Procedural Audio System
 * Dynamic music generation, adaptive sound effects, and immersive audio feedback
 * Zero external files - 100% Web Audio API generated
 */

export interface AudioConfig {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  enableMusic: boolean;
  enableSfx: boolean;
  enableHaptics: boolean;
}

export interface MusicState {
  bpm: number;
  intensity: number;
  key: number;
  scale: number[];
  bassPattern: number[];
  melodyPattern: number[];
}

export class AudioSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  
  private config: AudioConfig;
  private musicState: MusicState;
  private isPlaying: boolean = false;
  private musicInterval: number | null = null;
  private beatIndex: number = 0;
  
  // Musical scales (semitones from root)
  private static SCALES = {
    minor: [0, 2, 3, 5, 7, 8, 10],
    major: [0, 2, 4, 5, 7, 9, 11],
    pentatonic: [0, 2, 4, 7, 9],
    blues: [0, 3, 5, 6, 7, 10],
    synthwave: [0, 2, 3, 5, 7, 8, 11],
  };
  
  // Bass patterns (rhythm in 16th notes)
  private static BASS_PATTERNS = [
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  ];
  
  // Arpeggio patterns
  private static ARPEGGIO_PATTERNS = [
    [0, 2, 4, 2],
    [0, 4, 2, 4],
    [0, 2, 4, 7],
  ];
  
  constructor(config: Partial<AudioConfig> = {}) {
    this.config = {
      masterVolume: 0.7,
      musicVolume: 0.5,
      sfxVolume: 0.8,
      enableMusic: true,
      enableSfx: true,
      enableHaptics: true,
      ...config,
    };
    
    this.musicState = {
      bpm: 128,
      intensity: 0.5,
      key: 36,
      scale: AudioSystem.SCALES.synthwave,
      bassPattern: AudioSystem.BASS_PATTERNS[0],
      melodyPattern: AudioSystem.ARPEGGIO_PATTERNS[0],
    };
  }
  
  public async init(): Promise<void> {
    if (this.ctx) return;
    
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.config.masterVolume;
      this.masterGain.connect(this.ctx.destination);
      
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.config.musicVolume;
      this.musicGain.connect(this.masterGain);
      
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.config.sfxVolume;
      this.sfxGain.connect(this.masterGain);
      
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
    } catch (e) {
      console.warn('Audio initialization failed:', e);
    }
  }
  
  private midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
  
  private getScaleNote(degree: number, octaveOffset: number = 0): number {
    const scale = this.musicState.scale;
    const octave = Math.floor(degree / scale.length);
    const note = scale[degree % scale.length];
    return this.musicState.key + note + (octave + octaveOffset) * 12;
  }
  
  private createOscillator(
    type: OscillatorType,
    frequency: number,
    attack: number,
    decay: number,
    sustain: number,
    release: number,
    duration: number,
    gain: GainNode
  ): OscillatorNode {
    if (!this.ctx) throw new Error('Audio not initialized');
    
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.value = frequency;
    
    const now = this.ctx.currentTime;
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(1, now + attack);
    env.gain.linearRampToValueAtTime(sustain, now + attack + decay);
    env.gain.setValueAtTime(sustain, now + duration - release);
    env.gain.linearRampToValueAtTime(0, now + duration);
    
    osc.connect(env);
    env.connect(gain);
    
    osc.start(now);
    osc.stop(now + duration + 0.1);
    
    return osc;
  }
  
  private createFilter(type: BiquadFilterType, frequency: number, Q: number = 1): BiquadFilterNode {
    if (!this.ctx) throw new Error('Audio not initialized');
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = Q;
    
    return filter;
  }
  
  private playBass(note: number, duration: number): void {
    if (!this.ctx || !this.musicGain) return;
    
    const freq = this.midiToFreq(note);
    
    const subGain = this.ctx.createGain();
    subGain.gain.value = 0.4 * this.musicState.intensity;
    subGain.connect(this.musicGain);
    
    this.createOscillator('sine', freq, 0.01, 0.1, 0.6, 0.1, duration, subGain);
    
    const midGain = this.ctx.createGain();
    midGain.gain.value = 0.2 * this.musicState.intensity;
    
    const filter = this.createFilter('lowpass', 400 + this.musicState.intensity * 600, 2);
    midGain.connect(filter);
    filter.connect(this.musicGain);
    
    this.createOscillator('sawtooth', freq, 0.01, 0.05, 0.4, 0.1, duration, midGain);
  }
  
  private playLead(note: number, duration: number): void {
    if (!this.ctx || !this.musicGain) return;
    
    const freq = this.midiToFreq(note);
    
    const leadGain = this.ctx.createGain();
    leadGain.gain.value = 0.15 * this.musicState.intensity;
    
    const filter = this.createFilter('lowpass', 2000 + this.musicState.intensity * 4000, 4);
    leadGain.connect(filter);
    filter.connect(this.musicGain);
    
    this.createOscillator('sawtooth', freq, 0.02, 0.1, 0.3, 0.15, duration, leadGain);
    this.createOscillator('sawtooth', freq * 1.005, 0.02, 0.1, 0.2, 0.15, duration, leadGain);
  }
  
  private playHiHat(open: boolean = false): void {
    if (!this.ctx || !this.musicGain) return;
    
    const duration = open ? 0.3 : 0.08;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.1 * this.musicState.intensity;
    
    const filter = this.createFilter('highpass', 8000, 1);
    gain.connect(filter);
    filter.connect(this.musicGain);
    
    for (let i = 0; i < 6; i++) {
      const freq = 4000 + Math.random() * 8000;
      this.createOscillator('square', freq, 0.001, 0.02, open ? 0.3 : 0.1, duration * 0.8, duration, gain);
    }
  }
  
  private playKick(): void {
    if (!this.ctx || !this.musicGain) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    
    gain.gain.setValueAtTime(0.6 * this.musicState.intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(gain);
    gain.connect(this.musicGain);
    
    osc.start(now);
    osc.stop(now + 0.3);
  }
  
  private playSnare(): void {
    if (!this.ctx || !this.musicGain) return;
    
    const now = this.ctx.currentTime;
    
    const bodyOsc = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(180, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
    bodyGain.gain.setValueAtTime(0.3 * this.musicState.intensity, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    bodyOsc.connect(bodyGain);
    bodyGain.connect(this.musicGain);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.15);
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2 * this.musicState.intensity, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    const filter = this.createFilter('highpass', 2000, 1);
    noiseGain.connect(filter);
    filter.connect(this.musicGain);
    
    for (let i = 0; i < 8; i++) {
      const noiseOsc = this.ctx.createOscillator();
      noiseOsc.type = 'square';
      noiseOsc.frequency.value = 1000 + Math.random() * 5000;
      noiseOsc.connect(noiseGain);
      noiseOsc.start(now);
      noiseOsc.stop(now + 0.2);
    }
  }
  
  private musicTick(): void {
    if (!this.isPlaying) return;
    
    const beat = this.beatIndex % 16;
    const bar = Math.floor(this.beatIndex / 16);
    
    if (beat === 0 || beat === 8) this.playKick();
    if (beat === 4 || beat === 12) this.playSnare();
    if (beat % 2 === 0) this.playHiHat(beat % 8 === 6);
    
    if (this.musicState.bassPattern[beat]) {
      const bassNote = this.getScaleNote(bar % 4, 0);
      this.playBass(bassNote, 0.2);
    }
    
    if (beat % 4 === 0) {
      const arpIndex = (beat / 4) % this.musicState.melodyPattern.length;
      const arpDegree = this.musicState.melodyPattern[arpIndex];
      const leadNote = this.getScaleNote(arpDegree, 2);
      this.playLead(leadNote, 0.15);
    }
    
    this.beatIndex++;
  }
  
  public startMusic(): void {
    if (!this.ctx || this.isPlaying || !this.config.enableMusic) return;
    
    this.isPlaying = true;
    this.beatIndex = 0;
    
    const tickInterval = (60 / this.musicState.bpm / 4) * 1000;
    this.musicInterval = window.setInterval(() => this.musicTick(), tickInterval);
  }
  
  public stopMusic(): void {
    this.isPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
  
  public setIntensity(intensity: number): void {
    this.musicState.intensity = Math.max(0, Math.min(1, intensity));
    this.musicState.bpm = 100 + intensity * 60;
    
    if (intensity > 0.7) {
      this.musicState.bassPattern = AudioSystem.BASS_PATTERNS[1];
    } else {
      this.musicState.bassPattern = AudioSystem.BASS_PATTERNS[0];
    }
    
    if (this.isPlaying) {
      this.stopMusic();
      this.startMusic();
    }
  }
  
  public playFail(): void {
    if (!this.ctx || !this.sfxGain || !this.config.enableSfx) return;
    
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
    
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    const filter = this.createFilter('lowpass', 1000, 2);
    osc.connect(gain);
    gain.connect(filter);
    filter.connect(this.sfxGain);
    
    osc.start(now);
    osc.stop(now + 0.3);
    
    this.triggerHaptic('heavy');
  }
  
  public playCollect(): void {
    if (!this.ctx || !this.sfxGain || !this.config.enableSfx) return;
    
    const now = this.ctx.currentTime;
    const notes = [0, 4, 7, 12];
    
    notes.forEach((note, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = this.midiToFreq(72 + note);
      
      const startTime = now + i * 0.05;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
      
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
    
    this.triggerHaptic('light');
  }
  
  public playDodge(): void {
    if (!this.ctx || !this.sfxGain || !this.config.enableSfx) return;
    
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    const filter = this.createFilter('bandpass', 500, 2);
    osc.connect(gain);
    gain.connect(filter);
    filter.connect(this.sfxGain);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }
  
  public playCombo(comboLevel: number): void {
    if (!this.ctx || !this.sfxGain || !this.config.enableSfx) return;
    
    const now = this.ctx.currentTime;
    const baseNote = 60 + Math.min(comboLevel * 2, 24);
    
    const notes = [0, 4, 7];
    notes.forEach((note) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'triangle';
      osc.frequency.value = this.midiToFreq(baseNote + note);
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      
      osc.start(now);
      osc.stop(now + 0.3);
    });
    
    this.triggerHaptic('medium');
  }
  
  public playGameOver(): void {
    if (!this.ctx || !this.sfxGain || !this.config.enableSfx) return;
    
    const now = this.ctx.currentTime;
    const notes = [72, 71, 69, 67, 65, 64, 60];
    
    notes.forEach((note, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.value = this.midiToFreq(note);
      
      const startTime = now + i * 0.15;
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
      
      const filter = this.createFilter('lowpass', 800 - i * 80, 2);
      osc.connect(gain);
      gain.connect(filter);
      filter.connect(this.sfxGain!);
      
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
    
    this.triggerHaptic('heavy');
  }
  
  public playSuccess(): void {
    if (!this.ctx || !this.sfxGain || !this.config.enableSfx) return;
    
    const now = this.ctx.currentTime;
    const melody = [60, 64, 67, 72, 67, 72, 76];
    const durations = [0.15, 0.15, 0.15, 0.3, 0.15, 0.15, 0.5];
    
    let time = now;
    melody.forEach((note, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'square';
      osc.frequency.value = this.midiToFreq(note);
      
      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + durations[i]);
      
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      
      osc.start(time);
      osc.stop(time + durations[i]);
      
      time += durations[i];
    });
  }
  
  public playClick(): void {
    if (!this.ctx || !this.sfxGain || !this.config.enableSfx) return;
    
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = 800;
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(now);
    osc.stop(now + 0.05);
    
    this.triggerHaptic('light');
  }
  
  public playPowerUp(): void {
    if (!this.ctx || !this.sfxGain || !this.config.enableSfx) return;
    
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    const filter = this.createFilter('lowpass', 2000, 4);
    osc.connect(gain);
    gain.connect(filter);
    filter.connect(this.sfxGain);
    
    osc.start(now);
    osc.stop(now + 0.4);
    
    this.triggerHaptic('medium');
  }
  
  private triggerHaptic(intensity: 'light' | 'medium' | 'heavy'): void {
    if (!this.config.enableHaptics) return;
    
    if ('vibrate' in navigator) {
      const durations = { light: 10, medium: 25, heavy: 50 };
      navigator.vibrate(durations[intensity]);
    }
  }
  
  public setConfig(config: Partial<AudioConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.masterGain) this.masterGain.gain.value = this.config.masterVolume;
    if (this.musicGain) this.musicGain.gain.value = this.config.musicVolume;
    if (this.sfxGain) this.sfxGain.gain.value = this.config.sfxVolume;
  }
  
  public async resume(): Promise<void> {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }
  
  public destroy(): void {
    this.stopMusic();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

// Singleton
let audioInstance: AudioSystem | null = null;

export function getAudioSystem(): AudioSystem {
  if (!audioInstance) {
    audioInstance = new AudioSystem();
  }
  return audioInstance;
}

export const audioSystem = new AudioSystem();
