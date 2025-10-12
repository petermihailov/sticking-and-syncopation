import type {
  Instrument,
  Bar,
  DrumKit,
  Group,
  Hand,
  StickingMapping,
  Beat,
} from '../../../types/instrument'

/**
 * Options for playing an instrument
 */
export interface PlayOptions {
  gain?: number
  pitch?: number
  hand?: Hand
}

/**
 * Audio engine interface - responsible for Web Audio API interactions
 */
export interface IAudioEngine {
  /**
   * Play a single instrument at a specific time
   */
  playInstrument(
    instrument: Instrument,
    time: number,
    options?: PlayOptions
  ): AudioBufferSourceNode | null

  /**
   * Get current audio context time
   */
  getCurrentTime(): number
}

/**
 * Scheduler interface - responsible for timing and scheduling
 */
export interface IScheduler {
  /**
   * Schedule a callback to run after a delay
   * @returns timeout ID
   */
  schedule(callback: () => void, delayMs: number): number

  /**
   * Clear a scheduled callback
   */
  clear(id: number): void

  /**
   * Calculate time offset between beats
   */
  getTimeOffset(tempo: number, bar: Bar): number
}

/**
 * Instrument resolver interface - responsible for sticking to instrument mapping
 */
export interface IInstrumentResolver {
  /**
   * Resolve a sticking symbol to instruments with rotation
   */
  resolve(sticking: string): Instrument[]

  /**
   * Get current rotation counters
   */
  getCounters(): Map<string, number>

  /**
   * Reset all rotation counters
   */
  resetCounters(): void

  /**
   * Set instrument mapping
   */
  setMapping(mapping: StickingMapping): void
}

/**
 * State manager interface - responsible for player state
 */
export interface IStateManager {
  // Tempo
  getTempo(): number
  setTempo(bpm: number): void

  // Metronome
  isMetronomeEnabled(): boolean
  enableMetronome(): void
  disableMetronome(): void
  getMetronomeVolume(): number
  setMetronomeVolume(volume: number): void

  // Bars & Kit
  getBars(): Bar[]
  setBars(bars: Bar[]): void
  getKit(): DrumKit
  setKit(kit: DrumKit): void

  // Muted groups
  getMutedGroups(): Group[]
  mute(group: Group): void
  unmute(group: Group): void
  isMuted(group: Group): boolean

  // Beat callback
  getOnBeat(): (beat: Beat) => void
  setOnBeat(callback: (beat: Beat) => void): void
}

/**
 * Buffer manager interface - responsible for managing active audio buffers
 */
export interface IBufferManager {
  /**
   * Add a buffer to track (for hi-hat open or metronome)
   */
  addHiHatBuffer(buffer: AudioBufferSourceNode): void
  addMetronomeBuffer(buffer: AudioBufferSourceNode): void

  /**
   * Stop all hi-hat buffers at a specific time
   */
  stopHiHatBuffers(time: number): void

  /**
   * Stop all metronome buffers
   */
  stopMetronomeBuffers(): void

  /**
   * Clear all buffers and stop them
   */
  clearAll(): void
}
