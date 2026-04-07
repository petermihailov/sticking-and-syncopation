import type { Instrument, StickingMapping } from '../../../types/instrument'
import { DEFAULT_STICKING_MAPPING } from '../../../types/instrument'

/**
 * Instrument resolver service - resolves sticking symbols to instruments with rotation
 */
export class InstrumentResolver {
  private mapping: StickingMapping = DEFAULT_STICKING_MAPPING
  private counters = new Map<string, number>()

  /**
   * Set the instrument mapping
   */
  setMapping(mapping: StickingMapping): void {
    this.mapping = mapping
  }

  /**
   * Resolve a sticking symbol to instruments with rotation
   * Each sticking has its own counter that increments on each use
   */
  resolve(sticking: string): Instrument[] {
    const instruments: Instrument[] = []

    switch (sticking) {
      case 'R':
        // Uppercase R with rotation
        this.addInstrumentsWithRotation(
          instruments,
          this.mapping.uppercaseR,
          'uppercaseR'
        )
        // Add optional kick
        if (this.mapping.uppercaseRKick) {
          this.addInstrumentsWithRotation(
            instruments,
            this.mapping.kick,
            'kick_R'
          )
        }
        break

      case 'L':
        // Uppercase L with rotation
        this.addInstrumentsWithRotation(
          instruments,
          this.mapping.uppercaseL,
          'uppercaseL'
        )
        // Add optional kick
        if (this.mapping.uppercaseLKick) {
          this.addInstrumentsWithRotation(
            instruments,
            this.mapping.kick,
            'kick_L'
          )
        }
        break

      case 'r':
        // Lowercase r with rotation
        this.addInstrumentsWithRotation(
          instruments,
          this.mapping.lowercaseR,
          'lowercaseR'
        )
        break

      case 'l':
        // Lowercase l with rotation
        this.addInstrumentsWithRotation(
          instruments,
          this.mapping.lowercaseL,
          'lowercaseL'
        )
        break

      case 'k':
        // Kick with rotation
        this.addInstrumentsWithRotation(
          instruments,
          this.mapping.kick,
          'kick'
        )
        break

      default:
        // Unknown sticking - do nothing
        break
    }

    return instruments
  }

  /**
   * Get current rotation counters
   */
  getCounters(): Map<string, number> {
    return new Map(this.counters)
  }

  /**
   * Reset all rotation counters
   */
  resetCounters(): void {
    this.counters.clear()
  }

  /**
   * Add instruments from array with rotation
   */
  private addInstrumentsWithRotation(
    target: Instrument[],
    source: Instrument[],
    counterKey: string
  ): void {
    if (source.length === 0) return

    const counter = this.counters.get(counterKey) || 0
    target.push(source[counter % source.length])
    this.counters.set(counterKey, counter + 1)
  }
}
