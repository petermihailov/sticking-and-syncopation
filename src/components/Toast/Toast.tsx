import { useEffect, type FC } from 'react'
import { createPortal } from 'react-dom'
import classes from './Toast.module.css'

interface ToastProps {
  message: string
  duration?: number
  onClose: () => void
}

/**
 * Toast notification component
 * Displays a temporary message at the bottom-right of the screen
 */
export const Toast: FC<ToastProps> = ({
  message,
  duration = 2000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return createPortal(
    <div className={classes.toast}>{message}</div>,
    document.body
  )
}
