import type { Bar } from '../../types/bar'
import type { AudioEngine } from './services/AudioEngine'
import { getTimeOffset } from './timing'

/**
 * Запланировать клики метронома на один такт начиная с atTime.
 * Первая доля — accent, остальные — regular.
 */
export function scheduleMetronomeBar(
  audioEngine: AudioEngine,
  bar: Bar,
  tempo: number,
  atTime: number,
  volume: number
): void {
  const timeOffset = getTimeOffset(tempo, bar)
  const timeStep = (timeOffset * bar.rhythm.length) / bar.beatsPerBar

  for (let i = 0; i < bar.beatsPerBar; i++) {
    const instrument = i === 0 ? 'fxMetronomeAccent' : 'fxMetronomeRegular'
    audioEngine.playInstrument(instrument, atTime + timeStep * i, volume)
  }
}
