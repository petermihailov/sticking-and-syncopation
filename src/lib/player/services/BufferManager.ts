import type { IBufferManager } from '../di/types'

/**
 * Buffer manager service - manages active audio buffers (hi-hat, metronome)
 */
export class BufferManager implements IBufferManager {
  private hiHatBuffers: AudioBufferSourceNode[] = []
  private metronomeBuffers: AudioBufferSourceNode[] = []

  /**
   * Add a hi-hat buffer to track
   */
  addHiHatBuffer(buffer: AudioBufferSourceNode): void {
    this.hiHatBuffers.push(buffer)
  }

  /**
   * Add a metronome buffer to track
   */
  addMetronomeBuffer(buffer: AudioBufferSourceNode): void {
    this.metronomeBuffers.push(buffer)
  }

  /**
   * Stop all hi-hat buffers at a specific time
   * Used when closing hi-hat (stop all open hi-hat sounds)
   */
  stopHiHatBuffers(time: number): void {
    this.hiHatBuffers.forEach(buffer => {
      try {
        buffer.stop(time)
      } catch (e) {
        // Buffer may already be stopped, ignore error
      }
    })
    this.hiHatBuffers = []
  }

  /**
   * Stop all metronome buffers
   */
  stopMetronomeBuffers(): void {
    this.metronomeBuffers.forEach(buffer => {
      try {
        buffer.stop()
      } catch (e) {
        // Buffer may already be stopped, ignore error
      }
    })
    this.metronomeBuffers = []
  }

  /**
   * Clear all buffers and stop them
   */
  clearAll(): void {
    this.stopHiHatBuffers(0)
    this.stopMetronomeBuffers()
  }
}
