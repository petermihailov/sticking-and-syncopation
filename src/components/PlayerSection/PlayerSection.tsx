import { PlayerControls } from '../PlayerControls/PlayerControls'
import { TempoControl } from '../TempoControl/TempoControl'
import { MetronomeControls } from '../MetronomeControls/MetronomeControls'
import classes from './PlayerSection.module.css'

interface PlayerSectionProps {
  isPlaying: boolean
  isDisabled: boolean
  currentBeat: number
  tempo: number
  metronome: boolean
  metronomeVolume: number
  hasPattern: boolean
  onPlay: () => void
  onStop: () => void
  onTempoChange: (tempo: number) => void
  onMetronomeToggle: () => void
  onMetronomeVolumeChange: (volume: number) => void
}

export function PlayerSection({
  isPlaying,
  isDisabled,
  currentBeat,
  tempo,
  metronome,
  metronomeVolume,
  hasPattern,
  onPlay,
  onStop,
  onTempoChange,
  onMetronomeToggle,
  onMetronomeVolumeChange,
}: PlayerSectionProps) {
  return (
    <div className={classes.container}>
      <PlayerControls
        isPlaying={isPlaying}
        isDisabled={isDisabled}
        currentBeat={currentBeat}
        onPlay={onPlay}
        onStop={onStop}
        hasPattern={hasPattern}
      />

      <TempoControl tempo={tempo} onChange={onTempoChange} />

      <MetronomeControls
        enabled={metronome}
        volume={metronomeVolume}
        onToggle={onMetronomeToggle}
        onVolumeChange={onMetronomeVolumeChange}
      />
    </div>
  )
}
