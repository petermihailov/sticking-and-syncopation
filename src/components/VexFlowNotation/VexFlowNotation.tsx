import type { ReactNode } from 'react'
import type { NotationData } from '../../types/notation'
import { SVGFilters } from './SVGFilters'
import { useVexFlowRenderer } from './useVexFlowRenderer'
import classes from './VexFlowNotation.module.css'

interface VexFlowNotationProps {
  seeNotation: NotationData
  playNotation?: NotationData
  width?: number
  children?: ReactNode
}

export function VexFlowNotation({
  seeNotation,
  playNotation,
  width = 420,
  children,
}: VexFlowNotationProps) {
  const { seeRef, playRef } = useVexFlowRenderer({
    seeNotation,
    playNotation,
    width,
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
