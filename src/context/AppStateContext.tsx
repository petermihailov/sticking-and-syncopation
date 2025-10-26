import { createContext, useContext, useState, useEffect, useMemo, type FC, type ReactNode } from 'react'
import type { RudimentType } from '../types.ts'
import type { StickingMapping, Instrument } from '../types/instrument'
import type { AppState, FavoritePreset } from '../types/appState'
import { DEFAULT_APP_STATE } from '../types/appState'
import { LocalStorageManager } from '../utils/localStorage'
import { encodeStateToUrl, decodeStateFromUrl } from '../utils/urlState'

/**
 * Migrate old StickingMapping format (single instruments) to new format (arrays)
 * @param mapping - Potentially old format mapping
 * @returns Migrated mapping with arrays
 */
function migrateStickingMapping(mapping: any): StickingMapping {
  if (!mapping) return DEFAULT_APP_STATE.instrumentMapping

  // Check if already migrated (uppercaseR is an array)
  if (Array.isArray(mapping.uppercaseR)) {
    return mapping as StickingMapping
  }

  // Migrate: convert single instruments to arrays
  return {
    uppercaseR: [mapping.uppercaseR] as Instrument[],
    uppercaseL: [mapping.uppercaseL] as Instrument[],
    uppercaseRKick: mapping.uppercaseRKick ?? false,
    uppercaseLKick: mapping.uppercaseLKick ?? false,
    lowercaseR: [mapping.lowercaseR] as Instrument[],
    lowercaseL: [mapping.lowercaseL] as Instrument[],
    kick: [mapping.kick] as Instrument[],
  }
}

interface AppStateContextValue {
  state: AppState
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
    loadPreset: (preset: FavoritePreset) => void
  }
  shareUrl: string
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined)

interface AppStateProviderProps {
  children: ReactNode
}

/**
 * Provider for application state with URL and localStorage persistence
 * Priority: URL params > localStorage > defaults
 */
export const AppStateProvider: FC<AppStateProviderProps> = ({ children }) => {
  // Initialize state from URL, then localStorage, then defaults
  const [state, setState] = useState<AppState>(() => {
    // 1. Try to load from URL (highest priority)
    const searchParams = new URLSearchParams(window.location.search)
    const urlState = decodeStateFromUrl(searchParams)

    // 2. Try to load from localStorage (fallback)
    const savedAccents = LocalStorageManager.getItem<boolean[]>('accents')
    const savedRudiment = LocalStorageManager.getItem<RudimentType>('selectedRudiment')
    const savedTempo = LocalStorageManager.getItem<number>('tempo')
    const savedMetronome = LocalStorageManager.getItem<boolean>('metronome')
    const savedMetronomeVolume = LocalStorageManager.getItem<number>('metronomeVolume')
    const savedMapping = LocalStorageManager.getItem<any>('instrumentMapping')

    // Migrate saved mapping from old format (single instruments) to new format (arrays)
    const migratedMapping = savedMapping ? migrateStickingMapping(savedMapping) : DEFAULT_APP_STATE.instrumentMapping

    // Migrate URL mapping if present
    const finalMapping = urlState.instrumentMapping
      ? migrateStickingMapping(urlState.instrumentMapping)
      : migratedMapping

    // 3. Merge URL > localStorage > defaults
    return {
      accents: urlState.accents ?? savedAccents ?? DEFAULT_APP_STATE.accents,
      rudiment: urlState.rudiment ?? savedRudiment ?? DEFAULT_APP_STATE.rudiment,
      tempo: urlState.tempo ?? savedTempo ?? DEFAULT_APP_STATE.tempo,
      metronome: urlState.metronome ?? savedMetronome ?? DEFAULT_APP_STATE.metronome,
      metronomeVolume: savedMetronomeVolume ?? DEFAULT_APP_STATE.metronomeVolume,
      instrumentMapping: finalMapping,
    }
  })

  // Save to localStorage on state changes
  useEffect(() => {
    LocalStorageManager.setItem('accents', state.accents)
  }, [state.accents])

  useEffect(() => {
    LocalStorageManager.setItem('selectedRudiment', state.rudiment)
  }, [state.rudiment])

  useEffect(() => {
    LocalStorageManager.setItem('tempo', state.tempo)
  }, [state.tempo])

  useEffect(() => {
    LocalStorageManager.setItem('metronome', state.metronome)
  }, [state.metronome])

  useEffect(() => {
    LocalStorageManager.setItem('metronomeVolume', state.metronomeVolume)
  }, [state.metronomeVolume])

  useEffect(() => {
    LocalStorageManager.setItem('instrumentMapping', state.instrumentMapping)
  }, [state.instrumentMapping])

  // Actions
  const setAccents = (accents: boolean[]) => {
    setState(prev => ({ ...prev, accents }))
  }

  const toggleAccent = (index: number) => {
    setState(prev => {
      const newAccents = [...prev.accents]
      newAccents[index] = !newAccents[index]
      return { ...prev, accents: newAccents }
    })
  }

  const setRudiment = (rudiment: RudimentType) => {
    setState(prev => ({ ...prev, rudiment }))
  }

  const setTempo = (tempo: number) => {
    setState(prev => ({ ...prev, tempo }))
  }

  const setMetronome = (metronome: boolean) => {
    setState(prev => ({ ...prev, metronome }))
  }

  const setMetronomeVolume = (metronomeVolume: number) => {
    setState(prev => ({ ...prev, metronomeVolume }))
  }

  const setInstrumentMapping = (instrumentMapping: StickingMapping) => {
    setState(prev => ({ ...prev, instrumentMapping }))
  }

  const resetAccents = () => {
    setState(prev => ({ ...prev, accents: DEFAULT_APP_STATE.accents }))
  }

  const resetToDefaults = () => {
    setState(DEFAULT_APP_STATE)
  }

  const loadPreset = (preset: FavoritePreset) => {
    setState(prev => ({
      ...prev,
      accents: preset.accents,
      rudiment: preset.rudiment,
      tempo: preset.tempo,
      instrumentMapping: preset.instrumentMapping,
    }))
  }

  // Compute shareable URL
  const shareUrl = useMemo(() => {
    const queryString = encodeStateToUrl(state)
    const baseUrl = window.location.origin + window.location.pathname
    return `${baseUrl}?${queryString}`
  }, [state])

  // Sync URL with state changes (update address bar in real-time)
  useEffect(() => {
    const queryString = encodeStateToUrl(state)
    const newUrl = `${window.location.pathname}?${queryString}`

    // Update URL without reloading page
    window.history.replaceState(null, '', newUrl)
  }, [state])

  const contextValue: AppStateContextValue = {
    state,
    actions: {
      setAccents,
      toggleAccent,
      setRudiment,
      setTempo,
      setMetronome,
      setMetronomeVolume,
      setInstrumentMapping,
      resetAccents,
      resetToDefaults,
      loadPreset,
    },
    shareUrl,
  }

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  )
}

/**
 * Hook to access app state and actions
 */
export const useAppState = (): AppStateContextValue => {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider')
  }
  return context
}
