/**
 * Service lifecycle
 */
export type Lifecycle = 'singleton' | 'transient'

/**
 * Service registration
 */
interface Registration<T> {
  factory: () => T
  lifecycle: Lifecycle
}

/**
 * Simple Dependency Injection Container
 * Uses Symbol tokens for type-safe service resolution
 *
 * Features:
 * - Singleton services (default)
 * - Transient services (new instance each time)
 * - Scoped containers (child containers for isolation)
 * - Type-safe with Symbol tokens
 */
export class Container {
  private registrations = new Map<symbol, Registration<unknown>>()
  private singletons = new Map<symbol, unknown>()
  private parent?: Container

  constructor(parent?: Container) {
    this.parent = parent
  }

  /**
   * Register a singleton service (created once, cached)
   */
  register<T>(token: symbol, factory: () => T): void {
    this.registrations.set(token, {
      factory,
      lifecycle: 'singleton',
    })
  }

  /**
   * Register a transient service (new instance on each resolve)
   */
  registerTransient<T>(token: symbol, factory: () => T): void {
    this.registrations.set(token, {
      factory,
      lifecycle: 'transient',
    })
  }

  /**
   * Resolve a service by token
   * - Singleton: creates once and caches
   * - Transient: creates new instance each time
   * - Falls back to parent container if not found
   */
  resolve<T>(token: symbol): T {
    // Check if we have this registration
    const registration = this.registrations.get(token)

    if (registration) {
      // Handle singleton
      if (registration.lifecycle === 'singleton') {
        if (this.singletons.has(token)) {
          return this.singletons.get(token) as T
        }

        const instance = registration.factory() as T
        this.singletons.set(token, instance)
        return instance
      }

      // Handle transient
      return registration.factory() as T
    }

    // Try parent container
    if (this.parent) {
      return this.parent.resolve<T>(token)
    }

    // Not found
    throw new Error(
      `Service not registered for token: ${token.toString()}`
    )
  }

  /**
   * Check if a service is registered (checks parent too)
   */
  has(token: symbol): boolean {
    if (this.registrations.has(token)) {
      return true
    }
    return this.parent?.has(token) ?? false
  }

  /**
   * Create a child container (scope)
   * Child inherits parent's registrations but has separate singleton instances
   * Useful for request-scoped services in web apps
   */
  createScope(): Container {
    return new Container(this)
  }

  /**
   * Clear all singleton instances
   * Useful for testing or hot-reloading
   */
  clear(): void {
    this.singletons.clear()
  }

  /**
   * Reset everything (registrations and singletons)
   */
  reset(): void {
    this.registrations.clear()
    this.singletons.clear()
  }
}
