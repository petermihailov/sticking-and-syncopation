import type {
  Beat,
  Instrument,
  Bar,
  DrumKit,
  Group,
  Hand,
} from '../types/instrument'
import { getAudioContext } from '../utils/audio'
import { getInstrumentsByIndex } from '../utils/groove'

export class Player {
  private readonly audioCtx: AudioContext
  private kit: DrumKit
  private bars: Bar[]
  private tempo: number
  private metronome: boolean
  private muted: Group[]
  private nextBeatAt: number
  private onBeat: (beat: Beat) => void
  private hhOpenBuffers: AudioBufferSourceNode[]
  private fxOpenBuffers: AudioBufferSourceNode[]
  private timeoutId: number | undefined

  constructor() {
    this.kit = {} as DrumKit
    this.bars = []
    this.tempo = 80
    this.metronome = false
    this.muted = []
    this.nextBeatAt = 0
    this.onBeat = () => undefined
    this.audioCtx = getAudioContext()
    this.hhOpenBuffers = []
    this.fxOpenBuffers = []
  }

  public setKit(kit: DrumKit) {
    this.kit = kit
  }

  public setBars(bars: Bar[]) {
    this.bars = bars
  }

  public setTempo(bpm: number) {
    this.tempo = bpm
  }

  public playMetronome() {
    this.metronome = true
  }

  public stopMetronome() {
    this.metronome = false
  }

  public mute(group: Group) {
    this.muted.push(group)
  }

  public unmute(group: Group) {
    this.muted = this.muted.filter(key => key !== group)
  }

  public isMuted(group: Group) {
    this.muted.includes(group)
  }

  public setOnBeat(onBeat: (beat: Beat) => void) {
    this.onBeat = onBeat
  }

  public play() {
    // Validate that we have bars to play
    if (!this.bars || this.bars.length === 0) {
      console.warn('Cannot play: no bars set. Use setBars() first.')
      return
    }

    const bar = this.bars[0]
    if (!bar) {
      console.warn('Cannot play: first bar is invalid')
      return
    }

    const instruments = getInstrumentsByIndex(bar, 0, this.muted)
    const hand = bar.hands?.[0] ?? null

    this.nextBeatAt = this.audioCtx.currentTime

    this.scheduleMetronome(bar)
    this.playNotesAtNextBeatTime(instruments, this.nextBeatAt, hand)
    this.schedule(0, 0, instruments)
  }

  public stop() {
    window.clearTimeout(this.timeoutId)
    this.hhOpenBuffers.forEach(buffer => buffer.stop())
    this.fxOpenBuffers.forEach(buffer => buffer.stop())
    this.hhOpenBuffers = []
    this.fxOpenBuffers = []

    this.onBeat({
      barIndex: 0,
      rhythmIndex: 0,
      instruments: [],
    })
  }

  private playNotesAtNextBeatTime(
    instruments: Instrument[],
    time: number,
    hand: Hand = null
  ) {
    instruments.forEach(instrument => {
      const buffer = this.kit[instrument]
      if (!buffer) {
        console.warn(`Buffer not found for instrument: ${instrument}`)
        return
      }

      const source = this.audioCtx.createBufferSource()
      source.buffer = buffer

      // Apply pitch shift based on hand
      if (hand === 'r') {
        source.playbackRate.value = 1.02 // Right hand: slightly higher pitch
      } else if (hand === 'l') {
        source.playbackRate.value = 0.98 // Left hand: slightly lower pitch
      } else {
        source.playbackRate.value = 1.0 // No pitch shift
      }

      source.connect(this.audioCtx.destination)
      source.start(time)

      if (instrument.startsWith('fxMetronome')) {
        this.fxOpenBuffers.push(source)
      }

      if (instrument.startsWith('hh')) {
        if (instrument.startsWith('hhOpen')) {
          this.hhOpenBuffers.push(source)
        } else {
          this.hhOpenBuffers.forEach(buffer => {
            buffer.stop(time)
          })
          this.hhOpenBuffers = []
        }
      }
    })
  }

  schedule(barIndex: number, rhythmIndex: number, instruments: Instrument[]) {
    // Callback current
    this.onBeat({ barIndex, rhythmIndex, instruments })

    // Validate bar exists
    const currentBar = this.bars[barIndex]
    if (!currentBar) {
      console.warn(`Bar at index ${barIndex} not found, stopping playback`)
      this.stop()
      return
    }

    // Schedule next
    this.nextBeatAt += getNextTimeOffset(this.tempo, currentBar)

    const nextRhythmIndex = (rhythmIndex + 1) % currentBar.rhythm.length
    const nextBarIndex =
      rhythmIndex === currentBar.rhythm.length - 1
        ? (barIndex + 1) % this.bars.length
        : barIndex
    const nextBar = this.bars[nextBarIndex]

    if (!nextBar) {
      console.warn(
        `Next bar at index ${nextBarIndex} not found, stopping playback`
      )
      this.stop()
      return
    }

    // Schedule metronome
    if (nextRhythmIndex === 0) {
      this.scheduleMetronome(nextBar)
    }

    const nextInstruments = getInstrumentsByIndex(
      nextBar,
      nextRhythmIndex,
      this.muted
    )
    const nextHand = nextBar.hands?.[nextRhythmIndex] ?? null

    // Schedule next beat
    this.playNotesAtNextBeatTime(nextInstruments, this.nextBeatAt, nextHand)

    this.timeoutId = window.setTimeout(
      this.schedule.bind(this, nextBarIndex, nextRhythmIndex, nextInstruments),
      (this.nextBeatAt - this.audioCtx.currentTime) * 1000
    )
  }

  // Schedule metronome for the whole bar
  // Should call when rhythmIndex === 0
  scheduleMetronome(bar: Bar) {
    if (this.metronome) {
      const timeOffset = getNextTimeOffset(this.tempo, bar)
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
}

function getNextTimeOffset(tempo: number, bar: Bar): number {
  // Calculate time between subdivisions
  // tempo = quarter notes per minute (BPM)
  // timeDivision = subdivisions per beat (e.g., 4 for sixteenth notes)
  // Result: time in seconds between each subdivision
  if (!bar || !bar.timeDivision) {
    console.warn('Invalid bar provided to getNextTimeOffset')
    return 0
  }
  return 60 / (tempo * bar.timeDivision)
}
