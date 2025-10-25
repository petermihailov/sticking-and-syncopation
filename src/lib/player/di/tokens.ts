export const TOKENS = {
  // Core services
  AudioEngine: Symbol('AudioEngine'),
  Scheduler: Symbol('Scheduler'),
  InstrumentResolver: Symbol('InstrumentResolver'),
  StateManager: Symbol('StateManager'),
  BufferManager: Symbol('BufferManager'),

  // External dependencies
  AudioContext: Symbol('AudioContext'),
} as const

export type PlayerToken = (typeof TOKENS)[keyof typeof TOKENS]
