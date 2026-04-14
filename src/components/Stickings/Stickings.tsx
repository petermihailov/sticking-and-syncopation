import { useMemo } from 'react'
import type { Sticking } from '../../types'
import {
  resolveStrokes,
  resolveFlamStrokes,
} from '../../lib/player/StrokeResolver'
import { useNotePositions } from '../VexFlowNotation'
import { Bar } from './Bar'
import classes from './Stickings.module.css'

interface StickingDisplayProps {
  bars: Sticking[][]
  flams?: boolean[][]
  currentBeat?: { barIndex: number; rhythmIndex: number }
}

export function Stickings({ bars, flams, currentBeat }: StickingDisplayProps) {
  const notePositions = useNotePositions()

  const strokesByBar = useMemo(
    () => bars.map(bar => resolveStrokes(bar, true)),
    [bars]
  )

  const flamStrokesByBar = useMemo(
    () =>
      flams
        ? bars.map((bar, i) =>
            flams[i] ? resolveFlamStrokes(bar, flams[i], true) : undefined
          )
        : undefined,
    [bars, flams]
  )

  const containerStyle = notePositions
    ? { maxWidth: notePositions.svgWidth }
    : undefined

  return (
    <div className={classes.stickings} style={containerStyle}>
      {bars.map((barStickings, index) => (
        <Bar
          key={index}
          labels={barStickings}
          strokes={strokesByBar[index]}
          flamStrokes={flamStrokesByBar?.[index]}
          flams={flams?.[index]}
          isSecondBar={index === 1}
          notePositions={notePositions}
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
