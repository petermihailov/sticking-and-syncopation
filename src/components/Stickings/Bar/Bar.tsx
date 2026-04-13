import type { CSSProperties } from 'react'
import clsx from 'clsx'
import classes from './Bar.module.css'
import type { Sticking } from '../../../types'
import type { NotePositions } from '../../../lib/notation'

interface StickingBarProps {
  labels: Sticking[]
  flams?: boolean[]
  isSecondBar?: boolean
  className?: string
  currentIndex?: number
  notePositions?: NotePositions | null
}

export function Bar({
  labels,
  flams,
  isSecondBar = false,
  className,
  currentIndex,
  notePositions,
}: StickingBarProps) {
  const aligned = notePositions && notePositions.xs.length > 1

  // Flex-контейнер начинается от первой ноты, заканчивается на последней
  let containerStyle: CSSProperties | undefined
  if (aligned) {
    const first = notePositions.xs[0]
    const last = notePositions.xs[notePositions.xs.length - 1]
    const svgW = notePositions.svgWidth
    const n = labels.length
    const span = last - first
    // Ширина контейнера такая, чтобы центры крайних flex-элементов
    // совпали с центрами крайних нот
    const w = n > 1 ? (span * n) / (n - 1) : span
    const ml = first - (w - span) / 2
    containerStyle = {
      marginLeft: `${(ml / svgW) * 100}%`,
      width: `${(w / svgW) * 100}%`,
    }
  }

  return (
    <div
      className={clsx(className, classes.labels, {
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
            className={clsx(classes.label, {
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
