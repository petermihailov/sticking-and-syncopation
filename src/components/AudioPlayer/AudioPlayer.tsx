import { useEffect, useState } from 'react'
import classes from './AudioPlayer.module.css'
import { createPlayer } from '../../lib/player'
import { createDrumKit, resumeAudioContext } from '../../utils/audio'
import { stickingsToBars } from '../../utils/groove'
import type { DrumKit, StickingMapping } from '../../types/instrument'
import type { Sticking } from '../../types'
import { PlayerSection } from '../PlayerSection'
import { usePlayerControl } from '../../context/PlayerControlContext'

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
  const {
    playerRef: sharedPlayerRef,
    isPlaying,
    setIsPlaying,
    currentBeat,
    setCurrentBeat,
    stop: stopPlayer,
  } = usePlayerControl()

  const [drumKit, setDrumKit] = useState<DrumKit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [playerVersion, setPlayerVersion] = useState(0)
  const [instrumentCounters, setInstrumentCounters] = useState<
    Map<string, number>
  >(new Map())

  // Notify parent about instrument counters changes
  useEffect(() => {
    onInstrumentCountersChange?.(instrumentCounters)
  }, [instrumentCounters, onInstrumentCountersChange])

  // Initialize Player and load DrumKit
  useEffect(() => {
    const initPlayer = async () => {
      try {
        setIsLoading(true)
        const kit = await createDrumKit(
          '/sticking-and-syncopation/sounds/',
          'wav'
        )
        setDrumKit(kit)

        const player = createPlayer()
        player.setKit(kit)
        player.setTempo(tempo)
        player.setInstrumentMapping(instrumentMapping)

        // Set metronome initial state
        if (metronome) {
          player.playMetronome()
        }
        player.setMetronomeVolume(metronomeVolume)

        player.setOnBeat(beat => {
          setCurrentBeat({
            barIndex: beat.barIndex,
            rhythmIndex: beat.rhythmIndex,
          })
          // Update instrument counters for rotation visualization
          setInstrumentCounters(player.getInstrumentCounters())
          // Notify parent component
          onBeatChange?.({
            barIndex: beat.barIndex,
            rhythmIndex: beat.rhythmIndex,
          })
        })

        sharedPlayerRef.current = player
        setPlayerVersion(prev => prev + 1)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to initialize player:', error)
        setIsLoading(false)
      }
    }

    initPlayer()

    // Cleanup
    return () => {
      if (sharedPlayerRef.current && isPlaying) {
        sharedPlayerRef.current.stop()
      }
    }
  }, [])

  // Update player bars when bars change OR when player is ready
  useEffect(() => {
    if (isLoading || !sharedPlayerRef.current) {
      return
    }

    if (bars.length > 0 && bars[0].length > 0) {
      const validBars = bars.filter(bar => bar && bar.length > 0)
      const playerBars = stickingsToBars(validBars, instrumentMapping)
      sharedPlayerRef.current.setBars(playerBars)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bars.map(b => b.join(',')).join('|'),
    isLoading,
    playerVersion,
    instrumentMapping,
  ])

  // Sync metronome state with Player
  useEffect(() => {
    if (!sharedPlayerRef.current) return

    if (metronome) {
      sharedPlayerRef.current.playMetronome()
    } else {
      sharedPlayerRef.current.stopMetronome()
    }
  }, [metronome])

  // Sync metronome volume with Player
  useEffect(() => {
    if (!sharedPlayerRef.current) return
    sharedPlayerRef.current.setMetronomeVolume(metronomeVolume)
  }, [metronomeVolume])

  // Sync instrument mapping with Player
  useEffect(() => {
    if (!sharedPlayerRef.current) return
    sharedPlayerRef.current.setInstrumentMapping(instrumentMapping)
  }, [instrumentMapping])

  // Sync tempo with Player
  useEffect(() => {
    if (!sharedPlayerRef.current) return
    sharedPlayerRef.current.setTempo(tempo)
  }, [tempo])

  // Keyboard shortcut: Space for play/pause
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== ' ') {
        return
      }

      // Don't handle if focus is on an interactive element
      const activeElement = document.activeElement
      const interactiveTags = ['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'A']

      if (activeElement && interactiveTags.includes(activeElement.tagName)) {
        return
      }

      // Prevent page scroll
      event.preventDefault()

      // Toggle playback
      if (
        !isLoading &&
        drumKit &&
        bars.length > 0 &&
        bars[0].length > 0 &&
        sharedPlayerRef.current
      ) {
        if (isPlaying) {
          stopPlayer()
          setInstrumentCounters(new Map())
          onBeatChange?.({ barIndex: 0, rhythmIndex: 0 })
        } else {
          resumeAudioContext()
          sharedPlayerRef.current.play()
          setIsPlaying(true)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isLoading, drumKit, bars, isPlaying, onBeatChange, stopPlayer])

  const handleToggle = () => {
    if (isPlaying) {
      // Stop - use context method to trigger callbacks
      stopPlayer()
      setInstrumentCounters(new Map())
      onBeatChange?.({ barIndex: 0, rhythmIndex: 0 })
    } else {
      // Play
      if (sharedPlayerRef.current) {
        resumeAudioContext()
        sharedPlayerRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  if (isLoading) {
    return <div className={classes.loading}>Loading sounds...</div>
  }

  return (
    <PlayerSection
      isPlaying={isPlaying}
      isDisabled={!drumKit || bars.length === 0 || bars[0].length === 0}
      currentBeat={currentBeat.rhythmIndex + 1}
      tempo={tempo}
      metronome={metronome}
      metronomeVolume={metronomeVolume}
      hasPattern={bars.length > 0 && bars[0].length > 0}
      onToggle={handleToggle}
      onTempoChange={onTempoChange}
      onMetronomeToggle={onMetronomeToggle}
      onMetronomeVolumeChange={onMetronomeVolumeChange}
    />
  )
}
