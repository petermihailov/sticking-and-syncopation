import { useEffect } from 'react'
import classes from './AudioPlayer.module.css'
import type { StickingMapping } from '../../types/instrument'
import type { Sticking } from '../../types'
import { PlayerSection } from '../PlayerSection'
import { usePlayerControl } from '../../context/PlayerControlContext'
import { usePlayer } from '../../hooks/usePlayer'

interface AudioPlayerProps {
  bars: Sticking[][]
  instrumentMapping: StickingMapping
  tempo: number
  metronome: boolean
  metronomeVolume: number
  onBeatChange?: (beat: { barIndex: number; rhythmIndex: number }) => void
  onInstrumentCountersChange?: (counters: Map<string, number>) => void
  onTempoChange: (tempo: number) => void
  onMetronomeToggle: () => void
  onMetronomeVolumeChange: (volume: number) => void
}

export function AudioPlayer({
  bars,
  instrumentMapping,
  tempo,
  metronome,
  metronomeVolume,
  onBeatChange,
  onInstrumentCountersChange,
  onTempoChange,
  onMetronomeToggle,
  onMetronomeVolumeChange,
}: AudioPlayerProps) {
  const { isPlaying, currentBeat } = usePlayerControl()

  const { isLoading, drumKit, instrumentCounters, hasPattern, toggle } =
    usePlayer({
      bars,
      instrumentMapping,
      tempo,
      metronome,
      metronomeVolume,
      onBeatChange,
    })

  // Прокидываем счётчики в родителя
  useEffect(() => {
    onInstrumentCountersChange?.(instrumentCounters)
  }, [instrumentCounters, onInstrumentCountersChange])

  if (isLoading) {
    return <div className={classes.loading}>Loading sounds...</div>
  }

  return (
    <PlayerSection
      isPlaying={isPlaying}
      isDisabled={!drumKit || !hasPattern}
      currentBeat={currentBeat.rhythmIndex + 1}
      tempo={tempo}
      metronome={metronome}
      metronomeVolume={metronomeVolume}
      hasPattern={hasPattern}
      onToggle={toggle}
      onTempoChange={onTempoChange}
      onMetronomeToggle={onMetronomeToggle}
      onMetronomeVolumeChange={onMetronomeVolumeChange}
    />
  )
}
