import { useRef } from 'react'
import clsx from 'clsx'
import classes from './AccentPattern.module.css'

interface AccentPatternProps {
  checkedItems: boolean[]
  onToggle: (index: number) => void
}

export function AccentPattern({ checkedItems, onToggle }: AccentPatternProps) {
  const checkboxRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleKeyDown = (event: React.KeyboardEvent, currentIndex: number) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : checkedItems.length - 1
        checkboxRefs.current[prevIndex]?.focus()
        break
      case 'ArrowRight':
        event.preventDefault()
        const nextIndex = currentIndex < checkedItems.length - 1 ? currentIndex + 1 : 0
        checkboxRefs.current[nextIndex]?.focus()
        break
      case ' ':
        event.preventDefault()
        onToggle(currentIndex)
        break
    }
  }

  return (
    <>
      <div className={classes.checkboxLabels}>
        {['1', '&', '2', '&', '3', '&', '4', '&'].map((label, index) => (
          <div key={index} className={classes.checkboxLabel}>
            {label}
          </div>
        ))}
      </div>
      <div className={clsx(classes.eighth)}>
        {checkedItems.map((isChecked, index) => (
          <input
            key={index}
            ref={el => { checkboxRefs.current[index] = el }}
            type="checkbox"
            checked={isChecked}
            onChange={() => onToggle(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            tabIndex={index === 0 ? 0 : -1}
          />
        ))}
      </div>
    </>
  )
}