import clsx from 'clsx'
import type { Sticking } from '../../types'
import type { NotePositions } from '../../lib/notation'
import { useBarAlignment } from './useBarAlignment'
import classes from './StickingBar.module.css'

interface StickingBarProps {
  labels: Sticking[]
  flams?: boolean[]
  isSecondBar?: boolean
  currentIndex?: number
  notePositions?: NotePositions | null
}

export function StickingBar({
  labels,
  flams,
  isSecondBar = false,
  currentIndex,
  notePositions,
}: StickingBarProps) {
  const { containerStyle, aligned } = useBarAlignment(
    labels.length,
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
      {labels.map((label, index) => {
        // Буква флэма — противоположная рука
        const flamLabel =
          flams?.[index] && label !== ' '
            ? label.toLowerCase() === 'r'
              ? 'L'
              : label.toLowerCase() === 'l'
                ? 'R'
                : null
            : null

        return (
          <div
            className={clsx(classes.cell, {
              [classes.r]: label.toLowerCase() === 'r',
              [classes.l]: label.toLowerCase() === 'l',
              [classes.k]: label.toLowerCase() === 'k',
              [classes.a]: label === 'R' || label === 'L',
              [classes.flam]: flams?.[index],
              [classes.pause]: label === ' ',
              [classes.current]: index === currentIndex,
            })}
            key={index}
          >
            {flamLabel && (
              <span
                className={clsx(classes.flamPrefix, {
                  [classes.r]: flamLabel === 'R',
                  [classes.l]: flamLabel === 'L',
                })}
              >
                {flamLabel}
              </span>
            )}
            {label === ' ' ? '—' : label}
          </div>
        )
      })}
    </div>
  )
}
