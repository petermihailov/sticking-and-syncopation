import classes from './AudioPlayer.module.css'
import { PlayerSection } from '../PlayerSection'
import { usePlayerControl } from '../../context/usePlayerControl'
import { useAppState } from '../../context/useAppState'

export function AudioPlayer() {
  const { state, actions } = useAppState()
  const { isPlaying, drumKit, isLoading, hasPattern, toggle } =
    usePlayerControl()

  if (isLoading) {
    return <div className={classes.loading}>Loading sounds...</div>
  }

  return (
    <PlayerSection
      isPlaying={isPlaying}
      isDisabled={!drumKit || !hasPattern}
      tempo={state.tempo}
      playbackVolume={state.playbackVolume}
      metronome={state.metronome}
      metronomeVolume={state.metronomeVolume}
      metronomeSound={state.metronomeSound}
      hasPattern={hasPattern}
      onToggle={toggle}
      onTempoChange={actions.setTempo}
      onPlaybackVolumeChange={actions.setPlaybackVolume}
      onMetronomeToggle={() => actions.setMetronome(!state.metronome)}
      onMetronomeVolumeChange={actions.setMetronomeVolume}
      onMetronomeSoundChange={actions.setMetronomeSound}
    />
  )
}
