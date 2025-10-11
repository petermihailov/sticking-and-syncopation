import { useEffect, useRef, useState } from 'react'
import abcjs from 'abcjs'
import classes from './ABCNotation.module.css'
import { Stickings } from '../Stickings'
import { SVGFilters } from './SVGFilters'
import { Player } from '../../lib/Player'
import { createDrumKit, resumeAudioContext } from '../../utils/audio'
import { stickingsToBars } from '../../utils/groove'
import type {
  DrumKit,
  Instrument,
  StickingMapping,
} from '../../types/instrument'
import { INSTRUMENT_GROUPS } from '../../types/instrument'
import { useAppState } from '../../context/AppStateContext'
import { ShareButton } from '../ShareButton'

interface ABCNotationProps {
  seeNotation: string
  playNotation?: string
  bars?: string[]
  width?: number
  height?: number
}

export function ABCNotation({
  seeNotation,
  playNotation,
  width = 420,
  bars,
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
  const [isOrchestrationOpen, setIsOrchestrationOpen] = useState(false)
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
        clickListener: () =>
          // abcElem,
          // tuneNumber,
          // classes,
          // analysis,
          // drag,
          // mouseEvent
          {
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

        const player = new Player()
        player.setKit(kit)
        player.setTempo(state.tempo)

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
        })

        playerRef.current = player
        setPlayerVersion(prev => prev + 1)
        console.log('[ABCNotation] Player initialized')
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
    console.log('[ABCNotation] Bars or isLoading changed:', {
      bars,
      isLoading,
      hasPlayer: !!playerRef.current,
    })

    // Wait until player is initialized (isLoading === false)
    if (isLoading || !playerRef.current) {
      console.log('[ABCNotation] Player not ready yet, skipping bars setup')
      return
    }

    if (bars && bars.length > 0) {
      console.log('[ABCNotation] Setting player bars:', bars)
      const playerBars = stickingsToBars(bars, state.instrumentMapping)
      console.log('[ABCNotation] Converted bars:', playerBars)
      playerRef.current.setBars(playerBars)
    } else {
      console.log('[ABCNotation] No bars to set')
    }
    // Use string representation to detect content changes, not just reference changes
    // playerVersion ensures bars are re-set when Player is re-initialized
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bars?.join(','), isLoading, playerVersion, state.instrumentMapping])

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

      // Toggle playback if player is ready and has bars
      if (
        !isLoading &&
        drumKit &&
        bars &&
        bars.length > 0 &&
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
  }, [isLoading, drumKit, bars, isPlaying])

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

  const handleMappingChange = (
    key: keyof StickingMapping,
    value: Instrument | boolean | undefined
  ) => {
    actions.setInstrumentMapping({
      ...state.instrumentMapping,
      [key]: value,
    })
  }

  // Render instrument select
  const renderInstrumentSelect = (
    label: string,
    value: Instrument,
    onChange: (value: Instrument) => void
  ) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {label && (
        <label style={{ fontSize: '0.85rem', minWidth: '60px' }}>
          {label}:
        </label>
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value as Instrument)}
        style={{
          fontSize: '0.85rem',
          padding: '2px 4px',
          flex: 1,
          minWidth: 0,
        }}
      >
        {Object.entries(INSTRUMENT_GROUPS).map(([groupName, instruments]) => (
          <optgroup key={groupName} label={groupName}>
            {instruments.map(inst => (
              <option key={inst} value={inst}>
                {inst.replace(/([a-z])([A-Z])/g, '$1 $2')}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  )

  // Render kick checkbox
  const renderKickCheckbox = (
    label: string,
    checked: boolean,
    onChange: (checked: boolean) => void
  ) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <label style={{ fontSize: '0.8rem', color: '#666' }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          style={{ marginRight: '0.3rem' }}
        />
        {label}
      </label>
    </div>
  )

  return (
    <div className={classes.container}>
      <SVGFilters />
      <div ref={notationRef} className={classes.notation} />
      {/*<Labels />*/}
      {bars?.length && <Stickings bars={bars} />}

      {/* Player Controls */}
      <div
        style={{
          marginTop: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {isLoading ? (
          <div>Loading sounds...</div>
        ) : (
          <>
            {/* Playback controls */}
            <div
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
            >
              <button
                onClick={handlePlay}
                disabled={isPlaying || !drumKit || !bars || bars.length === 0}
              >
                ▶ Play
              </button>
              <button onClick={handleStop} disabled={!isPlaying}>
                ⏹ Stop
              </button>
              <ShareButton />
              <div style={{ marginLeft: '1rem', fontSize: '0.9rem' }}>
                Beat: {currentBeat.rhythmIndex + 1}
              </div>
              {(!bars || bars.length === 0) && (
                <div
                  style={{
                    marginLeft: '1rem',
                    fontSize: '0.8rem',
                    color: '#999',
                  }}
                >
                  (No pattern to play)
                </div>
              )}
            </div>

            {/* Tempo control */}
            <div
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
            >
              <label
                htmlFor="tempo-slider"
                style={{ fontSize: '0.9rem', minWidth: '120px' }}
              >
                Tempo: {state.tempo} BPM
              </label>
              <input
                id="tempo-slider"
                type="range"
                min="40"
                max="200"
                value={state.tempo}
                onChange={e => handleTempoChange(Number(e.target.value))}
                style={{ flex: 1, maxWidth: '200px' }}
              />
            </div>

            {/* Metronome toggle */}
            <div
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
            >
              <label style={{ fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={state.metronome}
                  onChange={handleMetronomeToggle}
                  style={{ marginRight: '0.5rem' }}
                />
                Metronome
              </label>
            </div>

            {/* Metronome volume control */}
            <div
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
            >
              <label
                htmlFor="metronome-volume-slider"
                style={{ fontSize: '0.9rem', minWidth: '120px' }}
              >
                Metronome: {Math.round(state.metronomeVolume * 100)}%
              </label>
              <input
                id="metronome-volume-slider"
                type="range"
                min="0"
                max="100"
                value={state.metronomeVolume * 100}
                onChange={e =>
                  handleMetronomeVolumeChange(Number(e.target.value) / 100)
                }
                style={{ flex: 1, maxWidth: '200px' }}
              />
            </div>

            {/* Instrument mapping */}
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: '#f5f5f5',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            >
              <div
                onClick={() => setIsOrchestrationOpen(!isOrchestrationOpen)}
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  marginBottom: isOrchestrationOpen ? '0.75rem' : '0',
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>{isOrchestrationOpen ? '▼' : '▶'}</span>
                <span>Orchestration</span>
              </div>

              {isOrchestrationOpen && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                  }}
                >
                {/* L (left hand accent) */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                    padding: '0.5rem',
                    background: '#fff',
                    borderRadius: '3px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      color: '#555',
                      marginBottom: '0.2rem',
                    }}
                  >
                    L (accent)
                  </div>
                  {renderInstrumentSelect(
                    '',
                    state.instrumentMapping.uppercaseL,
                    v => handleMappingChange('uppercaseL', v)
                  )}
                  {renderKickCheckbox(
                    '+ Kick',
                    state.instrumentMapping.uppercaseLKick,
                    v => handleMappingChange('uppercaseLKick', v)
                  )}
                </div>

                {/* R (right hand accent) */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                    padding: '0.5rem',
                    background: '#fff',
                    borderRadius: '3px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      color: '#555',
                      marginBottom: '0.2rem',
                    }}
                  >
                    R (accent)
                  </div>
                  {renderInstrumentSelect(
                    '',
                    state.instrumentMapping.uppercaseR,
                    v => handleMappingChange('uppercaseR', v)
                  )}
                  {renderKickCheckbox(
                    '+ Kick',
                    state.instrumentMapping.uppercaseRKick,
                    v => handleMappingChange('uppercaseRKick', v)
                  )}
                </div>

                {/* l (left hand ghost) */}
                <div
                  style={{
                    padding: '0.5rem',
                    background: '#fff',
                    borderRadius: '3px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      color: '#555',
                      marginBottom: '0.3rem',
                    }}
                  >
                    l (ghost)
                  </div>
                  {renderInstrumentSelect(
                    '',
                    state.instrumentMapping.lowercaseL,
                    v => handleMappingChange('lowercaseL', v)
                  )}
                </div>

                {/* r (right hand ghost) */}
                <div
                  style={{
                    padding: '0.5rem',
                    background: '#fff',
                    borderRadius: '3px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      color: '#555',
                      marginBottom: '0.3rem',
                    }}
                  >
                    r (ghost)
                  </div>
                  {renderInstrumentSelect(
                    '',
                    state.instrumentMapping.lowercaseR,
                    v => handleMappingChange('lowercaseR', v)
                  )}
                </div>

                {/* k (kick) */}
                <div
                  style={{
                    padding: '0.5rem',
                    background: '#fff',
                    borderRadius: '3px',
                    gridColumn: 'span 2',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      color: '#555',
                      marginBottom: '0.3rem',
                    }}
                  >
                    k (kick)
                  </div>
                  {renderInstrumentSelect('', state.instrumentMapping.kick, v =>
                    handleMappingChange('kick', v)
                  )}
                </div>
              </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
