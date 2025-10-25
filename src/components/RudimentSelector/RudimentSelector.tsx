import { useState, useRef, useEffect } from 'react'
import type { RudimentType } from '../../types'
import { getRudimentOptions } from '../../converters/registry'
import classes from './RudimentSelector.module.css'

interface RudimentSelectorProps {
  selectedRudiment: RudimentType
  onRudimentChange: (rudiment: RudimentType) => void
}

const rudimentOptions = getRudimentOptions()

export function RudimentSelector({
  selectedRudiment,
  onRudimentChange,
}: RudimentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])

  const selectedOption = rudimentOptions.find(
    opt => opt.value === selectedRudiment
  )
  const selectedIndex = rudimentOptions.findIndex(
    opt => opt.value === selectedRudiment
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      optionRefs.current[focusedIndex]?.focus()
    }
  }, [focusedIndex, isOpen])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (
        event.key === 'Enter' ||
        event.key === ' ' ||
        event.key === 'ArrowDown'
      ) {
        event.preventDefault()
        setIsOpen(true)
        setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0)
      }
      return
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        setIsOpen(false)
        setFocusedIndex(-1)
        break
      case 'ArrowDown':
        event.preventDefault()
        setFocusedIndex(prev =>
          prev < rudimentOptions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        setFocusedIndex(prev =>
          prev > 0 ? prev - 1 : rudimentOptions.length - 1
        )
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (focusedIndex >= 0) {
          onRudimentChange(rudimentOptions[focusedIndex].value as RudimentType)
          setIsOpen(false)
          setFocusedIndex(-1)
        }
        break
    }
  }

  return (
    <>
      {/* Mobile: Native select */}
      <div className={classes.mobileSelect}>
        <select
          value={selectedRudiment}
          onChange={e => onRudimentChange(e.target.value as RudimentType)}
        >
          {rudimentOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.pattern} · {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: Custom dropdown */}
      <div className={classes.customDropdown} ref={dropdownRef}>
        <button
          className={classes.dropdownTrigger}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="Select rudiment"
        >
          <div className={classes.selectedOption}>
            <span className={classes.pattern}>{selectedOption?.pattern}</span>
            <span className={classes.label}>{selectedOption?.label}</span>
          </div>
          <span className={classes.arrow}>▼</span>
        </button>

        {isOpen && (
          <div className={classes.dropdownContent} role="listbox">
            {rudimentOptions.map((option, index) => (
              <button
                key={option.value}
                ref={el => { optionRefs.current[index] = el }}
                className={`${classes.option} ${option.value === selectedRudiment ? classes.selected : ''} ${focusedIndex === index ? classes.focused : ''}`}
                onClick={() => {
                  onRudimentChange(option.value as RudimentType)
                  setIsOpen(false)
                  setFocusedIndex(-1)
                }}
                onMouseEnter={() => setFocusedIndex(index)}
                onKeyDown={handleKeyDown}
                role="option"
                aria-selected={option.value === selectedRudiment}
                tabIndex={focusedIndex === index ? 0 : -1}
              >
                <span className={classes.pattern}>{option.pattern}</span>
                <span className={classes.label}>{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
