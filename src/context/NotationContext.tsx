import { createContext, useContext, type ReactNode } from 'react'
import type { ConvertResult, Meter } from '../types'
import type { NotationData } from '../types/notation'
import { useRudimentNotation } from '../hooks/useRudimentNotation'
import { useAppState } from './AppStateContext'

interface NotationContextValue {
  convertResult: ConvertResult
  seeNotation: NotationData
  playNotation: NotationData
  meter: Meter
}

const NotationContext = createContext<NotationContextValue | null>(null)

export function useNotation() {
  const context = useContext(NotationContext)
  if (!context) {
    throw new Error('useNotation must be used within NotationProvider')
  }
  return context
}

interface NotationProviderProps {
  children: ReactNode
}

export function NotationProvider({ children }: NotationProviderProps) {
  const { state } = useAppState()
  const value = useRudimentNotation(state.rudiment, state.accents)

  return (
    <NotationContext.Provider value={value}>
      {children}
    </NotationContext.Provider>
  )
}
