import { useState, useMemo, type FC, type ReactNode } from 'react'
import type { RudimentType } from '../converters/registry'
import type { StickingMapping } from '../types/sticking'
import type { AppState, ClickSound, LeadingHand } from '../types/appState'
import { DEFAULT_APP_STATE, CLICK_SOUNDS } from '../types/appState'
import { LocalStorageManager } from '../utils/localStorage'
import { encodeStateToUrl, decodeStateFromUrl } from '../utils/urlState'
import { migrateStickingMapping } from '../utils/migrations'
import { useStatePersistence } from '../hooks/useStatePersistence'
import { AppStateContext } from './useAppState'

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
  const savedPlaybackVolume =
    LocalStorageManager.getItem<number>('playbackVolume')
  const savedMetronomeSound =
    LocalStorageManager.getItem<string>('metronomeSound')
  const validMetronomeSound =
    savedMetronomeSound &&
    (CLICK_SOUNDS as readonly string[]).includes(savedMetronomeSound)
      ? (savedMetronomeSound as ClickSound)
      : DEFAULT_APP_STATE.metronomeSound
  const savedLeadingHand =
    LocalStorageManager.getItem<LeadingHand>('leadingHand')
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
    metronomeVolume: savedMetronomeVolume ?? DEFAULT_APP_STATE.metronomeVolume,
    playbackVolume: savedPlaybackVolume ?? DEFAULT_APP_STATE.playbackVolume,
    metronomeSound: validMetronomeSound,
    instrumentMapping: finalMapping,
    leadingHand: savedLeadingHand ?? DEFAULT_APP_STATE.leadingHand,
  }
}

interface AppStateProviderProps {
  children: ReactNode
}

export const AppStateProvider: FC<AppStateProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>(loadInitialState)

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

  const setPlaybackVolume = (playbackVolume: number) => {
    setState(prev => ({ ...prev, playbackVolume }))
  }

  const setMetronomeSound = (metronomeSound: ClickSound) => {
    setState(prev => ({ ...prev, metronomeSound }))
  }

  const setInstrumentMapping = (instrumentMapping: StickingMapping) => {
    setState(prev => ({ ...prev, instrumentMapping }))
  }

  const setLeadingHand = (leadingHand: LeadingHand) => {
    setState(prev => ({ ...prev, leadingHand }))
  }

  const resetAccents = () => {
    setState(prev => ({ ...prev, accents: DEFAULT_APP_STATE.accents }))
  }

  const resetToDefaults = () => {
    setState(DEFAULT_APP_STATE)
  }

  const shareUrl = useMemo(() => {
    const queryString = encodeStateToUrl(state)
    const baseUrl = window.location.origin + window.location.pathname
    return `${baseUrl}?${queryString}`
  }, [state])

  const contextValue = {
    state,
    actions: {
      setAccents,
      toggleAccent,
      setRudiment,
      setTempo,
      setMetronome,
      setMetronomeVolume,
      setPlaybackVolume,
      setMetronomeSound,
      setInstrumentMapping,
      setLeadingHand,
      resetAccents,
      resetToDefaults,
    },
    shareUrl,
  }

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  )
}
