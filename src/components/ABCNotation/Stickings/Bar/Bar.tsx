import clsx from 'clsx'
import classes from './Bar.module.css'
import type { Sticking } from '../../../../types.ts'
import type { CSSProperties } from 'react'

interface StickingBarProps {
  labels: Sticking[]
  isSecondBar?: boolean
  style?: CSSProperties
}

export function Bar({ labels, isSecondBar = false, style }: StickingBarProps) {
  return (
    <div
      style={style}
      className={clsx(classes.labels, { [classes.secondBar]: isSecondBar })}
    >
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
