import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { createPlayer } from '../lib/player'
import type { Player } from '../lib/player/Player'
import { createDrumKit, resumeAudioContext } from '../utils/audio'
import { stickingsToBars } from '../utils/groove'
import type { DrumKit } from '../types/instrument'
import { useAppState } from './AppStateContext'
import { useRudimentNotation } from '../hooks/useRudimentNotation'

interface Beat {
  barIndex: number
  rhythmIndex: number
}

interface PlayerControlContextValue {
  isPlaying: boolean
  currentBeat: Beat
  instrumentCounters: Map<string, number>
  drumKit: DrumKit | null
  isLoading: boolean
  hasPattern: boolean
  toggle: () => void
}

const PlayerControlContext = createContext<PlayerControlContextValue | null>(
  null
)

export function usePlayerControl() {
  const context = useContext(PlayerControlContext)
  if (!context) {
    throw new Error('usePlayerControl must be used within PlayerControlProvider')
  }
  return context
}

interface PlayerControlProviderProps {
  children: ReactNode
}

export function PlayerControlProvider({ children }: PlayerControlProviderProps) {
  const { state } = useAppState()
  const { tempo, metronome, metronomeVolume, instrumentMapping } = state
  const { convertResult } = useRudimentNotation(state.rudiment, state.accents)
  const bars = convertResult.bars

  const playerRef = useRef<Player | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentBeat, setCurrentBeat] = useState<Beat>({
    barIndex: 0,
    rhythmIndex: 0,
  })
  const [drumKit, setDrumKit] = useState<DrumKit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const [instrumentCounters, setInstrumentCounters] = useState<
    Map<string, number>
  >(new Map())

  const hasPattern = bars.length > 0 && bars[0].length > 0

  // Инициализация плеера и загрузка кита (один раз)
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        setIsLoading(true)
        const kit = await createDrumKit(
          '/sticking-and-syncopation/sounds/',
          'wav'
        )
        if (cancelled) return

        setDrumKit(kit)

        const player = createPlayer()
        player.setKit(kit)
        player.setTempo(tempo)
        player.setInstrumentMapping(instrumentMapping)
        if (metronome) player.playMetronome()
        player.setMetronomeVolume(metronomeVolume)

        player.setOnBeat(beat => {
          setCurrentBeat({
            barIndex: beat.barIndex,
            rhythmIndex: beat.rhythmIndex,
          })
          setInstrumentCounters(player.getInstrumentCounters())
        })

        playerRef.current = player
        setIsReady(true)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to initialize player:', error)
        if (!cancelled) setIsLoading(false)
      }
    }

    init()

    return () => {
      cancelled = true
      if (playerRef.current && isPlaying) {
        playerRef.current.stop()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Синхронизация bars
  useEffect(() => {
    if (!isReady || !playerRef.current || !hasPattern) return
    const validBars = bars.filter(bar => bar && bar.length > 0)
    const playerBars = stickingsToBars(validBars, instrumentMapping)
    playerRef.current.setBars(playerBars)
  }, [bars, instrumentMapping, isReady, hasPattern])

  // Темп
  useEffect(() => {
    if (!isReady || !playerRef.current) return
    playerRef.current.setTempo(tempo)
  }, [tempo, isReady])

  // Метроном on/off
  useEffect(() => {
    if (!isReady || !playerRef.current) return
    if (metronome) {
      playerRef.current.playMetronome()
    } else {
      playerRef.current.stopMetronome()
    }
  }, [metronome, isReady])

  // Громкость метронома
  useEffect(() => {
    if (!isReady || !playerRef.current) return
    playerRef.current.setMetronomeVolume(metronomeVolume)
  }, [metronomeVolume, isReady])

  // Маппинг инструментов
  useEffect(() => {
    if (!isReady || !playerRef.current) return
    playerRef.current.setInstrumentMapping(instrumentMapping)
  }, [instrumentMapping, isReady])

  const play = useCallback(() => {
    if (playerRef.current && !isPlaying) {
      resumeAudioContext()
      playerRef.current.play()
      setIsPlaying(true)
    }
  }, [isPlaying])

  const stop = useCallback(() => {
    if (playerRef.current && isPlaying) {
      playerRef.current.stop()
      setIsPlaying(false)
      setCurrentBeat({ barIndex: 0, rhythmIndex: 0 })
      setInstrumentCounters(new Map())
    }
  }, [isPlaying])

  const toggle = useCallback(() => {
    if (!playerRef.current || !drumKit || !hasPattern) return
    if (isPlaying) {
      stop()
    } else {
      play()
    }
  }, [drumKit, hasPattern, isPlaying, play, stop])

  // Space для play/pause
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== ' ') return

      const activeElement = document.activeElement
      const interactiveTags = ['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'A']
      if (activeElement && interactiveTags.includes(activeElement.tagName)) {
        return
      }

      event.preventDefault()
      toggle()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggle])

  const value: PlayerControlContextValue = {
    isPlaying,
    currentBeat,
    instrumentCounters,
    drumKit,
    isLoading,
    hasPattern,
    toggle,
  }

  return (
    <PlayerControlContext.Provider value={value}>
      {children}
    </PlayerControlContext.Provider>
  )
}
