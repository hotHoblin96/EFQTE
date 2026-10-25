export type QteMode = 'eft_hexagon' | 'radial' | 'slider' | 'shrinking' | 'rapid';

export type HitResult = 'perfect' | 'good' | 'miss' | null;

export type HitPlacement = 'center' | 'early' | 'random';

export interface AutoBotConfig {
  enabled: boolean;
  reactionDelayMs: number; // 0 (inhuman) to 200 (humanized)
  randomJitterMs: number; // e.g. 0 to 30ms anti-cheat variance
  targetZonePlacement: HitPlacement;
  humanizeClicks: boolean;
  pressDurationMs: number; // Mouse button down duration
  soundEnabled: boolean;
  hotkey: string;
}

export interface QteStats {
  totalAttempts: number;
  perfectHits: number;
  goodHits: number;
  misses: number;
  currentStreak: number;
  bestStreak: number;
  reactionTimes: number[]; // stored latencies
  averageReactionTimeMs: number;
}

export interface ScreenDetectorConfig {
  active: boolean;
  targetColor: string; // hex
  tolerance: number; // 0 to 100
  roi: {
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    width: number;
    height: number;
  };
  triggerCooldownMs: number;
  autoClickOnDetect: boolean;
  soundAlert: boolean;
  clickKey: 'LMB' | 'SPACE' | 'E';
}

export interface DetectionLog {
  id: string;
  timestamp: string;
  detectedColor: string;
  status: 'triggered' | 'skipped';
  latencyMs: number;
}

export type ScriptTarget = 'ahk_v2' | 'ahk_v1' | 'python';

export interface ScriptPreset {
  id: string;
  name: string;
  game: string;
  description: string;
  defaultKey: string;
  triggerColor: string;
  detectionType: 'pixel_fixed' | 'pixel_search' | 'radial_needle';
}
