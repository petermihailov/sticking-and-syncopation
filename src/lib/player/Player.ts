import type {
  Beat,
  Instrument,
  Bar,
  DrumKit,
  Group,
  StickingMapping,
} from '../../types/instrument'
import { getInstrumentsByIndex } from '../../utils/groove'
import type {
  IAudioEngine,
  IScheduler,
  IInstrumentResolver,
  IStateManager,
  IBufferManager,
} from './di/types'

/**
 * Player - orchestrates playback using injected services
 * Thin layer that coordinates between services
 */
export class Player {
  private nextBeatAt: number = 0
  private timeoutId: number | undefined

  constructor(
    private readonly audioEngine: IAudioEngine,
    private readonly scheduler: IScheduler,
    private readonly resolver: IInstrumentResolver,
    private readonly state: IStateManager,
    private readonly buffers: IBufferManager
  ) {}

  // === Public API ===

  public setKit(kit: DrumKit): void {
    this.state.setKit(kit)
    // AudioEngine needs kit too for playback
    if ('setKit' in this.audioEngine) {
      ;(this.audioEngine as any).setKit(kit)
    }
  }

  public setBars(bars: Bar[]): void {
    this.state.setBars(bars)
  }

  public setTempo(bpm: number): void {
    this.state.setTempo(bpm)
  }

  public playMetronome(): void {
    this.state.enableMetronome()
  }

  public stopMetronome(): void {
    this.state.disableMetronome()
  }

  public setMetronomeVolume(volume: number): void {
    this.state.setMetronomeVolume(volume)
  }

  public setInstrumentMapping(mapping: StickingMapping): void {
    this.resolver.setMapping(mapping)
  }

  public getInstrumentCounters(): Map<string, number> {
    return this.resolver.getCounters()
  }

  public mute(group: Group): void {
    this.state.mute(group)
  }

  public unmute(group: Group): void {
    this.state.unmute(group)
  }

  public isMuted(group: Group): boolean {
    return this.state.isMuted(group)
  }

  public setOnBeat(onBeat: (beat: Beat) => void): void {
    this.state.setOnBeat(onBeat)
  }

  public play(): void {
    const bars = this.state.getBars()

    // Validate that we have bars to play
    if (!bars || bars.length === 0) {
      console.warn('Cannot play: no bars set. Use setBars() first.')
      return
    }

    const bar = bars[0]
    if (!bar) {
      console.warn('Cannot play: first bar is invalid')
      return
    }

    // Resolve instruments with rotation if stickings are available
    let instruments: Instrument[]
    if (bar.stickings && bar.stickings[0]) {
      instruments = this.resolver.resolve(bar.stickings[0])
    } else {
      instruments = getInstrumentsByIndex(bar, 0, this.state.getMutedGroups())
    }

    const hand = bar.hands?.[0] ?? null

    this.nextBeatAt = this.audioEngine.getCurrentTime()

    this.scheduleMetronome(bar)
    this.playNotesAtNextBeatTime(instruments, this.nextBeatAt, hand)
    this.schedule(0, 0, instruments)
  }

  public stop(): void {
    if (this.timeoutId !== undefined) {
      this.scheduler.clear(this.timeoutId)
    }
    this.buffers.clearAll()
    this.resolver.resetCounters()

    this.state.getOnBeat()({
      barIndex: 0,
      rhythmIndex: 0,
      instruments: [],
    })
  }

  // === Private Methods ===

  private playNotesAtNextBeatTime(
    instruments: Instrument[],
    time: number,
    hand: 'r' | 'l' | null = null
  ): void {
    const metronomeVolume = this.state.getMetronomeVolume()

    instruments.forEach(instrument => {
      // Calculate gain
      let gain = 1.0
      if (instrument.startsWith('fxMetronome')) {
        gain = metronomeVolume
      }

      // Play instrument
      const source = this.audioEngine.playInstrument(instrument, time, {
        gain,
        hand,
      })

      if (!source) return

      // Track buffers for special handling
      if (instrument.startsWith('fxMetronome')) {
        this.buffers.addMetronomeBuffer(source)
      }

      if (instrument.startsWith('hh')) {
        if (instrument.startsWith('hhOpen')) {
          this.buffers.addHiHatBuffer(source)
        } else {
          // Close hi-hat: stop all open buffers
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
    const bars = this.state.getBars()

    // Safety check: stop if no bars available
    if (!bars || bars.length === 0) {
      console.warn('No bars available, stopping playback')
      this.stop()
      return
    }

    // Normalize barIndex to handle bars array replacement during playback
    const safeBarIndex = barIndex % bars.length
    const currentBar = bars[safeBarIndex]

    // Validate bar exists
    if (!currentBar || !currentBar.rhythm || currentBar.rhythm.length === 0) {
      console.warn(`Invalid bar at index ${safeBarIndex}, stopping playback`)
      this.stop()
      return
    }

    // Normalize rhythmIndex in case bar structure changed
    const safeRhythmIndex = rhythmIndex % currentBar.rhythm.length

    // Callback current beat
    this.state.getOnBeat()({
      barIndex: safeBarIndex,
      rhythmIndex: safeRhythmIndex,
      instruments,
    })

    // Schedule next
    this.nextBeatAt += this.scheduler.getTimeOffset(
      this.state.getTempo(),
      currentBar
    )

    const nextRhythmIndex = (safeRhythmIndex + 1) % currentBar.rhythm.length
    const nextBarIndex =
      safeRhythmIndex === currentBar.rhythm.length - 1
        ? (safeBarIndex + 1) % bars.length
        : safeBarIndex
    const nextBar = bars[nextBarIndex]

    if (!nextBar) {
      console.warn(
        `Next bar at index ${nextBarIndex} not found, stopping playback`
      )
      this.stop()
      return
    }

    // Schedule metronome for new bar
    if (nextRhythmIndex === 0) {
      this.scheduleMetronome(nextBar)
    }

    // Resolve instruments with rotation if stickings are available
    let nextInstruments: Instrument[]
    if (nextBar.stickings && nextBar.stickings[nextRhythmIndex]) {
      nextInstruments = this.resolver.resolve(nextBar.stickings[nextRhythmIndex])
    } else {
      nextInstruments = getInstrumentsByIndex(
        nextBar,
        nextRhythmIndex,
        this.state.getMutedGroups()
      )
    }

    const nextHand = nextBar.hands?.[nextRhythmIndex] ?? null

    // Schedule next beat
    this.playNotesAtNextBeatTime(nextInstruments, this.nextBeatAt, nextHand)

    const delay = (this.nextBeatAt - this.audioEngine.getCurrentTime()) * 1000
    this.timeoutId = this.scheduler.schedule(
      () => this.schedule(nextBarIndex, nextRhythmIndex, nextInstruments),
      delay
    )
  }

  private scheduleMetronome(bar: Bar): void {
    if (!this.state.isMetronomeEnabled()) return

    const tempo = this.state.getTempo()
    const timeOffset = this.scheduler.getTimeOffset(tempo, bar)
    const timeStep = (timeOffset * bar.rhythm.length) / bar.beatsPerBar

    for (let i = 0; i < bar.beatsPerBar; i++) {
      const instrument = i === 0 ? 'fxMetronomeAccent' : 'fxMetronomeRegular'
      this.playNotesAtNextBeatTime(
        [instrument],
        this.nextBeatAt + timeStep * i
      )
    }
  }
}
