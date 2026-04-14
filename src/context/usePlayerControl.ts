import { createContext, useContext } from 'react'
import type { DrumKit } from '../types/kit'

interface Beat {
  barIndex: number
  rhythmIndex: number
  flamOffsetMs?: number
}

export interface PlayerControlContextValue {
  isPlaying: boolean
  currentBeat: Beat
  instrumentCounters: Map<string, number>
  drumKit: DrumKit | null
  isLoading: boolean
  hasPattern: boolean
  toggle: () => void
}

export const PlayerControlContext =
  createContext<PlayerControlContextValue | null>(null)

export const usePlayerControl = (): PlayerControlContextValue => {
  const context = useContext(PlayerControlContext)
  if (!context) {
    throw new Error(
      'usePlayerControl must be used within PlayerControlProvider'
    )
  }
  return context
}
