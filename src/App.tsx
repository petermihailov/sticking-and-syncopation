import { useEffect, useMemo } from 'react'
import type { Accent } from './types.ts'
import { converters } from './converters/registry'
import { createFormattedBars } from './converters/16th-paradiddle-single-accent/formatter'
import { RudimentSelector } from './components/RudimentSelector'
import { AccentPattern } from './components/AccentPattern'
import { ABCNotation } from './components/ABCNotation'
import {
  generateAccentNotation,
  generateParadiddleNotation,
} from './notationGenerators'
import { generateHandToHandNotation } from './notationGenerators/handToHandNotationGenerator'
import { AppStateProvider, useAppState } from './context/AppStateContext'

function AppContent() {
  const { state, actions } = useAppState()

  // Convert accents to rudiment pattern
  const convertResult = useMemo(() => {
    const accentArray: Accent[] = state.accents.map(checked =>
      checked ? 1 : 0
    )

    const converter = converters[state.rudiment]
    const bar = converter.convert(accentArray)

    if (state.rudiment === '8th-hand-to-hand-triplets') {
      return { stickings: bar }
    } else {
      const bars = createFormattedBars(bar, accentArray)
      return { bars, isMirrored: bars.length > 1 }
    }
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
            ? generateHandToHandNotation(convertResult as { stickings: any[] })
            : generateParadiddleNotation(convertResult as any)
        }
        bars={
          state.rudiment === '8th-hand-to-hand-triplets'
            ? [(convertResult as { stickings: [] }).stickings?.join('') || '']
            : (convertResult as any).bars || []
        }
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
