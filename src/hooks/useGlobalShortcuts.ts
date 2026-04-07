import { useEffect } from 'react'

interface ShortcutActions {
  onReset: () => void
}

/**
 * Global keyboard shortcuts:
 * - R: reset to defaults
 * - Escape: blur active element
 */
export function useGlobalShortcuts({ onReset }: ShortcutActions): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'KeyR') {
        event.preventDefault()
        onReset()
      } else if (event.code === 'Escape') {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onReset])
}
