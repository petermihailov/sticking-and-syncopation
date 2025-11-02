import type { Sticking } from '../../types.ts'
import { Bar } from './Bar'
import classes from './Stickings.module.css'

interface StickingDisplayProps {
  bars: Sticking[][]
}

export function Stickings({ bars }: StickingDisplayProps) {
  return (
    <div className={classes.stickings}>
      {bars.map((barStickings, index) => (
        <Bar key={index} labels={barStickings} isSecondBar={index === 1} />
      ))}
    </div>
  )
}
