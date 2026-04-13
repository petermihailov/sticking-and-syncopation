import type { ClickSound } from '../../types/appState'
import { PlayerControls } from '../PlayerControls/PlayerControls'
import { TempoControl } from '../TempoControl/TempoControl'
import { MetronomeControls } from '../MetronomeControls/MetronomeControls'
import classes from './PlayerSection.module.css'

interface PlayerSectionProps {
  isPlaying: boolean
  isDisabled: boolean
  tempo: number
  playbackVolume: number
  metronome: boolean
  metronomeVolume: number
  metronomeSound: ClickSound
  hasPattern: boolean
  onToggle: () => void
  onTempoChange: (tempo: number) => void
  onPlaybackVolumeChange: (volume: number) => void
  onMetronomeToggle: () => void
  onMetronomeVolumeChange: (volume: number) => void
  onMetronomeSoundChange: (sound: ClickSound) => void
}

export function PlayerSection({
  isPlaying,
  isDisabled,
  tempo,
  playbackVolume,
  metronome,
  metronomeVolume,
  metronomeSound,
  hasPattern,
  onToggle,
  onTempoChange,
  onPlaybackVolumeChange,
  onMetronomeToggle,
  onMetronomeVolumeChange,
  onMetronomeSoundChange,
}: PlayerSectionProps) {
  return (
    <div className={classes.container}>
      {/* Левая часть: управление */}
      <div className={classes.controls}>
        <div className={classes.playbackRow}>
          <PlayerControls
            isPlaying={isPlaying}
            isDisabled={isDisabled}
            onToggle={onToggle}
            hasPattern={hasPattern}
          />
          <TempoControl tempo={tempo} onChange={onTempoChange} />
        </div>

        <MetronomeControls
          enabled={metronome}
          sound={metronomeSound}
          onToggle={onMetronomeToggle}
          onSoundChange={onMetronomeSoundChange}
        />
      </div>

      {/* Правая часть: вертикальные фейдеры */}
      <div className={classes.faders}>
        <div className={classes.fader}>
          <input
            id="playback-volume-slider"
            type="range"
            min="0"
            max="100"
            value={playbackVolume * 100}
            onChange={e => onPlaybackVolumeChange(Number(e.target.value) / 100)}
            className={`${classes.verticalSlider} customSlider`}
            // @ts-expect-error — orient нужен для Firefox vertical range
            orient="vertical"
          />
          <span className={classes.faderLabel}>Main</span>
        </div>

        {metronome && (
          <div className={classes.fader}>
            <input
              id="metronome-volume-slider"
              type="range"
              min="0"
              max="100"
              value={metronomeVolume * 100}
              onChange={e => onMetronomeVolumeChange(Number(e.target.value) / 100)}
              className={`${classes.verticalSlider} customSlider`}
              // @ts-expect-error — orient нужен для Firefox vertical range
            orient="vertical"
            />
            <span className={classes.faderLabel}>Click</span>
          </div>
        )}
      </div>
    </div>
  )
}
