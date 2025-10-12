import type { Instrument, DrumKit } from '../../../types/instrument'
import type { IAudioEngine, PlayOptions } from '../di/types'

/**
 * Audio engine service - handles Web Audio API interactions
 */
export class AudioEngine implements IAudioEngine {
  private readonly audioCtx: AudioContext
  private kit: DrumKit = {}

  constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx
  }

  /**
   * Set the drum kit (audio buffers)
   */
  setKit(kit: DrumKit): void {
    this.kit = kit
  }

  /**
   * Play a single instrument at a specific time
   */
  playInstrument(
    instrument: Instrument,
    time: number,
    options: PlayOptions = {}
  ): AudioBufferSourceNode | null {
    const buffer = this.kit[instrument]
    if (!buffer) {
      console.warn(`Buffer not found for instrument: ${instrument}`)
      return null
    }

    // Create audio source
    const source = this.audioCtx.createBufferSource()
    source.buffer = buffer

    // Create gain node for volume control
    const gainNode = this.audioCtx.createGain()

    // Apply gain from options or use default
    if (options.gain !== undefined) {
      gainNode.gain.value = options.gain
    } else {
      // Default volumes per instrument
      gainNode.gain.value = this.getDefaultGain(instrument)
    }

    // Apply pitch shift from options
    if (options.pitch !== undefined) {
      source.playbackRate.value = options.pitch
    } else if (options.hand) {
      // Apply hand-based pitch shift
      if (options.hand === 'r') {
        source.playbackRate.value = 1.02 // Right hand: slightly higher
      } else if (options.hand === 'l') {
        source.playbackRate.value = 0.98 // Left hand: slightly lower
      }
    }

    // Connect: source → gainNode → destination
    source.connect(gainNode)
    gainNode.connect(this.audioCtx.destination)
    source.start(time)

    return source
  }

  /**
   * Get current audio context time
   */
  getCurrentTime(): number {
    return this.audioCtx.currentTime
  }

  /**
   * Get default gain for an instrument
   */
  private getDefaultGain(instrument: Instrument): number {
    if (instrument === 'snSnareGhost') {
      return 0.6 // Ghost notes quieter
    } else if (instrument === 'cySplashRegular') {
      return 0.5 // Splash cymbal slightly quieter
    }
    return 1.0 // Normal volume
  }
}
