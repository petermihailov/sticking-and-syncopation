import classes from './MetronomeControls.module.css'

interface MetronomeControlsProps {
  enabled: boolean
  volume: number
  onToggle: () => void
  onVolumeChange: (volume: number) => void
}

export function MetronomeControls({
  enabled,
  volume,
  onToggle,
  onVolumeChange,
}: MetronomeControlsProps) {
  return (
    <div className={classes.container}>
      {/* Metronome toggle */}
      <div className={classes.toggleContainer}>
        <label className={classes.toggleLabel}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={onToggle}
            className={classes.checkbox}
          />
          Metronome
        </label>
      </div>

      {/* Metronome volume */}
      <div className={classes.volumeContainer}>
        <label
          htmlFor="metronome-volume-slider"
          className={classes.volumeLabel}
        >
          Metronome: {Math.round(volume * 100)}%
        </label>
        <input
          id="metronome-volume-slider"
          type="range"
          min="0"
          max="100"
          value={volume * 100}
          onChange={e => onVolumeChange(Number(e.target.value) / 100)}
          className={classes.slider}
        />
      </div>
    </div>
  )
}
