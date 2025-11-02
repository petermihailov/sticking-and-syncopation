import { useEffect, useRef, useState } from 'react'
import classes from './AudioPlayer.module.css'
import { createPlayer, type Player } from '../../lib/player'
import { createDrumKit, resumeAudioContext } from '../../utils/audio'
import { stickingsToBars } from '../../utils/groove'
import type { DrumKit, StickingMapping } from '../../types/instrument'
import type { Sticking } from '../../types'
import { PlayerControls } from '../PlayerControls/PlayerControls'
import { TempoControl } from '../TempoControl/TempoControl'
import { MetronomeControls } from '../MetronomeControls/MetronomeControls'
import { OrchestrationPanel } from '../OrchestrationPanel/OrchestrationPanel'

interface AudioPlayerProps {
  bars: Sticking[][]
  instrumentMapping: StickingMapping
  tempo: number
  metronome: boolean
  metronomeVolume: number
  onBeatChange?: (beat: { barIndex: number; rhythmIndex: number }) => void
  onTempoChange: (tempo: number) => void
  onMetronomeToggle: () => void
  onMetronomeVolumeChange: (volume: number) => void
  onMappingChange: (key: keyof StickingMapping, value: unknown) => void
  onOrchestrationReset: () => void
}

export function AudioPlayer({
  bars,
  instrumentMapping,
  tempo,
  metronome,
  metronomeVolume,
  onBeatChange,
  onTempoChange,
  onMetronomeToggle,
  onMetronomeVolumeChange,
  onMappingChange,
  onOrchestrationReset,
}: AudioPlayerProps) {
  const playerRef = useRef<Player | null>(null)
  const [drumKit, setDrumKit] = useState<DrumKit | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentBeat, setCurrentBeat] = useState({
    barIndex: 0,
    rhythmIndex: 0,
  })
  const [playerVersion, setPlayerVersion] = useState(0)
  const [instrumentCounters, setInstrumentCounters] = useState<
    Map<string, number>
  >(new Map())

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

        playerRef.current = player
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
      if (playerRef.current && isPlaying) {
        playerRef.current.stop()
      }
    }
  }, [])

  // Update player bars when bars change OR when player is ready
  useEffect(() => {
    if (isLoading || !playerRef.current) {
      return
    }

    if (bars.length > 0 && bars[0].length > 0) {
      const validBars = bars.filter(bar => bar && bar.length > 0)
      const playerBars = stickingsToBars(validBars, instrumentMapping)
      playerRef.current.setBars(playerBars)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bars.map(b => b.join(',')).join('|'), isLoading, playerVersion, instrumentMapping])

  // Sync metronome state with Player
  useEffect(() => {
    if (!playerRef.current) return

    if (metronome) {
      playerRef.current.playMetronome()
    } else {
      playerRef.current.stopMetronome()
    }
  }, [metronome])

  // Sync metronome volume with Player
  useEffect(() => {
    if (!playerRef.current) return
    playerRef.current.setMetronomeVolume(metronomeVolume)
  }, [metronomeVolume])

  // Sync instrument mapping with Player
  useEffect(() => {
    if (!playerRef.current) return
    playerRef.current.setInstrumentMapping(instrumentMapping)
  }, [instrumentMapping])

  // Sync tempo with Player
  useEffect(() => {
    if (!playerRef.current) return
    playerRef.current.setTempo(tempo)
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
        playerRef.current
      ) {
        if (isPlaying) {
          playerRef.current.stop()
          setIsPlaying(false)
          setCurrentBeat({ barIndex: 0, rhythmIndex: 0 })
          onBeatChange?.({ barIndex: 0, rhythmIndex: 0 })
        } else {
          resumeAudioContext()
          playerRef.current.play()
          setIsPlaying(true)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isLoading, drumKit, bars, isPlaying, onBeatChange])

  const handlePlay = () => {
    if (playerRef.current && !isPlaying) {
      resumeAudioContext()
      playerRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleStop = () => {
    if (playerRef.current && isPlaying) {
      playerRef.current.stop()
      setIsPlaying(false)
      setCurrentBeat({ barIndex: 0, rhythmIndex: 0 })
      setInstrumentCounters(new Map())
      onBeatChange?.({ barIndex: 0, rhythmIndex: 0 })
    }
  }

  if (isLoading) {
    return <div className={classes.loading}>Loading sounds...</div>
  }

  return (
    <div className={classes.controls}>
      <PlayerControls
        isPlaying={isPlaying}
        isDisabled={!drumKit || bars.length === 0 || bars[0].length === 0}
        currentBeat={currentBeat.rhythmIndex + 1}
        onPlay={handlePlay}
        onStop={handleStop}
        hasPattern={bars.length > 0 && bars[0].length > 0}
      />

      <TempoControl tempo={tempo} onChange={onTempoChange} />

      <MetronomeControls
        enabled={metronome}
        volume={metronomeVolume}
        onToggle={onMetronomeToggle}
        onVolumeChange={onMetronomeVolumeChange}
      />

      <OrchestrationPanel
        mapping={instrumentMapping}
        onChange={onMappingChange}
        onReset={onOrchestrationReset}
        instrumentCounters={instrumentCounters}
      />
    </div>
  )
}
