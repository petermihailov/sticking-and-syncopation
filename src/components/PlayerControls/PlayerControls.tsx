import { ShareButton } from '../ShareButton'
import classes from './PlayerControls.module.css'

interface PlayerControlsProps {
  isPlaying: boolean
  isDisabled: boolean
  currentBeat: number
  onPlay: () => void
  onStop: () => void
  hasPattern: boolean
}

export function PlayerControls({
  isPlaying,
  isDisabled,
  currentBeat,
  onPlay,
  onStop,
  hasPattern,
}: PlayerControlsProps) {
  return (
    <div className={classes.container}>
      <button
        onClick={onPlay}
        disabled={isPlaying || isDisabled}
        className={classes.button}
      >
        ▶ Play
      </button>
      <button
        onClick={onStop}
        disabled={!isPlaying}
        className={classes.button}
      >
        ⏹ Stop
      </button>
      <ShareButton />
      <div className={classes.beatCounter}>Beat: {currentBeat}</div>
      {!hasPattern && (
        <div className={classes.noPattern}>(No pattern to play)</div>
      )}
    </div>
  )
}
