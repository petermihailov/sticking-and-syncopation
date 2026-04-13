import type { ReactNode } from 'react'
import { useRudimentNotation } from '../hooks/useRudimentNotation'
import { useAppState } from './useAppState'
import { NotationContext } from './useNotation'

interface NotationProviderProps {
  children: ReactNode
}

export function NotationProvider({ children }: NotationProviderProps) {
  const { state } = useAppState()
  const value = useRudimentNotation(state.rudiment, state.accents, state.leadingHand)

  return (
    <NotationContext.Provider value={value}>
      {children}
    </NotationContext.Provider>
  )
}
