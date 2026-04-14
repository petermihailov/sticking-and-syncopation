import clsx from 'clsx'
import type { StrokeType } from '../../lib/player/StrokeResolver'
import type { NotePositions } from '../../lib/notation'
import { useBarAlignment } from './useBarAlignment'
import classes from './StrokeBar.module.css'

interface StrokeBarProps {
  strokes: (StrokeType | null)[]
  flamStrokes?: (StrokeType | null)[]
  isSecondBar?: boolean
  currentIndex?: number
  notePositions?: NotePositions | null
}

export function StrokeBar({
  strokes,
  flamStrokes,
  isSecondBar = false,
  currentIndex,
  notePositions,
}: StrokeBarProps) {
  const { containerStyle, aligned } = useBarAlignment(
    strokes.length,
    notePositions
  )

  return (
    <div
      className={clsx(classes.bar, {
        [classes.secondBar]: isSecondBar,
        [classes.aligned]: aligned,
      })}
      style={containerStyle}
    >
      {strokes.map((stroke, index) => (
        <div
          className={clsx(classes.cell, {
            [classes.current]: index === currentIndex,
          })}
          key={index}
        >
          {flamStrokes?.[index] && (
            <span className={classes.flamStroke}>{flamStrokes[index]}</span>
          )}
          {stroke && <span className={classes.stroke}>{stroke}</span>}
        </div>
      ))}
    </div>
  )
}
