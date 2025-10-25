/**
 * Typed token - Symbol with phantom type parameter
 * Allows type inference when resolving from container
 */
export type TypedToken<T> = symbol & { __type?: T }

/**
 * Create a typed token
 * This adds compile-time type safety to DI resolution
 *
 * @example
 * ```ts
 * const AudioEngineToken = createToken<IAudioEngine>('AudioEngine')
 *
 * container.register(AudioEngineToken, () => new AudioEngine())
 * const engine = container.resolve(AudioEngineToken) // type: IAudioEngine
 * ```
 */
export function createToken<T>(name: string): TypedToken<T> {
  return Symbol(name) as TypedToken<T>
}

/**
 * Token registry helper
 * Groups related tokens together
 *
 * @example
 * ```ts
 * const PLAYER_TOKENS = createTokenRegistry({
 *   AudioEngine: createToken<IAudioEngine>('AudioEngine'),
 *   Scheduler: createToken<IScheduler>('Scheduler'),
 * })
 * ```
 */
export function createTokenRegistry<T extends Record<string, symbol>>(
  tokens: T
): Readonly<T> {
  return Object.freeze(tokens)
}
