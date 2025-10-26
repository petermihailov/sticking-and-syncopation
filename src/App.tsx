import { useEffect, useMemo } from 'react'
import type { Accent, ConvertResult } from './types.ts'
import { converters } from './converters/registry'
import { shouldCreateMirroredBar } from './converters/shared/mirror-checker'
import { RudimentSelector } from './components/RudimentSelector'
import { AccentPattern } from './components/AccentPattern'
import { ABCNotation } from './components/ABCNotation'
import {
  generateAccentNotation,
  generateParadiddleNotation,
} from './notationGenerators'
import { generateHandToHandNotation } from './notationGenerators/handToHandNotationGenerator'
import { generate16thHandToHandNotation } from './notationGenerators/16thHandToHandNotationGenerator'
import { AppStateProvider, useAppState } from './context/AppStateContext'

function AppContent() {
  const { state, actions } = useAppState()

  // Convert accents to rudiment pattern
  const convertResult: ConvertResult = useMemo(() => {
    const accentArray: Accent[] = state.accents.map(checked =>
      checked ? 1 : 0
    )

    const converter = converters[state.rudiment]
    const bar = converter.convert(accentArray)
    const isMirrored = shouldCreateMirroredBar(bar)

    return { stickings: bar, isMirrored }
  }, [state.accents, state.rudiment])

  // Keyboard shortcut: R for reset to defaults
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'KeyR') {
        event.preventDefault()
        actions.resetToDefaults()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [actions])

  return (
    <>
      <RudimentSelector
        selectedRudiment={state.rudiment}
        onRudimentChange={actions.setRudiment}
      />
      <AccentPattern
        checkedItems={state.accents}
        onToggle={actions.toggleAccent}
      />
      <ABCNotation
        seeNotation={generateAccentNotation(state.accents)}
        playNotation={
          state.rudiment === '8th-hand-to-hand-triplets'
            ? generateHandToHandNotation(convertResult)
            : state.rudiment === '16th-hand-to-hand-triplets'
              ? generate16thHandToHandNotation(convertResult)
              : state.rudiment === '8th-inverted-doubles-in-triplets'
                ? generateHandToHandNotation(convertResult)
                : generateParadiddleNotation(convertResult)
        }
        stickings={convertResult.stickings}
        isMirrored={convertResult.isMirrored}
      />
    </>
  )
}

function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  )
}

export default App
