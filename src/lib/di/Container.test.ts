import { describe, it, expect, beforeEach } from 'vitest'
import { Container, Lifecycle } from './Container'
import { createToken, createTokenRegistry } from './tokens'

// Test interfaces
interface ILogger {
  log(message: string): void
  getLogs(): string[]
}

interface IDatabase {
  connect(): void
  isConnected(): boolean
  getLogger(): ILogger
}

interface ICache {
  getId(): number
}

// Test implementations
class Logger implements ILogger {
  private logs: string[] = []

  log(message: string): void {
    this.logs.push(message)
  }

  getLogs(): string[] {
    return this.logs
  }
}

class Database implements IDatabase {
  private connected = false
  private logger: ILogger

  constructor(logger: ILogger) {
    this.logger = logger
    this.logger.log('Database created')
  }

  connect(): void {
    this.connected = true
    this.logger.log('Database connected')
  }

  isConnected(): boolean {
    return this.connected
  }

  getLogger(): ILogger {
    return this.logger
  }
}

let instanceCounter = 0

class Cache implements ICache {
  private id: number

  constructor() {
    this.id = ++instanceCounter
  }

  getId(): number {
    return this.id
  }
}

describe('Container', () => {
  let container: Container

  beforeEach(() => {
    container = new Container()
    instanceCounter = 0 // Reset counter before each test
  })

  describe('singleton lifecycle', () => {
    it('should create service once and cache it', () => {
      const CacheToken = createToken<ICache>('Cache')

      container.register(CacheToken, () => new Cache())

      const cache1 = container.resolve<ICache>(CacheToken)
      const cache2 = container.resolve<ICache>(CacheToken)

      expect(cache1).toBe(cache2)
      expect(cache1.getId()).toBe(1)
      expect(cache2.getId()).toBe(1)
    })

    it('should support dependencies between services', () => {
      const LoggerToken = createToken<ILogger>('Logger')
      const DatabaseToken = createToken<IDatabase>('Database')

      container.register(LoggerToken, () => new Logger())
      container.register(DatabaseToken, () => {
        const logger = container.resolve<ILogger>(LoggerToken)
        return new Database(logger)
      })

      const db = container.resolve<IDatabase>(DatabaseToken)
      db.connect()

      const logger = container.resolve<ILogger>(LoggerToken)
      const logs = logger.getLogs()

      expect(logs).toEqual(['Database created', 'Database connected'])
      expect(db.getLogger()).toBe(logger)
    })

    it('should resolve same instance multiple times', () => {
      const LoggerToken = createToken<ILogger>('Logger')
      container.register(LoggerToken, () => new Logger())

      const logger1 = container.resolve<ILogger>(LoggerToken)
      logger1.log('First message')

      const logger2 = container.resolve<ILogger>(LoggerToken)
      logger2.log('Second message')

      expect(logger1).toBe(logger2)
      expect(logger1.getLogs()).toEqual(['First message', 'Second message'])
    })
  })

  describe('transient lifecycle', () => {
    it('should create new instance on each resolve', () => {
      const CacheToken = createToken<ICache>('Cache')

      container.registerTransient(CacheToken, () => new Cache())

      const cache1 = container.resolve<ICache>(CacheToken)
      const cache2 = container.resolve<ICache>(CacheToken)

      expect(cache1).not.toBe(cache2)
      expect(cache1.getId()).toBe(1)
      expect(cache2.getId()).toBe(2)
    })

    it('should create new transient but use singleton dependencies', () => {
      const LoggerToken = createToken<ILogger>('Logger')
      const DatabaseToken = createToken<IDatabase>('Database')

      container.register(LoggerToken, () => new Logger())
      container.registerTransient(DatabaseToken, () => {
        const logger = container.resolve<ILogger>(LoggerToken)
        return new Database(logger)
      })

      const db1 = container.resolve<IDatabase>(DatabaseToken)
      const db2 = container.resolve<IDatabase>(DatabaseToken)

      expect(db1).not.toBe(db2)
      expect(db1.getLogger()).toBe(db2.getLogger()) // Same logger instance
    })
  })

  describe('scoped containers', () => {
    it('should create child container that inherits parent registrations', () => {
      const LoggerToken = createToken<ILogger>('Logger')

      container.register(LoggerToken, () => new Logger())

      const scope = container.createScope()
      const logger = scope.resolve<ILogger>(LoggerToken)

      expect(logger).toBeInstanceOf(Logger)
    })

    it('should allow scope to override parent registrations', () => {
      const LoggerToken = createToken<ILogger>('Logger')

      container.register(LoggerToken, () => {
        const logger = new Logger()
        logger.log('Parent logger')
        return logger
      })

      const scope = container.createScope()
      scope.register(LoggerToken, () => {
        const logger = new Logger()
        logger.log('Scoped logger')
        return logger
      })

      const parentLogger = container.resolve<ILogger>(LoggerToken)
      const scopedLogger = scope.resolve<ILogger>(LoggerToken)

      expect(parentLogger.getLogs()).toEqual(['Parent logger'])
      expect(scopedLogger.getLogs()).toEqual(['Scoped logger'])
      expect(parentLogger).not.toBe(scopedLogger)
    })

    it('should isolate singleton instances between parent and child', () => {
      const LoggerToken = createToken<ILogger>('Logger')

      container.register(LoggerToken, () => new Logger())

      const parentLogger = container.resolve<ILogger>(LoggerToken)
      parentLogger.log('Parent message')

      const scope = container.createScope()
      scope.register(LoggerToken, () => new Logger())

      const scopedLogger = scope.resolve<ILogger>(LoggerToken)
      scopedLogger.log('Scoped message')

      expect(parentLogger.getLogs()).toEqual(['Parent message'])
      expect(scopedLogger.getLogs()).toEqual(['Scoped message'])
    })

    it('should support multi-level scope hierarchy', () => {
      const LoggerToken = createToken<ILogger>('Logger')

      container.register(LoggerToken, () => {
        const logger = new Logger()
        logger.log('Root')
        return logger
      })

      const scope1 = container.createScope()
      const scope2 = scope1.createScope()

      scope2.register(LoggerToken, () => {
        const logger = new Logger()
        logger.log('Deep scope')
        return logger
      })

      const rootLogger = container.resolve<ILogger>(LoggerToken)
      const scope1Logger = scope1.resolve<ILogger>(LoggerToken)
      const scope2Logger = scope2.resolve<ILogger>(LoggerToken)

      expect(rootLogger).toBe(scope1Logger) // scope1 inherits from root
      expect(scope2Logger).not.toBe(rootLogger) // scope2 has override
      expect(scope2Logger.getLogs()).toEqual(['Deep scope'])
    })
  })

  describe('token helpers', () => {
    it('should work with createToken helper', () => {
      const LoggerToken = createToken<ILogger>('Logger')

      container.register(LoggerToken, () => new Logger())

      const logger = container.resolve<ILogger>(LoggerToken)
      logger.log('Test message')

      expect(logger.getLogs()).toEqual(['Test message'])
    })

    it('should work with createTokenRegistry helper', () => {
      const TOKENS = createTokenRegistry({
        Logger: createToken<ILogger>('Logger'),
        Database: createToken<IDatabase>('Database'),
        Cache: createToken<ICache>('Cache'),
      })

      container.register(TOKENS.Logger, () => new Logger())
      container.register(TOKENS.Cache, () => new Cache())

      const logger = container.resolve<ILogger>(TOKENS.Logger)
      const cache = container.resolve<ICache>(TOKENS.Cache)

      expect(logger).toBeInstanceOf(Logger)
      expect(cache).toBeInstanceOf(Cache)
    })

    it('should ensure token registry is immutable', () => {
      const TOKENS = createTokenRegistry({
        Logger: createToken<ILogger>('Logger'),
      })

      expect(() => {
        // @ts-expect-error - Testing immutability
        TOKENS.Logger = createToken<ILogger>('NewLogger')
      }).toThrow()

      expect(Object.isFrozen(TOKENS)).toBe(true)
    })
  })

  describe('has() method', () => {
    it('should return true for registered service', () => {
      const LoggerToken = createToken<ILogger>('Logger')
      container.register(LoggerToken, () => new Logger())

      expect(container.has(LoggerToken)).toBe(true)
    })

    it('should return false for unregistered service', () => {
      const LoggerToken = createToken<ILogger>('Logger')

      expect(container.has(LoggerToken)).toBe(false)
    })

    it('should check parent container', () => {
      const LoggerToken = createToken<ILogger>('Logger')

      container.register(LoggerToken, () => new Logger())

      const scope = container.createScope()

      expect(scope.has(LoggerToken)).toBe(true)
    })
  })

  describe('clear() method', () => {
    it('should clear singleton instances but keep registrations', () => {
      const LoggerToken = createToken<ILogger>('Logger')

      container.register(LoggerToken, () => new Logger())

      const logger1 = container.resolve<ILogger>(LoggerToken)
      logger1.log('Message 1')

      container.clear()

      const logger2 = container.resolve<ILogger>(LoggerToken)

      expect(logger1).not.toBe(logger2)
      expect(logger1.getLogs()).toEqual(['Message 1'])
      expect(logger2.getLogs()).toEqual([])
    })

    it('should not affect transient services', () => {
      const CacheToken = createToken<ICache>('Cache')

      container.registerTransient(CacheToken, () => new Cache())

      const cache1 = container.resolve<ICache>(CacheToken)
      container.clear()
      const cache2 = container.resolve<ICache>(CacheToken)

      expect(cache1.getId()).toBe(1)
      expect(cache2.getId()).toBe(2)
    })
  })

  describe('reset() method', () => {
    it('should clear both registrations and singletons', () => {
      const LoggerToken = createToken<ILogger>('Logger')

      container.register(LoggerToken, () => new Logger())

      const logger1 = container.resolve<ILogger>(LoggerToken)
      logger1.log('Message')

      container.reset()

      expect(() => container.resolve<ILogger>(LoggerToken)).toThrow()
      expect(container.has(LoggerToken)).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should throw error when resolving unregistered service', () => {
      const LoggerToken = createToken<ILogger>('Logger')

      expect(() => container.resolve<ILogger>(LoggerToken)).toThrow(
        'Service not registered for token: Symbol(Logger)'
      )
    })

    it('should throw error when resolving from empty scope without parent', () => {
      const scope = container.createScope()
      const LoggerToken = createToken<ILogger>('Logger')

      expect(() => scope.resolve<ILogger>(LoggerToken)).toThrow(
        'Service not registered for token: Symbol(Logger)'
      )
    })
  })

  describe('real-world patterns', () => {
    it('should support factory pattern with container injection', () => {
      const LoggerToken = createToken<ILogger>('Logger')
      const DatabaseToken = createToken<IDatabase>('Database')

      // Register services
      container.register(LoggerToken, () => new Logger())
      container.register(DatabaseToken, () =>
        new Database(container.resolve<ILogger>(LoggerToken))
      )

      // Factory function
      function createApp() {
        return {
          logger: container.resolve<ILogger>(LoggerToken),
          database: container.resolve<IDatabase>(DatabaseToken),
        }
      }

      const app = createApp()
      app.database.connect()

      expect(app.logger.getLogs()).toEqual(['Database created', 'Database connected'])
    })

    it('should support request-scoped services', () => {
      const LoggerToken = createToken<ILogger>('Logger')
      const RequestIdToken = Symbol('RequestId')

      // Global logger
      container.register(LoggerToken, () => new Logger())

      // Simulate two requests
      const request1Scope = container.createScope()
      request1Scope.register(RequestIdToken, () => 'req-123')

      const request2Scope = container.createScope()
      request2Scope.register(RequestIdToken, () => 'req-456')

      const req1Id = request1Scope.resolve<string>(RequestIdToken)
      const req2Id = request2Scope.resolve<string>(RequestIdToken)

      expect(req1Id).toBe('req-123')
      expect(req2Id).toBe('req-456')

      // Both requests share the same global logger
      const req1Logger = request1Scope.resolve<ILogger>(LoggerToken)
      const req2Logger = request2Scope.resolve<ILogger>(LoggerToken)
      expect(req1Logger).toBe(req2Logger)
    })

    it('should support testing with mocks', () => {
      const LoggerToken = createToken<ILogger>('Logger')
      const DatabaseToken = createToken<IDatabase>('Database')

      // Production setup
      container.register(LoggerToken, () => new Logger())
      container.register(DatabaseToken, () =>
        new Database(container.resolve<ILogger>(LoggerToken))
      )

      // Test setup with mocks in a fresh scope
      const testScope = container.createScope()

      const mockLogger: ILogger = {
        log: () => undefined,
        getLogs: () => ['Mock log'],
      }

      testScope.register(LoggerToken, () => mockLogger)
      // Override Database to use scope's logger
      testScope.register(DatabaseToken, () =>
        new Database(testScope.resolve<ILogger>(LoggerToken))
      )

      const testDb = testScope.resolve<IDatabase>(DatabaseToken)
      testDb.connect()

      expect(testDb.getLogger()).toBe(mockLogger)
      expect(testDb.getLogger().getLogs()).toEqual(['Mock log'])
    })
  })

  describe('edge cases', () => {
    it('should handle circular dependencies gracefully', () => {
      const ServiceAToken = Symbol('ServiceA')
      const ServiceBToken = Symbol('ServiceB')

      container.register(ServiceAToken, () => {
        const b = container.resolve(ServiceBToken)
        return { name: 'A', b }
      })

      container.register(ServiceBToken, () => {
        const a = container.resolve(ServiceAToken)
        return { name: 'B', a }
      })

      // This will cause infinite recursion - expected behavior
      // In real apps, you'd need to use lazy resolution or redesign
      expect(() => container.resolve(ServiceAToken)).toThrow(
        /Maximum call stack size exceeded/
      )
    })

    it('should handle multiple resolves in parallel', () => {
      const CacheToken = createToken<ICache>('Cache')

      container.register(CacheToken, () => new Cache())

      const resolves = Array.from({ length: 10 }, () =>
        container.resolve<ICache>(CacheToken)
      )

      // All should be the same singleton instance
      const firstCache = resolves[0]
      expect(resolves.every(cache => cache === firstCache)).toBe(true)
      expect(firstCache.getId()).toBe(1)
    })

    it('should work with symbol tokens created directly', () => {
      const PlainToken = Symbol('PlainService')

      container.register(PlainToken, () => ({ value: 42 }))

      const service = container.resolve<{ value: number }>(PlainToken)

      expect(service.value).toBe(42)
    })
  })
})
