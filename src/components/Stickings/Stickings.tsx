import type { Sticking } from '../../types'
import { Bar } from './Bar'
import classes from './Stickings.module.css'

interface StickingDisplayProps {
  bars: Sticking[][]
  flams?: boolean[][]
  currentBeat?: { barIndex: number; rhythmIndex: number }
}

export function Stickings({ bars, flams, currentBeat }: StickingDisplayProps) {
  return (
    <div className={classes.stickings}>
      {bars.map((barStickings, index) => (
        <Bar
          key={index}
          labels={barStickings}
          flams={flams?.[index]}
          isSecondBar={index === 1}
          currentIndex={
            currentBeat?.barIndex === index
              ? currentBeat.rhythmIndex
              : undefined
          }
        />
      ))}
    </div>
  )
}
