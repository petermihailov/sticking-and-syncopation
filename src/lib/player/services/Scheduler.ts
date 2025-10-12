import type { Bar } from '../../../types/instrument'
import type { IScheduler } from '../di/types'

/**
 * Scheduler service - handles timing and scheduling
 */
export class Scheduler implements IScheduler {
  /**
   * Schedule a callback to run after a delay
   */
  schedule(callback: () => void, delayMs: number): number {
    return window.setTimeout(callback, delayMs)
  }

  /**
   * Clear a scheduled callback
   */
  clear(id: number): void {
    window.clearTimeout(id)
  }

  /**
   * Calculate time offset between beats
   * @param tempo - Beats per minute
   * @param bar - Bar with time division info
   * @returns Time in seconds between each subdivision
   */
  getTimeOffset(tempo: number, bar: Bar): number {
    if (!bar || !bar.timeDivision) {
      console.warn('Invalid bar provided to getTimeOffset')
      return 0
    }

    // tempo = quarter notes per minute (BPM)
    // timeDivision = subdivisions per beat (e.g., 4 for sixteenth notes)
    // Result: time in seconds between each subdivision
    return 60 / (tempo * bar.timeDivision)
  }
}
