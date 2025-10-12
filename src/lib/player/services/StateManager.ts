import type { Bar, DrumKit, Group, Beat } from '../../../types/instrument'
import type { IStateManager } from '../di/types'

/**
 * State manager service - manages player state
 */
export class StateManager implements IStateManager {
  private tempo: number = 80
  private metronomeEnabled: boolean = false
  private metronomeVolume: number = 1.0
  private bars: Bar[] = []
  private kit: DrumKit = {}
  private mutedGroups: Group[] = []
  private onBeat: (beat: Beat) => void = () => undefined

  // Tempo
  getTempo(): number {
    return this.tempo
  }

  setTempo(bpm: number): void {
    this.tempo = bpm
  }

  // Metronome
  isMetronomeEnabled(): boolean {
    return this.metronomeEnabled
  }

  enableMetronome(): void {
    this.metronomeEnabled = true
  }

  disableMetronome(): void {
    this.metronomeEnabled = false
  }

  getMetronomeVolume(): number {
    return this.metronomeVolume
  }

  setMetronomeVolume(volume: number): void {
    this.metronomeVolume = volume
  }

  // Bars
  getBars(): Bar[] {
    return this.bars
  }

  setBars(bars: Bar[]): void {
    this.bars = bars
  }

  // Kit
  getKit(): DrumKit {
    return this.kit
  }

  setKit(kit: DrumKit): void {
    this.kit = kit
  }

  // Muted groups
  getMutedGroups(): Group[] {
    return this.mutedGroups
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

  // Beat callback
  getOnBeat(): (beat: Beat) => void {
    return this.onBeat
  }

  setOnBeat(callback: (beat: Beat) => void): void {
    this.onBeat = callback
  }
}
