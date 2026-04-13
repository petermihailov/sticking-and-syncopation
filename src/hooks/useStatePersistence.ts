import { useEffect } from 'react'
import type { AppState } from '../types/appState'
import { LocalStorageManager } from '../utils/localStorage'
import { encodeStateToUrl } from '../utils/urlState'

/**
 * Сохраняет состояние приложения в localStorage и синхронизирует URL.
 */
export function useStatePersistence(state: AppState): void {
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
    LocalStorageManager.setItem('playbackVolume', state.playbackVolume)
  }, [state.playbackVolume])

  useEffect(() => {
    LocalStorageManager.setItem('metronomeSound', state.metronomeSound)
  }, [state.metronomeSound])

  useEffect(() => {
    LocalStorageManager.setItem('instrumentMapping', state.instrumentMapping)
  }, [state.instrumentMapping])

  // Синхронизация URL без перезагрузки страницы
  useEffect(() => {
    const queryString = encodeStateToUrl(state)
    const newUrl = `${window.location.pathname}?${queryString}`
    window.history.replaceState(null, '', newUrl)
  }, [state])
}
