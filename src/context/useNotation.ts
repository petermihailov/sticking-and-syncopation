import { createContext, useContext } from 'react'
import type { ConvertResult, Meter } from '../types'
import type { NotationData } from '../types/notation'

export interface NotationContextValue {
  convertResult: ConvertResult
  seeNotation: NotationData
  playNotation: NotationData
  meter: Meter
}

export const NotationContext = createContext<NotationContextValue | null>(null)

export const useNotation = (): NotationContextValue => {
  const context = useContext(NotationContext)
  if (!context) {
    throw new Error('useNotation must be used within NotationProvider')
  }
  return context
}
