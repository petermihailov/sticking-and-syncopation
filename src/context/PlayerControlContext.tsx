import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from 'react'
import type { Player } from '../lib/player/Player'

interface Beat {
  barIndex: number
  rhythmIndex: number
}

interface PlayerControlContextValue {
  playerRef: React.MutableRefObject<Player | null>
  isPlaying: boolean
  currentBeat: Beat
  setIsPlaying: (playing: boolean) => void
  setCurrentBeat: (beat: Beat) => void
  play: () => void
  stop: () => void
  registerStopCallback: (callback: () => void) => void
  unregisterStopCallback: (callback: () => void) => void
}

const PlayerControlContext = createContext<PlayerControlContextValue | null>(null)

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
  const playerRef = useRef<Player | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentBeat, setCurrentBeat] = useState<Beat>({ barIndex: 0, rhythmIndex: 0 })
  const stopCallbacksRef = useRef<Set<() => void>>(new Set())

  const play = useCallback(() => {
    if (playerRef.current && !isPlaying) {
      playerRef.current.play()
      setIsPlaying(true)
    }
  }, [isPlaying])

  const stop = useCallback(() => {
    if (playerRef.current && isPlaying) {
      playerRef.current.stop()
      setIsPlaying(false)
      setCurrentBeat({ barIndex: 0, rhythmIndex: 0 })

      // Notify all registered callbacks
      stopCallbacksRef.current.forEach(callback => callback())
    }
  }, [isPlaying])

  const registerStopCallback = useCallback((callback: () => void) => {
    stopCallbacksRef.current.add(callback)
  }, [])

  const unregisterStopCallback = useCallback((callback: () => void) => {
    stopCallbacksRef.current.delete(callback)
  }, [])

  const value: PlayerControlContextValue = {
    playerRef,
    isPlaying,
    currentBeat,
    setIsPlaying,
    setCurrentBeat,
    play,
    stop,
    registerStopCallback,
    unregisterStopCallback,
  }

  return (
    <PlayerControlContext.Provider value={value}>
      {children}
    </PlayerControlContext.Provider>
  )
}
