import type {
  Beat,
  Instrument,
  Bar,
  DrumKit,
  Group,
  Hand,
  StickingMapping,
} from '../types/instrument'
import { DEFAULT_STICKING_MAPPING } from '../types/instrument'
import { getAudioContext } from '../utils/audio'
import { getInstrumentsByIndex } from '../utils/groove'

export class Player {
  private readonly audioCtx: AudioContext
  private kit: DrumKit
  private bars: Bar[]
  private tempo: number
  private metronome: boolean
  private metronomeVolume: number
  private muted: Group[]
  private nextBeatAt: number
  private onBeat: (beat: Beat) => void
  private hhOpenBuffers: AudioBufferSourceNode[]
  private fxOpenBuffers: AudioBufferSourceNode[]
  private timeoutId: number | undefined
  private instrumentCounters: Map<string, number>
  private mapping: StickingMapping

  constructor() {
    this.kit = {} as DrumKit
    this.bars = []
    this.tempo = 80
    this.metronome = false
    this.metronomeVolume = 1.0
    this.muted = []
    this.nextBeatAt = 0
    this.onBeat = () => undefined
    this.audioCtx = getAudioContext()
    this.hhOpenBuffers = []
    this.fxOpenBuffers = []
    this.instrumentCounters = new Map()
    this.mapping = DEFAULT_STICKING_MAPPING
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

  public setMetronomeVolume(volume: number) {
    this.metronomeVolume = volume
  }

  public setInstrumentMapping(mapping: StickingMapping) {
    this.mapping = mapping
  }

  public getInstrumentCounters(): Map<string, number> {
    return new Map(this.instrumentCounters)
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

    // Resolve instruments with rotation if stickings are available
    let instruments: Instrument[]
    if (bar.stickings && bar.stickings[0]) {
      instruments = this.resolveStickingToInstruments(bar.stickings[0])
    } else {
      instruments = getInstrumentsByIndex(bar, 0, this.muted)
    }

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
    this.instrumentCounters.clear()

    this.onBeat({
      barIndex: 0,
      rhythmIndex: 0,
      instruments: [],
    })
  }

  /**
   * Resolve a sticking symbol to instruments with rotation
   * Each sticking has its own counter that increments on each use
   */
  private resolveStickingToInstruments(sticking: string): Instrument[] {
    const instruments: Instrument[] = []

    if (sticking === 'R') {
      // Uppercase R with rotation
      const array = this.mapping.uppercaseR
      if (array.length > 0) {
        const counter = this.instrumentCounters.get('uppercaseR') || 0
        instruments.push(array[counter % array.length])
        this.instrumentCounters.set('uppercaseR', counter + 1)
      }
      // Add optional kick
      if (this.mapping.uppercaseRKick) {
        const kickArray = this.mapping.kick
        if (kickArray.length > 0) {
          const kickCounter = this.instrumentCounters.get('kick_R') || 0
          instruments.push(kickArray[kickCounter % kickArray.length])
          this.instrumentCounters.set('kick_R', kickCounter + 1)
        }
      }
    } else if (sticking === 'L') {
      // Uppercase L with rotation
      const array = this.mapping.uppercaseL
      if (array.length > 0) {
        const counter = this.instrumentCounters.get('uppercaseL') || 0
        instruments.push(array[counter % array.length])
        this.instrumentCounters.set('uppercaseL', counter + 1)
      }
      // Add optional kick
      if (this.mapping.uppercaseLKick) {
        const kickArray = this.mapping.kick
        if (kickArray.length > 0) {
          const kickCounter = this.instrumentCounters.get('kick_L') || 0
          instruments.push(kickArray[kickCounter % kickArray.length])
          this.instrumentCounters.set('kick_L', kickCounter + 1)
        }
      }
    } else if (sticking === 'r') {
      // Lowercase r with rotation
      const array = this.mapping.lowercaseR
      if (array.length > 0) {
        const counter = this.instrumentCounters.get('lowercaseR') || 0
        instruments.push(array[counter % array.length])
        this.instrumentCounters.set('lowercaseR', counter + 1)
      }
    } else if (sticking === 'l') {
      // Lowercase l with rotation
      const array = this.mapping.lowercaseL
      if (array.length > 0) {
        const counter = this.instrumentCounters.get('lowercaseL') || 0
        instruments.push(array[counter % array.length])
        this.instrumentCounters.set('lowercaseL', counter + 1)
      }
    } else if (sticking === 'k') {
      // Kick with rotation
      const array = this.mapping.kick
      if (array.length > 0) {
        const counter = this.instrumentCounters.get('kick') || 0
        instruments.push(array[counter % array.length])
        this.instrumentCounters.set('kick', counter + 1)
      }
    }

    return instruments
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

      // Create GainNode for volume control
      const gainNode = this.audioCtx.createGain()

      // Set volume per instrument
      if (instrument === 'snSnareGhost') {
        gainNode.gain.value = 0.6 // Ghost notes quieter
      } else if (instrument === 'cySplashRegular') {
        gainNode.gain.value = 0.5 // Splash cymbal slightly quieter
      } else {
        gainNode.gain.value = 1.0 // Normal volume
      }

      // Apply metronome volume
      if (instrument.startsWith('fxMetronome')) {
        gainNode.gain.value *= this.metronomeVolume
      }

      // Apply pitch shift based on hand
      if (hand === 'r') {
        source.playbackRate.value = 1.02 // Right hand: slightly higher pitch
      } else if (hand === 'l') {
        source.playbackRate.value = 0.98 // Left hand: slightly lower pitch
      } else {
        source.playbackRate.value = 1.0 // No pitch shift
      }

      // Connect: source → gainNode → destination
      source.connect(gainNode)
      gainNode.connect(this.audioCtx.destination)
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
    // Safety check: stop if no bars available
    if (!this.bars || this.bars.length === 0) {
      console.warn('No bars available, stopping playback')
      this.stop()
      return
    }

    // Normalize barIndex to handle bars array replacement during playback
    const safeBarIndex = barIndex % this.bars.length

    // Validate bar exists
    const currentBar = this.bars[safeBarIndex]
    if (!currentBar || !currentBar.rhythm || currentBar.rhythm.length === 0) {
      console.warn(`Invalid bar at index ${safeBarIndex}, stopping playback`)
      this.stop()
      return
    }

    // Normalize rhythmIndex in case bar structure changed
    const safeRhythmIndex = rhythmIndex % currentBar.rhythm.length

    // Callback current
    this.onBeat({
      barIndex: safeBarIndex,
      rhythmIndex: safeRhythmIndex,
      instruments,
    })

    // Schedule next
    this.nextBeatAt += getNextTimeOffset(this.tempo, currentBar)

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

    // Schedule metronome
    if (nextRhythmIndex === 0) {
      this.scheduleMetronome(nextBar)
    }

    // Resolve instruments with rotation if stickings are available
    let nextInstruments: Instrument[]
    if (nextBar.stickings && nextBar.stickings[nextRhythmIndex]) {
      nextInstruments = this.resolveStickingToInstruments(nextBar.stickings[nextRhythmIndex])
    } else {
      nextInstruments = getInstrumentsByIndex(
        nextBar,
        nextRhythmIndex,
        this.muted
      )
    }

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
