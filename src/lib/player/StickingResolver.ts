import type { Instrument } from '../../types/instrument'
import type { InstrumentVoice, StickingMapping } from '../../types/sticking'

// Состояние ротации: счётчики по ключам стикинга.
// Хранится снаружи резолвера, чтобы сам резолвер был чистой функцией.
export type ResolverState = Readonly<Record<string, number>>

export const EMPTY_RESOLVER_STATE: ResolverState = {}

export interface ResolveResult {
  voices: InstrumentVoice[]
  nextState: ResolverState
}

// Применить политику воспроизведения к имени инструмента.
// Политика — единственное место, где живут pitch-сдвиги и ghost-громкость.
function applyStrokePolicy(stroke: string, instrument: Instrument): InstrumentVoice {
  const voice: InstrumentVoice = { instrument }

  // Ghost-снейр играем тише.
  if (instrument === 'snSnareGhost') voice.gain = 0.6
  // Сплеш — мягче.
  if (instrument === 'cySplashRegular') voice.gain = 0.5

  // Pitch-сдвиг по руке: r чуть выше, l чуть ниже (только для ghost-стикингов).
  if (stroke === 'r') voice.rate = 1.02
  else if (stroke === 'l') voice.rate = 0.98

  return voice
}

interface StrokeConfig {
  source: Instrument[]
  counterKey: string
  withKick?: boolean
  kickCounterKey?: string
}

function configFor(
  stroke: string,
  mapping: StickingMapping
): StrokeConfig | null {
  switch (stroke) {
    case 'R':
      return {
        source: mapping.uppercaseR,
        counterKey: 'uppercaseR',
        withKick: mapping.uppercaseRKick,
        kickCounterKey: 'kick_R',
      }
    case 'L':
      return {
        source: mapping.uppercaseL,
        counterKey: 'uppercaseL',
        withKick: mapping.uppercaseLKick,
        kickCounterKey: 'kick_L',
      }
    case 'r':
      return { source: mapping.lowercaseR, counterKey: 'lowercaseR' }
    case 'l':
      return { source: mapping.lowercaseL, counterKey: 'lowercaseL' }
    case 'k':
      return { source: mapping.kick, counterKey: 'kick' }
    default:
      return null
  }
}

// Чистая функция: по символу стикинга и состоянию ротации возвращает
// voices для воспроизведения и следующее состояние счётчиков.
export function resolveStroke(
  stroke: string,
  mapping: StickingMapping,
  state: ResolverState
): ResolveResult {
  const config = configFor(stroke, mapping)
  if (!config || config.source.length === 0) {
    return { voices: [], nextState: state }
  }

  const voices: InstrumentVoice[] = []
  let nextState = state

  // Основной инструмент с ротацией.
  const counter = nextState[config.counterKey] ?? 0
  const instrument = config.source[counter % config.source.length]
  voices.push(applyStrokePolicy(stroke, instrument))
  nextState = { ...nextState, [config.counterKey]: counter + 1 }

  // Опциональный kick (для R/L с включённым флагом).
  if (config.withKick && config.kickCounterKey && mapping.kick.length > 0) {
    const kickCounter = nextState[config.kickCounterKey] ?? 0
    const kickInstrument = mapping.kick[kickCounter % mapping.kick.length]
    voices.push(applyStrokePolicy('k', kickInstrument))
    nextState = {
      ...nextState,
      [config.kickCounterKey]: kickCounter + 1,
    }
  }

  return { voices, nextState }
}

// Конвертация ResolverState в Map для совместимости с UI (счётчики ротации).
export function stateToCounters(state: ResolverState): Map<string, number> {
  return new Map(Object.entries(state))
}
