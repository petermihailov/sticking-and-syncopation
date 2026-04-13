import type { ReactNode } from 'react'
import type { NotationData } from '../../types/notation'
import { SVGFilters } from './SVGFilters'
import { useVexFlowRenderer } from './useVexFlowRenderer'
import { NotePositionsContext } from './NotePositionsContext'
import classes from './VexFlowNotation.module.css'

interface VexFlowNotationProps {
  seeNotation: NotationData
  playNotation?: NotationData
  currentRhythmIndex?: number
  isPlaying?: boolean
  /** Кол-во нот на долю в play-нотации (для маппинга на see-нотацию) */
  notesPerBeat?: number
  showSeeNotation?: boolean
  showPlayNotation?: boolean
  /** Выровнять ширину see и play станов по максимальной */
  matchWidth?: boolean
  children?: ReactNode
}

export function VexFlowNotation({
  seeNotation,
  playNotation,
  currentRhythmIndex,
  isPlaying,
  notesPerBeat,
  showSeeNotation = true,
  showPlayNotation = true,
  matchWidth = false,
  children,
}: VexFlowNotationProps) {
  const { seeRef, playRef, playNotePositions } = useVexFlowRenderer({
    seeNotation,
    playNotation,
    currentRhythmIndex,
    isPlaying,
    notesPerBeat,
    matchWidth,
  })

  return (
    <div className={classes.container}>
      <SVGFilters />
      <div
        ref={seeRef}
        className={classes.notation}
        style={{ display: showSeeNotation ? undefined : 'none' }}
      />
      {playNotation && (
        <div
          ref={playRef}
          className={classes.notation}
          style={{ display: showPlayNotation ? undefined : 'none' }}
        />
      )}
      <NotePositionsContext.Provider value={playNotePositions}>
        {children}
      </NotePositionsContext.Provider>
    </div>
  )
}
