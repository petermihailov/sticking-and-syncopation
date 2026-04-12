export class LocalStorageManager {
  private static prefix = 'sticking-syncopation:'

  static setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value)
      localStorage.setItem(this.prefix + key, serializedValue)
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  static getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Failed to read from localStorage:', error)
      return null
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key)
    } catch (error) {
      console.error('Failed to remove from localStorage:', error)
    }
  }

  static clear(): void {
    try {
      const keys = Object.keys(localStorage).filter(key =>
        key.startsWith(this.prefix)
      )
      keys.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  }

  static getAllKeys(): string[] {
    try {
      return Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''))
    } catch (error) {
      console.error('Failed to get localStorage keys:', error)
      return []
    }
  }
}
