import { Container } from '../di'
import { TOKENS } from './di/tokens'
import { Player } from './Player'
import { AudioEngine } from './services/AudioEngine'
import { Scheduler } from './services/Scheduler'
import { InstrumentResolver } from './services/InstrumentResolver'
import { StateManager } from './services/StateManager'
import { BufferManager } from './services/BufferManager'
import { getAudioContext } from '../../utils/audio'

/**
 * Create a Player instance with all dependencies configured via DI
 *
 * @param audioContext - Optional AudioContext to inject
 * @returns Configured Player instance
 */
export function createPlayer(audioContext?: AudioContext): Player {
  const container = new Container()

  // Register AudioContext (singleton)
  container.register(
    TOKENS.AudioContext,
    () => audioContext ?? getAudioContext()
  )

  // Register services (all singletons)
  container.register(TOKENS.AudioEngine, () => {
    const ctx = container.resolve<AudioContext>(TOKENS.AudioContext)
    return new AudioEngine(ctx)
  })

  container.register(TOKENS.Scheduler, () => new Scheduler())

  container.register(TOKENS.InstrumentResolver, () => new InstrumentResolver())

  container.register(TOKENS.StateManager, () => new StateManager())

  container.register(TOKENS.BufferManager, () => new BufferManager())

  // Create Player with injected dependencies
  const player = new Player(
    container.resolve(TOKENS.AudioEngine),
    container.resolve(TOKENS.Scheduler),
    container.resolve(TOKENS.InstrumentResolver),
    container.resolve(TOKENS.StateManager),
    container.resolve(TOKENS.BufferManager)
  )

  return player
}

// Re-export Player for direct import
export { Player } from './Player'

// Re-export types for consumers
export type {
  IAudioEngine,
  IScheduler,
  IInstrumentResolver,
  IStateManager,
  IBufferManager,
} from './di/types'
