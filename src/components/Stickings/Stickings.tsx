import type { Sticking } from '../../types.ts'
import { flipHands } from '../../converters/shared/hand-utils'
import { Bar } from './Bar'
import classes from './Stickings.module.css'

interface StickingDisplayProps {
  stickings: Sticking[]
  isMirrored?: boolean
}

export function Stickings({ stickings, isMirrored = false }: StickingDisplayProps) {
  const secondBarLabels: Sticking[] | null = isMirrored
    ? flipHands(stickings)
    : null

  return (
    <div className={classes.stickings}>
      <Bar labels={stickings} />
      {secondBarLabels && <Bar labels={secondBarLabels} isSecondBar />}
    </div>
  )
}
