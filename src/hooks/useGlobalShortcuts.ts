import { useEffect } from 'react'
import { isTextInputElement } from '../utils/domFocus'

interface ShortcutActions {
  onReset: () => void
}

/**
 * Глобальные горячие клавиши:
 * - R: сброс к значениям по умолчанию (игнорируется в полях ввода)
 * - Escape: снять фокус с активного элемента
 */
export function useGlobalShortcuts({ onReset }: ShortcutActions): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
        return
      }

      // Не перехватываем клавиши, пока пользователь печатает в поле ввода.
      if (isTextInputElement(document.activeElement)) return

      if (event.code === 'KeyR') {
        event.preventDefault()
        onReset()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onReset])
}
