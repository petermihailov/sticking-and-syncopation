import classes from './AudioPlayer.module.css'
import { PlayerSection } from '../PlayerSection'
import { usePlayerControl } from '../../context/PlayerControlContext'
import { useAppState } from '../../context/AppStateContext'

export function AudioPlayer() {
  const { state, actions } = useAppState()
  const {
    isPlaying,
    currentBeat,
    drumKit,
    isLoading,
    hasPattern,
    toggle,
  } = usePlayerControl()

  if (isLoading) {
    return <div className={classes.loading}>Loading sounds...</div>
  }

  return (
    <PlayerSection
      isPlaying={isPlaying}
      isDisabled={!drumKit || !hasPattern}
      currentBeat={currentBeat.rhythmIndex + 1}
      tempo={state.tempo}
      metronome={state.metronome}
      metronomeVolume={state.metronomeVolume}
      hasPattern={hasPattern}
      onToggle={toggle}
      onTempoChange={actions.setTempo}
      onMetronomeToggle={() => actions.setMetronome(!state.metronome)}
      onMetronomeVolumeChange={actions.setMetronomeVolume}
    />
  )
}
