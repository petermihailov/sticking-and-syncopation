import clsx from 'clsx'
import type { Sticking } from '../types'
import classes from './StickingBar.module.css'

interface StickingBarProps {
  labels: Sticking[]
  isSecondBar?: boolean
}

export function StickingBar({ labels, isSecondBar = false }: StickingBarProps) {
  return (
    <div className={clsx(classes.labels, { [classes.secondBar]: isSecondBar })}>
      {labels.map((label, index) => (
        <div
          className={clsx(classes.label, {
            [classes.r]: label.toLowerCase() === 'r',
            [classes.l]: label.toLowerCase() === 'l',
            [classes.a]: label === 'R' || label === 'L',
          })}
          key={index}
        >
          {label}
        </div>
      ))}
    </div>
  )
}