import type { Instrument } from '../../../types/instrument'
import type { DrumKit } from '../../../types/kit'
import type { InstrumentVoice } from '../../../types/sticking'

/**
 * Audio engine — только Web Audio. Никаких политик громкости/питча:
 * gain и rate приходят в voice от резолвера.
 *
 * Все источники подключаются к masterGain. silence() мгновенно глушит
 * всё, что уже запланировано в Web Audio (метроном, хвосты), и создаёт
 * новый masterGain для следующего сеанса. Это избавляет от необходимости
 * вручную отслеживать активные source-ноды.
 */
export class AudioEngine {
  private readonly audioCtx: AudioContext
  private kit: DrumKit = {}
  private masterGain: GainNode

  constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx
    this.masterGain = this.createMaster()
  }

  setKit(kit: DrumKit): void {
    this.kit = kit
  }

  /**
   * Сыграть voice (инструмент + опциональные gain/rate) в заданное время.
   */
  playVoice(
    voice: InstrumentVoice,
    time: number
  ): AudioBufferSourceNode | null {
    return this.playInstrument(voice.instrument, time, voice.gain, voice.rate)
  }

  /**
   * Низкоуровневая версия для метронома и других системных звуков.
   */
  playInstrument(
    instrument: Instrument,
    time: number,
    gain?: number,
    rate?: number
  ): AudioBufferSourceNode | null {
    const buffer = this.kit[instrument]
    if (!buffer) {
      console.warn(`Buffer not found for instrument: ${instrument}`)
      return null
    }

    const source = this.audioCtx.createBufferSource()
    source.buffer = buffer

    const gainNode = this.audioCtx.createGain()
    gainNode.gain.value = gain ?? 1.0
    if (rate !== undefined) source.playbackRate.value = rate

    source.connect(gainNode)
    gainNode.connect(this.masterGain)
    source.start(time)

    return source
  }

  /**
   * Заглушить всё запланированное и пересоздать masterGain.
   * Используется при stop, чтобы метроном/хвосты не доигрывали после остановки.
   */
  silence(): void {
    try {
      this.masterGain.disconnect()
    } catch {
      // ignore
    }
    this.masterGain = this.createMaster()
  }

  getCurrentTime(): number {
    return this.audioCtx.currentTime
  }

  private createMaster(): GainNode {
    const node = this.audioCtx.createGain()
    node.gain.value = 1.0
    node.connect(this.audioCtx.destination)
    return node
  }
}
