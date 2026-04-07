import type {
  Beat,
  Instrument,
  Bar,
  DrumKit,
  Group,
  StickingMapping,
} from '../../types/instrument'
import { getInstrumentsByIndex } from '../../utils/groove'
import type { AudioEngine } from './services/AudioEngine'
import type { Scheduler } from './services/Scheduler'
import type { InstrumentResolver } from './services/InstrumentResolver'
import type { BufferManager } from './services/BufferManager'

/**
 * Player — оркеструет воспроизведение, координируя сервисы.
 * Держит собственное состояние (темп, метроном, такты, заглушенные группы).
 */
export class Player {
  private tempo: number = 80
  private metronomeEnabled: boolean = false
  private metronomeVolume: number = 1.0
  private bars: Bar[] = []
  private mutedGroups: Group[] = []
  private onBeat: (beat: Beat) => void = () => undefined

  private nextBeatAt: number = 0
  private timeoutId: number | undefined

  constructor(
    private readonly audioEngine: AudioEngine,
    private readonly scheduler: Scheduler,
    private readonly resolver: InstrumentResolver,
    private readonly buffers: BufferManager
  ) {}

  // === Public API ===

  setKit(kit: DrumKit): void {
    this.audioEngine.setKit(kit)
  }

  setBars(bars: Bar[]): void {
    this.bars = bars
  }

  setTempo(bpm: number): void {
    this.tempo = bpm
  }

  playMetronome(): void {
    this.metronomeEnabled = true
  }

  stopMetronome(): void {
    this.metronomeEnabled = false
  }

  setMetronomeVolume(volume: number): void {
    this.metronomeVolume = volume
  }

  setInstrumentMapping(mapping: StickingMapping): void {
    this.resolver.setMapping(mapping)
  }

  getInstrumentCounters(): Map<string, number> {
    return this.resolver.getCounters()
  }

  mute(group: Group): void {
    if (!this.mutedGroups.includes(group)) {
      this.mutedGroups.push(group)
    }
  }

  unmute(group: Group): void {
    this.mutedGroups = this.mutedGroups.filter(g => g !== group)
  }

  isMuted(group: Group): boolean {
    return this.mutedGroups.includes(group)
  }

  setOnBeat(onBeat: (beat: Beat) => void): void {
    this.onBeat = onBeat
  }

  play(): void {
    if (!this.bars || this.bars.length === 0) {
      console.warn('Cannot play: no bars set. Use setBars() first.')
      return
    }

    const bar = this.bars[0]
    if (!bar) {
      console.warn('Cannot play: first bar is invalid')
      return
    }

    const instruments = this.resolveInstruments(bar, 0)
    const hand = bar.hands?.[0] ?? null

    this.nextBeatAt = this.audioEngine.getCurrentTime()

    this.scheduleMetronome(bar)
    this.playNotesAtNextBeatTime(instruments, this.nextBeatAt, hand)
    this.schedule(0, 0, instruments)
  }

  stop(): void {
    if (this.timeoutId !== undefined) {
      this.scheduler.clear(this.timeoutId)
    }
    this.buffers.clearAll()
    this.resolver.resetCounters()

    this.onBeat({
      barIndex: 0,
      rhythmIndex: 0,
      instruments: [],
    })
  }

  // === Private Methods ===

  private resolveInstruments(bar: Bar, rhythmIndex: number): Instrument[] {
    if (bar.stickings && bar.stickings[rhythmIndex]) {
      return this.resolver.resolve(bar.stickings[rhythmIndex])
    }
    return getInstrumentsByIndex(bar, rhythmIndex, this.mutedGroups)
  }

  private playNotesAtNextBeatTime(
    instruments: Instrument[],
    time: number,
    hand: 'r' | 'l' | null = null
  ): void {
    instruments.forEach(instrument => {
      let gain = 1.0
      if (instrument.startsWith('fxMetronome')) {
        gain = this.metronomeVolume
      }

      const source = this.audioEngine.playInstrument(instrument, time, {
        gain,
        hand,
      })

      if (!source) return

      if (instrument.startsWith('fxMetronome')) {
        this.buffers.addMetronomeBuffer(source)
      }

      if (instrument.startsWith('hh')) {
        if (instrument.startsWith('hhOpen')) {
          this.buffers.addHiHatBuffer(source)
        } else {
          this.buffers.stopHiHatBuffers(time)
        }
      }
    })
  }

  private schedule(
    barIndex: number,
    rhythmIndex: number,
    instruments: Instrument[]
  ): void {
    if (!this.bars || this.bars.length === 0) {
      console.warn('No bars available, stopping playback')
      this.stop()
      return
    }

    const safeBarIndex = barIndex % this.bars.length
    const currentBar = this.bars[safeBarIndex]

    if (!currentBar || !currentBar.rhythm || currentBar.rhythm.length === 0) {
      console.warn(`Invalid bar at index ${safeBarIndex}, stopping playback`)
      this.stop()
      return
    }

    const safeRhythmIndex = rhythmIndex % currentBar.rhythm.length

    this.onBeat({
      barIndex: safeBarIndex,
      rhythmIndex: safeRhythmIndex,
      instruments,
    })

    this.nextBeatAt += this.scheduler.getTimeOffset(this.tempo, currentBar)

    const nextRhythmIndex = (safeRhythmIndex + 1) % currentBar.rhythm.length
    const nextBarIndex =
      safeRhythmIndex === currentBar.rhythm.length - 1
        ? (safeBarIndex + 1) % this.bars.length
        : safeBarIndex
    const nextBar = this.bars[nextBarIndex]

    if (!nextBar) {
      console.warn(
        `Next bar at index ${nextBarIndex} not found, stopping playback`
      )
      this.stop()
      return
    }

    if (nextRhythmIndex === 0) {
      this.scheduleMetronome(nextBar)
    }

    const nextInstruments = this.resolveInstruments(nextBar, nextRhythmIndex)
    const nextHand = nextBar.hands?.[nextRhythmIndex] ?? null

    this.playNotesAtNextBeatTime(nextInstruments, this.nextBeatAt, nextHand)

    const delay = (this.nextBeatAt - this.audioEngine.getCurrentTime()) * 1000
    this.timeoutId = this.scheduler.schedule(
      () => this.schedule(nextBarIndex, nextRhythmIndex, nextInstruments),
      delay
    )
  }

  private scheduleMetronome(bar: Bar): void {
    if (!this.metronomeEnabled) return

    const timeOffset = this.scheduler.getTimeOffset(this.tempo, bar)
    const timeStep = (timeOffset * bar.rhythm.length) / bar.beatsPerBar

    for (let i = 0; i < bar.beatsPerBar; i++) {
      const instrument = i === 0 ? 'fxMetronomeAccent' : 'fxMetronomeRegular'
      this.playNotesAtNextBeatTime([instrument], this.nextBeatAt + timeStep * i)
    }
  }
}
