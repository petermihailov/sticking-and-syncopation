import type { Sticking } from '../../../types.ts'
import { Bar } from './Bar'
import classes from './Stickings.module.css'

interface StickingDisplayProps {
  bars: string[]
}

export function Stickings({ bars }: StickingDisplayProps) {
  const firstBarLabels: Sticking[] = bars[0]
    .replace(/\s/g, '')
    .split('') as Sticking[]

  const secondBarLabels: Sticking[] | null = bars[1]
    ? (bars[1].replace(/\s/g, '').split('') as Sticking[])
    : null

  return (
    <div className={classes.stickings}>
      <Bar labels={firstBarLabels} />
      {secondBarLabels && <Bar labels={secondBarLabels} isSecondBar />}
    </div>
  )
}
