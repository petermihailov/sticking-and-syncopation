import clsx from 'clsx'
import classes from './Bar.module.css'
import type { Sticking } from '../../../types.ts'

interface StickingBarProps {
  labels: Sticking[]
  isSecondBar?: boolean
  className?: string
  currentIndex?: number
}

export function Bar({
  labels,
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
      {labels.map((label, index) => (
        <div
          className={clsx(classes.label, {
            [classes.r]: label.toLowerCase() === 'r',
            [classes.l]: label.toLowerCase() === 'l',
            [classes.k]: label.toLowerCase() === 'k',
            [classes.a]: label === 'R' || label === 'L',
            [classes.pause]: label === ' ',
            [classes.current]: index === currentIndex,
          })}
          key={index}
        >
          {label === ' ' ? '—' : label}
        </div>
      ))}
    </div>
  )
}
