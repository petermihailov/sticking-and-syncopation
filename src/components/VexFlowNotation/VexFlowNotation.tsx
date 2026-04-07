import type { ReactNode } from 'react'
import type { NotationData } from '../../types/notation'
import { SVGFilters } from './SVGFilters'
import { useVexFlowRenderer } from './useVexFlowRenderer'
import classes from './VexFlowNotation.module.css'

interface VexFlowNotationProps {
  seeNotation: NotationData
  playNotation?: NotationData
  currentRhythmIndex?: number
  isPlaying?: boolean
  children?: ReactNode
}

export function VexFlowNotation({
  seeNotation,
  playNotation,
  currentRhythmIndex,
  isPlaying,
  children,
}: VexFlowNotationProps) {
  const { seeRef, playRef } = useVexFlowRenderer({
    seeNotation,
    playNotation,
    currentRhythmIndex,
    isPlaying,
  })

  return (
    <div className={classes.container}>
      <SVGFilters />
      <div ref={seeRef} className={classes.notation} />
      {playNotation && <div ref={playRef} className={classes.notation} />}
      {children}
    </div>
  )
}
