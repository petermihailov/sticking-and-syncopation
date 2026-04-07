import type { Sticking } from '../../types'
import { Bar } from './Bar'
import classes from './Stickings.module.css'

interface StickingDisplayProps {
  bars: Sticking[][]
  currentBeat?: { barIndex: number; rhythmIndex: number }
}

export function Stickings({ bars, currentBeat }: StickingDisplayProps) {
  return (
    <div className={classes.stickings}>
      {bars.map((barStickings, index) => (
        <Bar
          key={index}
          labels={barStickings}
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
