/**
 * FAIL FRENZY - Voice Command System
 * Allows players to trigger game actions via voice using the Web Speech API.
 * No external dependencies — 100 % browser-native.
 *
 * Supported commands (FR/EN):
 *   "bouclier" / "shield"   → activates shield
 *   "boost"  / "accélère"   → speed boost
 *   "ralentis" / "slow"     → time slow-down
 *   "pause"  / "stop"       → pause the game
 *
 * Usage:
 *   const vc = new VoiceCommandSystem();
 *   if (vc.isSupported) {
 *     vc.on('shield', () => activateShield());
 *     vc.start();
 *   }
 */

export type VoiceCommand = "shield" | "boost" | "slow" | "pause";

type CommandHandler = () => void;

/** Map of transcript fragments → command type. Both FR and EN are supported. */
const COMMAND_MAP: Readonly<Record<string, VoiceCommand>> = {
  bouclier: "shield",
  shield: "shield",
  boost: "boost",
  "accélère": "boost",
  accelere: "boost",
  ralentis: "slow",
  lenteur: "slow",
  slow: "slow",
  pause: "pause",
  stop: "pause",
};

export class VoiceCommandSystem {
  private recognition: SpeechRecognition | null = null;
  private handlers: Map<VoiceCommand, CommandHandler> = new Map();
  private _active = false;
  private _lastCommand: VoiceCommand | null = null;
  private _lastCommandTime = 0;
  /** Minimum ms between two identical commands to prevent rapid re-triggering. */
  private readonly debounceMs: number;

  constructor(options: { lang?: string; debounceMs?: number } = {}) {
    this.debounceMs = options.debounceMs ?? 800;

    const SpeechRecognitionCtor =
      (typeof window !== "undefined" &&
        (window.SpeechRecognition ?? (window as any).webkitSpeechRecognition)) ||
      null;

    if (!SpeechRecognitionCtor) return;

    this.recognition = new SpeechRecognitionCtor() as SpeechRecognition;
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = options.lang ?? "fr-FR";

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      const result = event.results[last];
      if (!result || !result[0]) return;
      const transcript = result[0].transcript.trim().toLowerCase();
      this.processTranscript(transcript);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "no-speech") {
        console.warn("[VoiceCommandSystem] Speech recognition error:", event.error);
      }
    };

    // Auto-restart after end (e.g. on mobile where recognition stops after silence)
    this.recognition.onend = () => {
      if (this._active) {
        try {
          this.recognition?.start();
        } catch {
          // already started
        }
      }
    };
  }

  /** Register a handler for a voice command. Replaces any previous handler for that command. */
  on(command: VoiceCommand, handler: CommandHandler): this {
    this.handlers.set(command, handler);
    return this;
  }

  /** Unregister a command handler. */
  off(command: VoiceCommand): this {
    this.handlers.delete(command);
    return this;
  }

  /** Start listening. Requires microphone permission. */
  start(): void {
    if (!this.recognition || this._active) return;
    try {
      this.recognition.start();
      this._active = true;
    } catch {
      // DOMException: already started
    }
  }

  /** Stop listening. */
  stop(): void {
    if (!this.recognition || !this._active) return;
    this._active = false;
    this.recognition.stop();
  }

  /** Whether the Web Speech API is available in this browser. */
  get isSupported(): boolean {
    return this.recognition !== null;
  }

  /** Whether the system is currently listening. */
  get isActive(): boolean {
    return this._active;
  }

  /** The most recently recognised command, or null. */
  get lastCommand(): VoiceCommand | null {
    return this._lastCommand;
  }

  private processTranscript(text: string): void {
    for (const [keyword, command] of Object.entries(COMMAND_MAP)) {
      if (text.includes(keyword)) {
        const now = Date.now();
        // Debounce: skip if same command fired too recently
        if (command === this._lastCommand && now - this._lastCommandTime < this.debounceMs) {
          break;
        }
        this._lastCommand = command;
        this._lastCommandTime = now;
        this.handlers.get(command)?.();
        break;
      }
    }
  }
}
