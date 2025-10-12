/**
 * Dependency Injection tokens using Symbols
 * Each token uniquely identifies a service in the DI container
 */
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

export type Token = typeof TOKENS[keyof typeof TOKENS]
