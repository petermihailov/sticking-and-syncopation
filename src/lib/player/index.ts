import { Player } from './Player'
import { AudioEngine } from './services/AudioEngine'
import { BufferManager } from './services/BufferManager'
import { getAudioContext } from '../../utils/audio'

export function createPlayer(audioContext?: AudioContext): Player {
  const ctx = audioContext ?? getAudioContext()
  return new Player(new AudioEngine(ctx), new BufferManager())
}

export { Player } from './Player'
export type { PlayerState } from './Player'
