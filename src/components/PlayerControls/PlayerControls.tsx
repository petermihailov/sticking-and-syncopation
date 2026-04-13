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
    <>
      <button
        onClick={onToggle}
        disabled={isDisabled}
        className={classes.playButton}
        aria-label={isPlaying ? 'Stop' : 'Play'}
      >
        {isPlaying ? <span className={classes.stopIcon} /> : '▶'}
      </button>
      <ShareButton className={classes.shareButton}>🔗</ShareButton>
      {!hasPattern && (
        <span className={classes.noPattern}>Нет паттерна</span>
      )}
    </>
  )
}
