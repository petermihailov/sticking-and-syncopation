import { createContext, useContext } from 'react'
import type { NotePositions } from '../../lib/notation'

export const NotePositionsContext = createContext<NotePositions | null>(null)

export function useNotePositions(): NotePositions | null {
  return useContext(NotePositionsContext)
}
