import clsx from 'clsx'
import type { StrokeType } from '../../lib/player/StrokeResolver'
import type { NotePositions } from '../../lib/notation'
import { useBarHighlight } from './useBarHighlight'
import classes from './StrokeBar.module.css'

interface StrokeBarProps {
  strokes: (StrokeType | null)[]
  flamStrokes?: (StrokeType | null)[]
  isSecondBar?: boolean
  currentIndex?: number
  flamOffsetMs?: number
  notePositions?: NotePositions | null
}

export function StrokeBar({
  strokes,
  flamStrokes,
  isSecondBar = false,
  currentIndex,
  flamOffsetMs,
  notePositions,
}: StrokeBarProps) {
  const { containerStyle, aligned, cellsRef } = useBarHighlight({
    itemCount: strokes.length,
    notePositions,
    currentIndex,
    flamOffsetMs,
    hasFlamAtCurrent:
      currentIndex !== undefined && !!flamStrokes?.[currentIndex],
    graceClass: classes.flamStroke,
    mainClass: classes.stroke,
  })

  return (
    <div
      className={clsx(classes.bar, {
        [classes.secondBar]: isSecondBar,
        [classes.aligned]: aligned,
      })}
      style={containerStyle}
    >
      {strokes.map((stroke, index) => {
        const isCurrent = index === currentIndex
        const isFlamCurrent = isCurrent && !!flamStrokes?.[index]

        return (
          <div
            ref={el => {
              cellsRef.current[index] = el
            }}
            className={clsx(classes.cell, {
              [classes.current]: isCurrent && !isFlamCurrent,
              [classes.flamActive]: isFlamCurrent,
            })}
            key={index}
          >
            {flamStrokes?.[index] && (
              <span className={classes.flamStroke}>{flamStrokes[index]}</span>
            )}
            {stroke && <span className={classes.stroke}>{stroke}</span>}
          </div>
        )
      })}
    </div>
  )
}
