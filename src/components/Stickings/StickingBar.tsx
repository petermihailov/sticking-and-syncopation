import clsx from 'clsx'
import type { Sticking } from '../../types'
import type { NotePositions } from '../../lib/notation'
import { useBarHighlight } from './useBarHighlight'
import classes from './StickingBar.module.css'

interface StickingBarProps {
  labels: Sticking[]
  flams?: boolean[]
  isSecondBar?: boolean
  currentIndex?: number
  flamOffsetMs?: number
  notePositions?: NotePositions | null
}

export function StickingBar({
  labels,
  flams,
  isSecondBar = false,
  currentIndex,
  flamOffsetMs,
  notePositions,
}: StickingBarProps) {
  const { containerStyle, aligned, cellsRef } = useBarHighlight({
    itemCount: labels.length,
    notePositions,
    currentIndex,
    flamOffsetMs,
    hasFlamAtCurrent: currentIndex !== undefined && !!flams?.[currentIndex],
    graceClass: classes.flamPrefix,
    mainClass: classes.mainLabel,
  })

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

        // Для флэм-ячеек не ставим .current — анимацию делает Web Animations API
        const isCurrent = index === currentIndex
        const isFlamCurrent = isCurrent && flams?.[index]

        return (
          <div
            ref={el => {
              cellsRef.current[index] = el
            }}
            className={clsx(classes.cell, {
              [classes.r]: label.toLowerCase() === 'r',
              [classes.l]: label.toLowerCase() === 'l',
              [classes.k]: label.toLowerCase() === 'k',
              [classes.a]: label === 'R' || label === 'L',
              [classes.flam]: flams?.[index],
              [classes.pause]: label === ' ',
              [classes.current]: isCurrent && !isFlamCurrent,
              [classes.flamActive]: isFlamCurrent,
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
            <span className={classes.mainLabel}>
              {label === ' ' ? '—' : label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
