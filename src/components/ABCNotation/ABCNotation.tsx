import { useEffect, useRef, useState } from 'react'
import abcjs from 'abcjs'
import classes from './ABCNotation.module.css'
import { Stickings } from '../Stickings'
import { SVGFilters } from './SVGFilters'
import { createPlayer, type Player } from '../../lib/player'
import { createDrumKit, resumeAudioContext } from '../../utils/audio'
import { stickingsToBars } from '../../utils/groove'
import type { DrumKit, StickingMapping } from '../../types/instrument'
import { DEFAULT_STICKING_MAPPING } from '../../types/instrument'
import type { Sticking } from '../../types'
import { useAppState } from '../../context/AppStateContext'
import { PlayerControls } from '../PlayerControls/PlayerControls'
import { TempoControl } from '../TempoControl/TempoControl'
import { MetronomeControls } from '../MetronomeControls/MetronomeControls'
import { OrchestrationPanel } from '../OrchestrationPanel/OrchestrationPanel'

interface ABCNotationProps {
  seeNotation: string
  playNotation?: string
  stickings?: Sticking[]
  isMirrored?: boolean
  width?: number
  height?: number
}

export function ABCNotation({
  seeNotation,
  playNotation,
  width = 420,
  stickings,
  isMirrored = false,
}: ABCNotationProps) {
  const notationRef = useRef<HTMLDivElement>(null)
  const [, setSelectedNotes] = useState<Set<string>>(new Set())
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
  const { state, actions } = useAppState()

  useEffect(() => {
    if (notationRef.current && seeNotation) {
      // Очищаем предыдущий контент
      notationRef.current.innerHTML = ''

      // Создаем объединенную нотацию
      let combinedNotation = seeNotation

      // Если есть playNotation, добавляем как второй такт
      if (playNotation) {
        // Извлекаем только ноты из playNotation (убираем заголовки)
        const playNotationLines = playNotation.split('\n')
        const playNotesLines = playNotationLines.filter(
          line =>
            line.startsWith('V:') || line.startsWith('|:') || line.includes('|')
        )

        // Добавляем к seeNotation
        combinedNotation = seeNotation + '\n' + playNotesLines.join('\n')
      }

      // Рендерим ABC нотацию
      abcjs.renderAbc(notationRef.current, combinedNotation, {
        responsive: 'resize',
        // viewportHorizontal: true,
        staffwidth: width,
        oneSvgPerLine: true,
        add_classes: true,
        initialClef: false,
        accentAbove: true,
        paddingtop: 0,
        format: {
          gchordfont: 'Arial 10',
          stretchlast: true,
        },
        clickListener: () => {
          console.log('Clicked note')
        },
      })
    }
  }, [seeNotation, playNotation, width])

  // Сбрасываем выделение при смене нотации
  useEffect(() => {
    setSelectedNotes(new Set())
  }, [seeNotation, playNotation])

  // Initialize Player and load DrumKit
  useEffect(() => {
    const initPlayer = async () => {
      try {
        setIsLoading(true)
        // Use WAV files (they work in both dev and production)
        const kit = await createDrumKit(
          '/sticking-and-syncopation/sounds/',
          'wav'
        )
        setDrumKit(kit)

        const player = createPlayer()
        player.setKit(kit)
        player.setTempo(state.tempo)
        player.setInstrumentMapping(state.instrumentMapping)

        // Set metronome initial state
        if (state.metronome) {
          player.playMetronome()
        }
        player.setMetronomeVolume(state.metronomeVolume)

        player.setOnBeat(beat => {
          setCurrentBeat({
            barIndex: beat.barIndex,
            rhythmIndex: beat.rhythmIndex,
          })
          // Update instrument counters for rotation visualization
          setInstrumentCounters(player.getInstrumentCounters())
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

  // Update player bars when stickings change OR when player is ready
  useEffect(() => {
    // Wait until player is initialized (isLoading === false)
    if (isLoading || !playerRef.current) {
      return
    }

    if (stickings && stickings.length > 0) {
      const playerBars = stickingsToBars([stickings], state.instrumentMapping)
      playerRef.current.setBars(playerBars)
    } else {
      //
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stickings?.join(','), isLoading, playerVersion, state.instrumentMapping])

  // Sync metronome state with Player
  useEffect(() => {
    if (!playerRef.current) return

    if (state.metronome) {
      playerRef.current.playMetronome()
    } else {
      playerRef.current.stopMetronome()
    }
  }, [state.metronome])

  // Sync metronome volume with Player
  useEffect(() => {
    if (!playerRef.current) return
    playerRef.current.setMetronomeVolume(state.metronomeVolume)
  }, [state.metronomeVolume])

  // Sync instrument mapping with Player
  useEffect(() => {
    if (!playerRef.current) return
    playerRef.current.setInstrumentMapping(state.instrumentMapping)
  }, [state.instrumentMapping])

  // Keyboard shortcut: Space for play/pause (with a11y considerations)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle spacebar
      if (event.key !== ' ') {
        return
      }

      // Don't handle if focus is on an interactive element (a11y)
      const activeElement = document.activeElement
      const interactiveTags = ['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'A']

      if (activeElement && interactiveTags.includes(activeElement.tagName)) {
        return
      }

      // Prevent page scroll when space is used for playback control
      event.preventDefault()

      // Toggle playback if player is ready and has stickings
      if (
        !isLoading &&
        drumKit &&
        stickings &&
        stickings.length > 0 &&
        playerRef.current
      ) {
        if (isPlaying) {
          playerRef.current.stop()
          setIsPlaying(false)
          setCurrentBeat({ barIndex: 0, rhythmIndex: 0 })
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
  }, [isLoading, drumKit, stickings, isPlaying])

  const handlePlay = () => {
    if (playerRef.current && !isPlaying) {
      resumeAudioContext() // Handle browser autoplay policy
      playerRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleStop = () => {
    if (playerRef.current && isPlaying) {
      playerRef.current.stop()
      setIsPlaying(false)
      setCurrentBeat({ barIndex: 0, rhythmIndex: 0 })
      setInstrumentCounters(new Map()) // Reset counters on stop
    }
  }

  const handleTempoChange = (newTempo: number) => {
    actions.setTempo(newTempo)
    if (playerRef.current) {
      playerRef.current.setTempo(newTempo)
    }
  }

  const handleMetronomeToggle = () => {
    const newState = !state.metronome
    actions.setMetronome(newState)
    if (playerRef.current) {
      if (newState) {
        playerRef.current.playMetronome()
      } else {
        playerRef.current.stopMetronome()
      }
    }
  }

  const handleMetronomeVolumeChange = (newVolume: number) => {
    actions.setMetronomeVolume(newVolume)
    if (playerRef.current) {
      playerRef.current.setMetronomeVolume(newVolume)
    }
  }

  const handleMappingChange = (key: keyof StickingMapping, value: unknown) => {
    actions.setInstrumentMapping({
      ...state.instrumentMapping,
      [key]: value,
    })
  }

  const handleOrchestrationReset = () => {
    actions.setInstrumentMapping(DEFAULT_STICKING_MAPPING)
  }

  return (
    <div className={classes.container}>
      <SVGFilters />
      <div ref={notationRef} className={classes.notation} />
      {/*<Labels />*/}
      {stickings?.length && (
        <Stickings stickings={stickings} isMirrored={isMirrored} />
      )}

      {/* Player Controls */}
      {isLoading ? (
        <div className={classes.loading}>Loading sounds...</div>
      ) : (
        <div className={classes.controls}>
          <PlayerControls
            isPlaying={isPlaying}
            isDisabled={!drumKit || !stickings || stickings.length === 0}
            currentBeat={currentBeat.rhythmIndex + 1}
            onPlay={handlePlay}
            onStop={handleStop}
            hasPattern={!!(stickings && stickings.length > 0)}
          />

          <TempoControl tempo={state.tempo} onChange={handleTempoChange} />

          <MetronomeControls
            enabled={state.metronome}
            volume={state.metronomeVolume}
            onToggle={handleMetronomeToggle}
            onVolumeChange={handleMetronomeVolumeChange}
          />

          <OrchestrationPanel
            mapping={state.instrumentMapping}
            onChange={handleMappingChange}
            onReset={handleOrchestrationReset}
            instrumentCounters={instrumentCounters}
          />
        </div>
      )}
    </div>
  )
}
