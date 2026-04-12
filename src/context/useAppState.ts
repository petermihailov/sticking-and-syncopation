import { createContext, useContext } from 'react'
import type { RudimentType } from '../converters/registry'
import type { StickingMapping } from '../types/sticking'

export interface AppStateContextValue {
  state: import('../types/appState').AppState
  actions: {
    setAccents: (accents: boolean[]) => void
    toggleAccent: (index: number) => void
    setRudiment: (rudiment: RudimentType) => void
    setTempo: (tempo: number) => void
    setMetronome: (enabled: boolean) => void
    setMetronomeVolume: (volume: number) => void
    setInstrumentMapping: (mapping: StickingMapping) => void
    resetAccents: () => void
    resetToDefaults: () => void
  }
  shareUrl: string
}

export const AppStateContext = createContext<AppStateContextValue | undefined>(
  undefined
)

export const useAppState = (): AppStateContextValue => {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider')
  }
  return context
}
