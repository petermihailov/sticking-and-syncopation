import { useEffect, useMemo, useState } from 'react'
import type { Accent, ConvertResult } from './types.ts'
import { converters } from './converters/registry'
import { Lessons } from './components/Lessons'
import { RudimentSelector } from './components/RudimentSelector'
import { AccentPattern } from './components/AccentPattern'
import { ABCNotation } from './components/ABCNotation'
import { AudioPlayer } from './components/AudioPlayer'
import { OrchestrationSection } from './components/OrchestrationSection'
import { AppLayout } from './components/Layout/AppLayout'
import { generateAccentNotation } from './notationGenerators'
import { AppStateProvider, useAppState } from './context/AppStateContext'
import {
  DEFAULT_STICKING_MAPPING,
  type StickingMapping,
} from './types/instrument'

function AppContent() {
  const { state, actions } = useAppState()
  const [currentBeat, setCurrentBeat] = useState({
    barIndex: 0,
    rhythmIndex: 0,
  })
  const [instrumentCounters, setInstrumentCounters] = useState<
    Map<string, number>
  >(new Map())

  // Convert accents to rudiment pattern
  const convertResult: ConvertResult = useMemo(() => {
    const accentArray: Accent[] = state.accents.map(checked =>
      checked ? 1 : 0
    )

    const converter = converters[state.rudiment]
    const result = converter.convert(accentArray)

    return {
      bars: result.bar2 ? [result.bar1, result.bar2] : [result.bar1],
    }
  }, [state.accents, state.rudiment])

  // Keyboard shortcuts: R for reset to defaults, Escape to blur active element
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'KeyR') {
        event.preventDefault()
        actions.resetToDefaults()
      } else if (event.code === 'Escape') {
        // Blur any active element
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [actions])

  const handleMappingChange = (key: keyof StickingMapping, value: unknown) => {
    actions.setInstrumentMapping({
      ...state.instrumentMapping,
      [key]: value,
    })
  }

  const handleOrchestrationReset = () => {
    actions.setInstrumentMapping(DEFAULT_STICKING_MAPPING)
  }

  return (
    <AppLayout sidebar={<Lessons />}>
      <RudimentSelector
        selectedRudiment={state.rudiment}
        onRudimentChange={actions.setRudiment}
      />
      <AudioPlayer
        bars={convertResult.bars}
        instrumentMapping={state.instrumentMapping}
        tempo={state.tempo}
        metronome={state.metronome}
        metronomeVolume={state.metronomeVolume}
        onBeatChange={setCurrentBeat}
        onInstrumentCountersChange={setInstrumentCounters}
        onTempoChange={actions.setTempo}
        onMetronomeToggle={() => actions.setMetronome(!state.metronome)}
        onMetronomeVolumeChange={actions.setMetronomeVolume}
      />
      <AccentPattern
        checkedItems={state.accents}
        onToggle={actions.toggleAccent}
      />
      <ABCNotation
        seeNotation={generateAccentNotation(state.accents)}
        playNotation={converters[state.rudiment].generateNotation(
          convertResult
        )}
        bars={convertResult.bars}
        currentBeat={currentBeat}
      />
      <OrchestrationSection
        mapping={state.instrumentMapping}
        instrumentCounters={instrumentCounters}
        onChange={handleMappingChange}
        onReset={handleOrchestrationReset}
      />
    </AppLayout>
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
