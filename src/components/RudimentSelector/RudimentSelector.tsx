import { useState, useRef, useEffect } from 'react'
import {
  getRudimentGroups,
  getRudimentOptions,
  type RudimentType,
} from '../../converters/registry'
import { parseFlams } from '../../converters/shared/converter-utils'
import classes from './RudimentSelector.module.css'

/** Рисует паттерн с визуальными флэмами (грейснот — маленькая буква противоположной руки) */
function PatternDisplay({ pattern }: { pattern: string }) {
  const { stickings, flams } = parseFlams(pattern)

  return (
    <span className={classes.pattern}>
      {stickings.map((s, i) => {
        const lower = s.toLowerCase()
        const flamLabel =
          flams[i] && lower !== ' '
            ? lower === 'r'
              ? 'L'
              : lower === 'l'
                ? 'R'
                : null
            : null

        return (
          <span key={i} className={classes.patternChar}>
            {flamLabel && (
              <span className={classes.flamGrace}>{flamLabel}</span>
            )}
            {s}
          </span>
        )
      })}
    </span>
  )
}

interface RudimentSelectorProps {
  selectedRudiment: RudimentType
  onRudimentChange: (rudiment: RudimentType) => void
}

const rudimentGroups = getRudimentGroups()
const rudimentOptions = getRudimentOptions()

export function RudimentSelector({
  selectedRudiment,
  onRudimentChange,
}: RudimentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
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
      // When dropdown is closed, arrow keys change rudiment directly
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        const nextIndex =
          selectedIndex < rudimentOptions.length - 1 ? selectedIndex + 1 : 0
        onRudimentChange(rudimentOptions[nextIndex].value as RudimentType)
        return
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        const prevIndex =
          selectedIndex > 0 ? selectedIndex - 1 : rudimentOptions.length - 1
        onRudimentChange(rudimentOptions[prevIndex].value as RudimentType)
        return
      }
      if (event.key === 'Enter' || event.key === ' ') {
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
        // Return focus to trigger button
        triggerRef.current?.focus()
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
          // Return focus to trigger button after selection
          triggerRef.current?.focus()
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
          {rudimentGroups.map(group => (
            <optgroup key={group.groupName} label={group.groupName}>
              {group.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.pattern.replace(/'/g, '')} · {option.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Desktop: Custom dropdown */}
      <div className={classes.customDropdown} ref={dropdownRef}>
        <button
          ref={triggerRef}
          className={classes.dropdownTrigger}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="Select rudiment"
        >
          <div className={classes.selectedOption}>
            {selectedOption && <PatternDisplay pattern={selectedOption.pattern} />}
            <span className={classes.label}>{selectedOption?.label}</span>
          </div>
          <span className={classes.arrow}>▼</span>
        </button>

        {isOpen && (
          <div className={classes.dropdownContent} role="listbox">
            {rudimentGroups.map((group, groupIndex) => (
              <div key={group.groupName} className={classes.group}>
                <div className={classes.groupHeader}>{group.groupName}</div>
                {group.options.map((option, optionIndex) => {
                  // Calculate flat index for navigation
                  let flatIndex = 0
                  for (let gi = 0; gi < groupIndex; gi++) {
                    flatIndex += rudimentGroups[gi].options.length
                  }
                  flatIndex += optionIndex

                  return (
                    <button
                      key={option.value}
                      ref={el => {
                        optionRefs.current[flatIndex] = el
                      }}
                      className={`${classes.option} ${option.value === selectedRudiment ? classes.selected : ''} ${focusedIndex === flatIndex ? classes.focused : ''}`}
                      onClick={() => {
                        onRudimentChange(option.value as RudimentType)
                        setIsOpen(false)
                        setFocusedIndex(-1)
                      }}
                      onMouseEnter={() => setFocusedIndex(flatIndex)}
                      onKeyDown={handleKeyDown}
                      role="option"
                      aria-selected={option.value === selectedRudiment}
                      tabIndex={focusedIndex === flatIndex ? 0 : -1}
                    >
                      <PatternDisplay pattern={option.pattern} />
                      <span className={classes.label}>{option.label}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
