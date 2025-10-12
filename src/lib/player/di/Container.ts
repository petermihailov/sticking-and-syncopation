/**
 * Simple Dependency Injection Container
 * Uses Symbol tokens for type-safe service resolution
 */
export class Container {
  private factories = new Map<symbol, () => unknown>()
  private singletons = new Map<symbol, unknown>()

  /**
   * Register a service factory
   * Service will be created on first resolve() call and cached
   */
  register<T>(token: symbol, factory: () => T): void {
    this.factories.set(token, factory)
  }

  /**
   * Resolve a service by token
   * Creates the service on first call, then returns cached instance
   */
  resolve<T>(token: symbol): T {
    // Return cached singleton if exists
    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T
    }

    // Get factory
    const factory = this.factories.get(token)
    if (!factory) {
      throw new Error(
        `Service not registered for token: ${token.toString()}`
      )
    }

    // Create and cache instance
    const instance = factory() as T
    this.singletons.set(token, instance)
    return instance
  }

  /**
   * Check if a service is registered
   */
  has(token: symbol): boolean {
    return this.factories.has(token)
  }

  /**
   * Clear all singletons (useful for testing)
   */
  clear(): void {
    this.singletons.clear()
  }

  /**
   * Reset everything
   */
  reset(): void {
    this.factories.clear()
    this.singletons.clear()
  }
}
