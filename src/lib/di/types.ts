import type { TypedToken } from './tokens'

/**
 * Factory function that creates a service instance
 */
export type Factory<T> = () => T

/**
 * Service token - can be either Symbol or TypedToken
 */
export type Token<T = unknown> = symbol | TypedToken<T>

/**
 * Extract the type from a token
 * Used for type inference in container.resolve()
 */
export type Infer<T> = T extends TypedToken<infer U> ? U : unknown

/**
 * Container interface
 * Defines the public API for dependency injection containers
 */
export interface IContainer {
  /**
   * Register a singleton service
   */
  register<T>(token: symbol, factory: Factory<T>): void

  /**
   * Register a transient service (new instance each time)
   */
  registerTransient<T>(token: symbol, factory: Factory<T>): void

  /**
   * Resolve a service by token
   */
  resolve<T>(token: symbol): T

  /**
   * Check if a service is registered
   */
  has(token: symbol): boolean

  /**
   * Create a child container (scope)
   */
  createScope(): IContainer

  /**
   * Clear all singleton instances
   */
  clear(): void

  /**
   * Reset everything
   */
  reset(): void
}
