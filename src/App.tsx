import { useState, useEffect } from 'react'
import type { Accent, RudimentType } from './types.ts'
import { convertToParadiddles } from './converters/paradiddles'
import { convertHandToHand } from './converters/triplets/hand-to-hand'
import { RudimentSelector } from './components/RudimentSelector'
import { AccentPattern } from './components/AccentPattern'
import { ABCNotation } from './components/ABCNotation'
import {
  generateAccentNotation,
  generateParadiddleNotation,
} from './notationGenerators'
import { generateHandToHandNotation } from './notationGenerators/handToHandNotationGenerator'
import { LocalStorageManager } from './utils/localStorage'

function App() {
  const [checkedItems, setCheckedItems] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ])
  const [selectedRudiment, setSelectedRudiment] = useState<RudimentType>(() => {
    const saved = LocalStorageManager.getItem<RudimentType>('selectedRudiment')
    return saved || 'paradiddle_single_accent'
  })
  const [convertResult, setConvertResult] = useState<any>(() => {
    if (selectedRudiment === 'hand_to_hand_triplets') {
      const stickings = convertHandToHand([0, 0, 0, 0, 0, 0, 0, 0])
      return { stickings }
    }
    return convertToParadiddles(
      [0, 0, 0, 0, 0, 0, 0, 0],
      'paradiddle_single_accent'
    )
  })

  const convertWithRudiment = (accents: Accent[], rudiment?: RudimentType) => {
    const currentRudiment = rudiment || selectedRudiment

    if (currentRudiment === 'hand_to_hand_triplets') {
      const stickings = convertHandToHand(accents)
      setConvertResult({ stickings })
    } else {
      const result = convertToParadiddles(accents, currentRudiment)
      setConvertResult(result)
    }
  }

  const handleToggle = (index: number) => {
    setCheckedItems(prev => {
      const newCheckedItems = prev.map((item, i) =>
        i === index ? !item : item
      )
      // Convert boolean array to Accent array
      const accentArray: Accent[] = newCheckedItems.map(checked =>
        checked ? 1 : 0
      )
      convertWithRudiment(accentArray)
      return newCheckedItems
    })
  }

  const handleRudimentChange = (rudiment: RudimentType) => {
    setSelectedRudiment(rudiment)
    LocalStorageManager.setItem('selectedRudiment', rudiment)
    // Regenerate pattern with new rudiment
    const accentArray: Accent[] = checkedItems.map(checked => (checked ? 1 : 0))
    convertWithRudiment(accentArray, rudiment)
  }

  const resetAccents = () => {
    const emptyAccents = new Array(8).fill(false)
    setCheckedItems(emptyAccents)
    convertWithRudiment([0, 0, 0, 0, 0, 0, 0, 0], selectedRudiment)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'KeyR') {
        event.preventDefault()
        resetAccents()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <RudimentSelector
        selectedRudiment={selectedRudiment}
        onRudimentChange={handleRudimentChange}
      />
      <ABCNotation
        seeNotation={generateAccentNotation(checkedItems)}
        playNotation={
          selectedRudiment === 'hand_to_hand_triplets'
            ? generateHandToHandNotation(convertResult)
            : generateParadiddleNotation(convertResult)
        }
        bars={convertResult.bars || [convertResult.stickings?.join('') || '']}
      />
      <AccentPattern checkedItems={checkedItems} onToggle={handleToggle} />
    </>
  )
}

export default App
