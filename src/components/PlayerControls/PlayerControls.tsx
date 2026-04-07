import { ShareButton } from '../ShareButton'
import { SaveExerciseButton } from '../SaveExerciseButton'
import classes from './PlayerControls.module.css'

interface PlayerControlsProps {
  isPlaying: boolean
  isDisabled: boolean
  currentBeat: number
  onToggle: () => void
  hasPattern: boolean
}

export function PlayerControls({
  isPlaying,
  isDisabled,
  currentBeat,
  onToggle,
  hasPattern,
}: PlayerControlsProps) {
  return (
    <div className={classes.container}>
      <button
        onClick={onToggle}
        disabled={isDisabled}
        className={classes.button}
      >
        {isPlaying ? '⏹ Stop' : '▶ Play'}
      </button>
      <SaveExerciseButton />
      <ShareButton />
      <div className={classes.beatCounter}>Beat: {currentBeat}</div>
      {!hasPattern && (
        <div className={classes.noPattern}>(No pattern to play)</div>
      )}
    </div>
  )
}
