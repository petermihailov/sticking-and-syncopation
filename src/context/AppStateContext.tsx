import {
  createContext,
  useContext,
  useState,
  useMemo,
  type FC,
  type ReactNode,
} from 'react'
import type { RudimentType } from '../converters/registry'
import type { StickingMapping } from '../types/sticking'
import type { AppState } from '../types/appState'
import type { UserExercise } from '../types/userLessons'
import { DEFAULT_APP_STATE } from '../types/appState'
import { LocalStorageManager } from '../utils/localStorage'
import { encodeStateToUrl, decodeStateFromUrl } from '../utils/urlState'
import { migrateStickingMapping } from '../utils/migrations'
import { useStatePersistence } from '../hooks/useStatePersistence'

interface AppStateContextValue {
  state: AppState
  /** id загруженного пользовательского упражнения, либо null */
  loadedExerciseId: string | null
  /** Загруженное упражнение отличается от текущего state */
  isDirty: boolean
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
    loadUserExercise: (exercise: UserExercise) => void
    clearLoadedExercise: () => void
  }
  shareUrl: string
}

const AppStateContext = createContext<AppStateContextValue | undefined>(
  undefined
)

function loadInitialState(): AppState {
  const searchParams = new URLSearchParams(window.location.search)
  const urlState = decodeStateFromUrl(searchParams)

  const savedAccents = LocalStorageManager.getItem<boolean[]>('accents')
  const savedRudiment =
    LocalStorageManager.getItem<RudimentType>('selectedRudiment')
  const savedTempo = LocalStorageManager.getItem<number>('tempo')
  const savedMetronome = LocalStorageManager.getItem<boolean>('metronome')
  const savedMetronomeVolume =
    LocalStorageManager.getItem<number>('metronomeVolume')
  const savedMapping = LocalStorageManager.getItem<unknown>('instrumentMapping')

  const migratedMapping = savedMapping
    ? migrateStickingMapping(savedMapping)
    : DEFAULT_APP_STATE.instrumentMapping

  const finalMapping = urlState.instrumentMapping
    ? migrateStickingMapping(urlState.instrumentMapping)
    : migratedMapping

  return {
    accents: urlState.accents ?? savedAccents ?? DEFAULT_APP_STATE.accents,
    rudiment: urlState.rudiment ?? savedRudiment ?? DEFAULT_APP_STATE.rudiment,
    tempo: urlState.tempo ?? savedTempo ?? DEFAULT_APP_STATE.tempo,
    metronome: savedMetronome ?? DEFAULT_APP_STATE.metronome,
    metronomeVolume:
      savedMetronomeVolume ?? DEFAULT_APP_STATE.metronomeVolume,
    instrumentMapping: finalMapping,
  }
}

function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

function mappingsEqual(a: StickingMapping, b: StickingMapping): boolean {
  return (
    arraysEqual(a.uppercaseR, b.uppercaseR) &&
    arraysEqual(a.uppercaseL, b.uppercaseL) &&
    a.uppercaseRKick === b.uppercaseRKick &&
    a.uppercaseLKick === b.uppercaseLKick &&
    arraysEqual(a.lowercaseR, b.lowercaseR) &&
    arraysEqual(a.lowercaseL, b.lowercaseL) &&
    arraysEqual(a.kick, b.kick)
  )
}

interface AppStateProviderProps {
  children: ReactNode
}

export const AppStateProvider: FC<AppStateProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>(loadInitialState)
  const [loadedExercise, setLoadedExercise] = useState<UserExercise | null>(
    null
  )

  useStatePersistence(state)

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

  const loadUserExercise = (exercise: UserExercise) => {
    setState(prev => ({
      ...prev,
      accents: exercise.accents,
      rudiment: exercise.rudiment,
      tempo: exercise.tempo,
      instrumentMapping: exercise.instrumentMapping,
    }))
    setLoadedExercise(exercise)
  }

  const clearLoadedExercise = () => {
    setLoadedExercise(null)
  }

  const isDirty = useMemo(() => {
    if (!loadedExercise) return false
    return (
      loadedExercise.tempo !== state.tempo ||
      loadedExercise.rudiment !== state.rudiment ||
      !arraysEqual(loadedExercise.accents, state.accents) ||
      !mappingsEqual(loadedExercise.instrumentMapping, state.instrumentMapping)
    )
  }, [loadedExercise, state])

  const shareUrl = useMemo(() => {
    const queryString = encodeStateToUrl(state)
    const baseUrl = window.location.origin + window.location.pathname
    return `${baseUrl}?${queryString}`
  }, [state])

  const contextValue: AppStateContextValue = {
    state,
    loadedExerciseId: loadedExercise?.id ?? null,
    isDirty,
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
      loadUserExercise,
      clearLoadedExercise,
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
