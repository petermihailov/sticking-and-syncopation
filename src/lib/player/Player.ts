import { TEMPO, FLAM } from '../../config/constants'
import type { Beat, Group } from '../../types/instrument'
import type { Bar } from '../../types/bar'
import type { DrumKit } from '../../types/kit'
import type { InstrumentVoice, StickingMapping } from '../../types/sticking'
import { DEFAULT_STICKING_MAPPING } from '../../types/sticking'
import { getVoicesByIndex } from '../../utils/groove'
import {
  EMPTY_RESOLVER_STATE,
  resolveStroke,
  stateToCounters,
  type ResolverState,
} from './StickingResolver'
import { AudioEngine } from './services/AudioEngine'
import { BufferManager } from './services/BufferManager'
import { getAudioContext } from '../../utils/audio'
import { getTimeOffset } from './timing'
import { scheduleMetronomeBar } from './metronome'

/**
 * Сериализуемое состояние плеера. PlayerControlContext собирает его
 * из реактивного состояния и однократным вызовом applyState отправляет в Player.
 */
export interface PlayerState {
  bars: Bar[]
  tempo: number
  metronomeEnabled: boolean
  metronomeVolume: number
  playbackVolume: number
  mapping: StickingMapping
  mutedGroups: Group[]
  kit?: DrumKit
}

const DEFAULT_PLAYER_STATE: PlayerState = {
  bars: [],
  tempo: TEMPO.DEFAULT,
  metronomeEnabled: false,
  metronomeVolume: 1.0,
  playbackVolume: 1.0,
  mapping: DEFAULT_STICKING_MAPPING,
  mutedGroups: [],
}

/**
 * Player — оркеструет воспроизведение, координируя внутренние сервисы.
 * Состояние применяется только через applyState (reducer-стиль).
 */
export class Player {
  private state: PlayerState = DEFAULT_PLAYER_STATE
  private resolverState: ResolverState = EMPTY_RESOLVER_STATE
  private onBeat: (beat: Beat) => void = () => undefined

  private nextBeatAt: number = 0
  private timeoutId: number | undefined

  private readonly audioEngine: AudioEngine = new AudioEngine(getAudioContext())
  private readonly buffers: BufferManager = new BufferManager()

  // === Public API ===

  applyState(next: PlayerState): void {
    const prev = this.state

    if (next.kit && next.kit !== prev.kit) {
      this.audioEngine.setKit(next.kit)
    }

    // Если маппинг изменился — сбрасываем счётчики ротации, иначе индексация
    // поедет относительно нового списка инструментов.
    if (next.mapping !== prev.mapping) {
      this.resolverState = EMPTY_RESOLVER_STATE
    }

    this.state = next
  }

  setOnBeat(onBeat: (beat: Beat) => void): void {
    this.onBeat = onBeat
  }

  getInstrumentCounters(): Map<string, number> {
    return stateToCounters(this.resolverState)
  }

  play(): void {
    const { bars } = this.state
    if (!bars || bars.length === 0) {
      console.warn('Cannot play: no bars set.')
      return
    }

    this.resolverState = EMPTY_RESOLVER_STATE
    this.nextBeatAt = this.audioEngine.getCurrentTime()

    // Если первый удар с флэмом — сдвигаем старт, чтобы grace note успел прозвучать
    const firstBar = bars[0]
    if (firstBar?.flams?.[0]) {
      const flamOffset = Math.max(
        FLAM.OFFSET_MIN,
        Math.min(FLAM.OFFSET_MAX, (60 / this.state.tempo) * FLAM.OFFSET_TEMPO_MULTIPLIER)
      )
      this.nextBeatAt += flamOffset
      const flamVoices = this.resolveFlamGrace(firstBar, 0).map(v => ({
        ...v,
        gain: (v.gain ?? 1.0) * FLAM.GAIN_MULTIPLIER,
      }))
      this.playVoicesAt(flamVoices, this.nextBeatAt - flamOffset)
    }

    this.tickAt(0, 0)
  }

  stop(): void {
    if (this.timeoutId !== undefined) {
      window.clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }
    // Глушим всё уже запланированное в Web Audio (метроном, хвосты).
    this.audioEngine.silence()
    this.buffers.clearAll()
    this.resolverState = EMPTY_RESOLVER_STATE

    this.onBeat({ barIndex: 0, rhythmIndex: 0, instruments: [] })
  }

  // === Private Methods ===

  /**
   * Сыграть один шаг (бар, субдивизия) в this.nextBeatAt и запланировать следующий.
   */
  private tickAt(barIndex: number, rhythmIndex: number): void {
    const { bars } = this.state
    if (!bars || bars.length === 0) {
      this.stop()
      return
    }

    const safeBarIndex = barIndex % bars.length
    const currentBar = bars[safeBarIndex]
    if (!currentBar || !currentBar.rhythm || currentBar.rhythm.length === 0) {
      this.stop()
      return
    }

    const safeRhythmIndex = rhythmIndex % currentBar.rhythm.length

    // Метроном планируем на старте каждого такта.
    if (safeRhythmIndex === 0 && this.state.metronomeEnabled) {
      scheduleMetronomeBar(
        this.audioEngine,
        currentBar,
        this.state.tempo,
        this.nextBeatAt,
        this.state.metronomeVolume
      )
    }

    const voices = this.resolveVoices(currentBar, safeRhythmIndex)
    this.playVoicesAt(voices, this.nextBeatAt)

    this.onBeat({
      barIndex: safeBarIndex,
      rhythmIndex: safeRhythmIndex,
      instruments: voices.map(v => v.instrument),
    })

    // Сдвигаем горизонт на следующий шаг.
    const stepDuration = getTimeOffset(this.state.tempo, currentBar)
    this.nextBeatAt += stepDuration

    const nextRhythmIndex = (safeRhythmIndex + 1) % currentBar.rhythm.length
    const nextBarIndex =
      safeRhythmIndex === currentBar.rhythm.length - 1
        ? (safeBarIndex + 1) % bars.length
        : safeBarIndex

    // Флэм: смотрим, есть ли флэм на СЛЕДУЮЩЕМ ударе.
    // Планируем grace note заранее — пока nextBeatAt ещё в будущем.
    const nextBar = bars[nextBarIndex]
    if (nextBar?.flams?.[nextRhythmIndex]) {
      const flamVoices = this.resolveFlamGrace(nextBar, nextRhythmIndex).map(
        v => ({ ...v, gain: (v.gain ?? 1.0) * FLAM.GAIN_MULTIPLIER })
      )
      const flamOffset = Math.max(
        FLAM.OFFSET_MIN,
        Math.min(FLAM.OFFSET_MAX, (60 / this.state.tempo) * FLAM.OFFSET_TEMPO_MULTIPLIER)
      )
      this.playVoicesAt(flamVoices, this.nextBeatAt - flamOffset)
    }

    const delay = (this.nextBeatAt - this.audioEngine.getCurrentTime()) * 1000
    this.timeoutId = window.setTimeout(
      () => this.tickAt(nextBarIndex, nextRhythmIndex),
      Math.max(0, delay)
    )
  }

  /**
   * Получить voices для субдивизии: либо через резолвер (если в такте есть
   * исходные символы стикинга), либо напрямую из bar.rhythm.
   */
  private resolveVoices(bar: Bar, rhythmIndex: number): InstrumentVoice[] {
    const stroke = bar.stickings?.[rhythmIndex]
    if (stroke) {
      const result = resolveStroke(
        stroke,
        this.state.mapping,
        this.resolverState
      )
      this.resolverState = result.nextState
      return result.voices
    }
    return getVoicesByIndex(bar, rhythmIndex, this.state.mutedGroups)
  }

  /**
   * Резолвим grace note для флэма: противоположная рука, ghost-громкость.
   * Не меняем resolverState — флэм не участвует в ротации.
   */
  private resolveFlamGrace(bar: Bar, rhythmIndex: number): InstrumentVoice[] {
    const stroke = bar.stickings?.[rhythmIndex]
    if (!stroke) return []

    // Противоположная рука в lowercase (ghost)
    const lower = stroke.toLowerCase()
    const ghostStroke = lower === 'r' ? 'l' : lower === 'l' ? 'r' : null
    if (!ghostStroke) return []

    const result = resolveStroke(
      ghostStroke,
      this.state.mapping,
      this.resolverState
    )
    // Не обновляем resolverState — флэм не сдвигает ротацию.
    return result.voices
  }

  private playVoicesAt(voices: InstrumentVoice[], time: number): void {
    const vol = this.state.playbackVolume
    voices.forEach(voice => {
      const adjusted = vol < 1 ? { ...voice, gain: (voice.gain ?? 1) * vol } : voice
      const source = this.audioEngine.playVoice(adjusted, time)
      if (!source) return

      // Hi-hat: открытый трек копим, чтобы оборвать при закрытом ударе.
      if (voice.instrument.startsWith('hh')) {
        if (voice.instrument.startsWith('hhOpen')) {
          this.buffers.addHiHatBuffer(source)
        } else {
          this.buffers.stopHiHatBuffers(time)
        }
      }
    })
  }
}
