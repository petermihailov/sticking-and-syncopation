import clsx from 'clsx'
import classes from './Bar.module.css'
import type { Sticking } from '../../../types'

interface StickingBarProps {
  labels: Sticking[]
  flams?: boolean[]
  isSecondBar?: boolean
  className?: string
  currentIndex?: number
}

export function Bar({
  labels,
  flams,
  isSecondBar = false,
  className,
  currentIndex,
}: StickingBarProps) {
  return (
    <div
      className={clsx(className, classes.labels, {
        [classes.secondBar]: isSecondBar,
      })}
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
