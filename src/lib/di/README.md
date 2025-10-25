# Dependency Injection Library

Lightweight, type-safe DI container for TypeScript applications.

## Features

- ✅ **Type-safe** - Symbol-based tokens with TypeScript support
- ✅ **Singleton & Transient** - Control service lifecycle
- ✅ **Scoped containers** - Isolate services per context
- ✅ **Zero dependencies** - Pure TypeScript
- ✅ **Small** - ~120 lines of code

## Basic Usage

```typescript
import { Container, createToken } from '@/lib/di'

// 1. Define service interface
interface ILogger {
  log(message: string): void
}

// 2. Create typed token
const LoggerToken = createToken<ILogger>('Logger')

// 3. Setup container
const container = new Container()
container.register(LoggerToken, () => new ConsoleLogger())

// 4. Resolve service
const logger = container.resolve(LoggerToken) // type: ILogger
logger.log('Hello, DI!')
```

## Lifecycles

### Singleton (default)

Service created once and cached:

```typescript
container.register(DatabaseToken, () => new Database())

const db1 = container.resolve(DatabaseToken)
const db2 = container.resolve(DatabaseToken)
// db1 === db2 (same instance)
```

### Transient

New instance created each time:

```typescript
container.registerTransient(RequestToken, () => new Request())

const req1 = container.resolve(RequestToken)
const req2 = container.resolve(RequestToken)
// req1 !== req2 (different instances)
```

## Scoped Containers

Create isolated contexts:

```typescript
const appContainer = new Container()
appContainer.register(ConfigToken, () => loadConfig())

// Create scope for each request
function handleRequest() {
  const requestScope = appContainer.createScope()
  requestScope.register(UserToken, () => getCurrentUser())

  // User is isolated to this scope
  const user = requestScope.resolve(UserToken)

  // Can still access parent services
  const config = requestScope.resolve(ConfigToken)
}
```

## Token Helpers

### createToken

Create type-safe tokens:

```typescript
const AudioEngineToken = createToken<IAudioEngine>('AudioEngine')
const SchedulerToken = createToken<IScheduler>('Scheduler')
```

### createTokenRegistry

Group related tokens:

```typescript
const PLAYER_TOKENS = createTokenRegistry({
  AudioEngine: createToken<IAudioEngine>('AudioEngine'),
  Scheduler: createToken<IScheduler>('Scheduler'),
  StateManager: createToken<IStateManager>('StateManager'),
})

// Usage
container.register(PLAYER_TOKENS.AudioEngine, () => new AudioEngine())
```

## Testing

Override services in tests:

```typescript
// Production container
const container = new Container()
container.register(ApiToken, () => new RealApi())

// Test scope with mock
const testScope = container.createScope()
testScope.register(ApiToken, () => new MockApi())

const api = testScope.resolve(ApiToken) // MockApi
```

## Advanced: Dependencies Between Services

Services can depend on each other:

```typescript
const container = new Container()

container.register(LoggerToken, () => new Logger())

container.register(DatabaseToken, () => {
  const logger = container.resolve(LoggerToken)
  return new Database(logger)
})

// Database automatically gets Logger injected
const db = container.resolve(DatabaseToken)
```

## API Reference

### Container

- `register<T>(token, factory)` - Register singleton
- `registerTransient<T>(token, factory)` - Register transient
- `resolve<T>(token)` - Get service instance
- `has(token)` - Check if registered
- `createScope()` - Create child container
- `clear()` - Clear singleton cache
- `reset()` - Clear everything

### Helpers

- `createToken<T>(name)` - Create typed token
- `createTokenRegistry(tokens)` - Group tokens

## Examples

See `src/lib/player/index.ts` for real-world usage.
