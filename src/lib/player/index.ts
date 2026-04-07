import { Player } from './Player'
import { AudioEngine } from './services/AudioEngine'
import { Scheduler } from './services/Scheduler'
import { InstrumentResolver } from './services/InstrumentResolver'
import { BufferManager } from './services/BufferManager'
import { getAudioContext } from '../../utils/audio'

export function createPlayer(audioContext?: AudioContext): Player {
  const ctx = audioContext ?? getAudioContext()
  return new Player(
    new AudioEngine(ctx),
    new Scheduler(),
    new InstrumentResolver(),
    new BufferManager()
  )
}

export { Player } from './Player'
