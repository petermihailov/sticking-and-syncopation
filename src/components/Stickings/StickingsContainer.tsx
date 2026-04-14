import { useMemo } from 'react'
import type { Sticking } from '../../types'
import { resolveAllStrokes } from '../../lib/player/StrokeResolver'
import { useNotePositions } from '../VexFlowNotation'
import { StickingBar } from './StickingBar'
import { StrokeBar } from './StrokeBar'
import classes from './StickingsContainer.module.css'

interface StickingsContainerProps {
  bars: Sticking[][]
  flams?: boolean[][]
  currentBeat?: { barIndex: number; rhythmIndex: number }
  showStickings?: boolean
  showStrokes?: boolean
}

export function StickingsContainer({
  bars,
  flams,
  currentBeat,
  showStickings = true,
  showStrokes = true,
}: StickingsContainerProps) {
  const notePositions = useNotePositions()

  const resolvedByBar = useMemo(
    () =>
      bars.map((bar, i) =>
        resolveAllStrokes({ stickings: bar, flams: flams?.[i], loop: true })
      ),
    [bars, flams]
  )

  const containerStyle = notePositions
    ? { maxWidth: notePositions.svgWidth }
    : undefined

  return (
    <div className={classes.stickings} style={containerStyle}>
      {bars.map((barStickings, index) => (
        <div key={index} className={classes.barGroup}>
          {showStickings && (
            <StickingBar
              labels={barStickings}
              flams={flams?.[index]}
              isSecondBar={index === 1}
              notePositions={notePositions}
              currentIndex={
                currentBeat?.barIndex === index
                  ? currentBeat.rhythmIndex
                  : undefined
              }
              flamOffsetMs={
                currentBeat?.barIndex === index
                  ? currentBeat.flamOffsetMs
                  : undefined
              }
            />
          )}
          {showStrokes && (
            <StrokeBar
              strokes={resolvedByBar[index].strokes}
              flamStrokes={resolvedByBar[index].flamStrokes}
              isSecondBar={index === 1}
              currentIndex={
                currentBeat?.barIndex === index
                  ? currentBeat.rhythmIndex
                  : undefined
              }
              flamOffsetMs={
                currentBeat?.barIndex === index
                  ? currentBeat.flamOffsetMs
                  : undefined
              }
              notePositions={notePositions}
            />
          )}
        </div>
      ))}
    </div>
  )
}
