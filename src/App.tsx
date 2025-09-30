import { useState } from 'react'
import type { Accent, RudimentType } from './types.ts'
import { convertToParadiddles } from './converters/paradiddles'
import { RudimentSelector } from './components/RudimentSelector'
import { AccentPattern } from './components/AccentPattern'
import { ABCNotation } from './components/ABCNotation'
import {
  generateAccentNotation,
  generateRudimentNotation,
} from './notationGenerators'

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
  const [selectedRudiment, setSelectedRudiment] = useState<RudimentType>(
    'paradiddle_single_accent'
  )
  const [convertResult, setConvertResult] = useState(
    () =>
      convertToParadiddles([0, 0, 0, 0, 0, 0, 0, 0], 'paradiddle_single_accent') // Соответствует checkedItems
  )

  const convertWithRudiment = (accents: Accent[]) => {
    const result = convertToParadiddles(accents, selectedRudiment)
    setConvertResult(result)
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
    // Regenerate pattern with new rudiment
    const accentArray: Accent[] = checkedItems.map(checked => (checked ? 1 : 0))
    const result = convertToParadiddles(accentArray, rudiment)
    setConvertResult(result)
  }

  return (
    <>
      <RudimentSelector
        selectedRudiment={selectedRudiment}
        onRudimentChange={handleRudimentChange}
      />
      <ABCNotation
        key={checkedItems.join('')}
        seeNotation={generateAccentNotation(checkedItems)}
        playNotation={generateRudimentNotation(convertResult)}
        bars={convertResult.bars}
      />
      <AccentPattern checkedItems={checkedItems} onToggle={handleToggle} />
    </>
  )
}

export default App
