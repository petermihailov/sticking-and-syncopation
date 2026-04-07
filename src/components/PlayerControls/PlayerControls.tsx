import { ShareButton } from '../ShareButton'
import classes from './PlayerControls.module.css'

interface PlayerControlsProps {
  isPlaying: boolean
  isDisabled: boolean
  onToggle: () => void
  hasPattern: boolean
}

export function PlayerControls({
  isPlaying,
  isDisabled,
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
      <ShareButton />
      {!hasPattern && (
        <div className={classes.noPattern}>(No pattern to play)</div>
      )}
    </div>
  )
}
