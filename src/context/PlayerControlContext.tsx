import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { createPlayer } from '../lib/player'
import type { Player, PlayerState } from '../lib/player/Player'
import { createDrumKit, resumeAudioContext } from '../utils/audio'
import { stickingsToBars } from '../utils/groove'
import type { DrumKit } from '../types/kit'
import { useAppState } from './AppStateContext'
import { useNotation } from './NotationContext'

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
  const { convertResult, meter } = useNotation()
  const bars = convertResult.bars

  const playerRef = useRef<Player | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentBeat, setCurrentBeat] = useState<Beat>({
    barIndex: 0,
    rhythmIndex: 0,
  })
  const [drumKit, setDrumKit] = useState<DrumKit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [instrumentCounters, setInstrumentCounters] = useState<
    Map<string, number>
  >(new Map())

  const hasPattern = bars.length > 0 && bars[0].length > 0

  // Создаём плеер один раз, асинхронно подгружаем кит.
  // applyState ниже сам передаст кит в плеер, как только он будет готов.
  useEffect(() => {
    const player = createPlayer()
    player.setOnBeat(beat => {
      setCurrentBeat({ barIndex: beat.barIndex, rhythmIndex: beat.rhythmIndex })
      setInstrumentCounters(player.getInstrumentCounters())
    })
    playerRef.current = player

    let cancelled = false
    setIsLoading(true)
    createDrumKit(`${import.meta.env.BASE_URL}sounds/`, 'wav')
      .then(kit => {
        if (cancelled) return
        setDrumKit(kit)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Failed to load drum kit:', error)
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
      player.stop()
      playerRef.current = null
    }
  }, [])

  // Единая синхронизация состояния плеера. Player сам диффает поля.
  const playerState = useMemo<PlayerState>(() => {
    const validBars = bars.filter(bar => bar && bar.length > 0)
    return {
      bars: stickingsToBars(validBars, instrumentMapping, meter),
      tempo,
      metronomeEnabled: metronome,
      metronomeVolume,
      mapping: instrumentMapping,
      mutedGroups: [],
      kit: drumKit ?? undefined,
    }
  }, [bars, tempo, metronome, metronomeVolume, instrumentMapping, meter, drumKit])

  useEffect(() => {
    playerRef.current?.applyState(playerState)
  }, [playerState])

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
