import { LocalStorageManager } from './localStorage'
import type { FavoritePreset } from '../types/appState'
import { converters, type RudimentType } from '../converters/registry'

const FAVORITES_KEY = 'favorites'

/**
 * Generate a unique ID for a preset
 */
function generateId(): string {
  return `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate a default preset name based on current settings
 * Format: "{converterName} - {tempo} BPM - [{accentPattern}]"
 * Example: "16th paradiddle single - 80 BPM - [X__X____]"
 */
export function generateDefaultPresetName(
  rudiment: RudimentType,
  tempo: number,
  accents: boolean[]
): string {
  // Get converter name
  const converter = converters[rudiment]
  const converterPattern = converter?.pattern || rudiment

  // Format accent pattern: X = accent, _ = no accent
  const pattern = accents.map(accent => (accent ? 'x' : '.')).join('')

  return `${converterPattern} - ${tempo} BPM - ${pattern}`
}

/**
 * Load all favorite presets from localStorage
 */
export function loadFavorites(): FavoritePreset[] {
  const favorites = LocalStorageManager.getItem<FavoritePreset[]>(FAVORITES_KEY)
  return favorites || []
}

/**
 * Save a new favorite preset
 */
export function saveFavorite(
  name: string,
  accents: boolean[],
  rudiment: string,
  tempo: number,
  instrumentMapping: any
): FavoritePreset {
  const favorites = loadFavorites()

  const newPreset: FavoritePreset = {
    id: generateId(),
    name,
    createdAt: Date.now(),
    accents,
    rudiment: rudiment as any,
    tempo,
    instrumentMapping,
  }

  favorites.push(newPreset)
  LocalStorageManager.setItem(FAVORITES_KEY, favorites)

  return newPreset
}

/**
 * Delete a favorite preset by ID
 */
export function deleteFavorite(id: string): void {
  const favorites = loadFavorites()
  const filtered = favorites.filter(preset => preset.id !== id)
  LocalStorageManager.setItem(FAVORITES_KEY, filtered)
}

/**
 * Rename a favorite preset
 */
export function renameFavorite(id: string, newName: string): void {
  const favorites = loadFavorites()
  const preset = favorites.find(p => p.id === id)

  if (preset) {
    preset.name = newName
    LocalStorageManager.setItem(FAVORITES_KEY, favorites)
  }
}

/**
 * Duplicate a favorite preset
 */
export function duplicateFavorite(id: string): FavoritePreset | null {
  const favorites = loadFavorites()
  const preset = favorites.find(p => p.id === id)

  if (!preset) return null

  const duplicated: FavoritePreset = {
    ...preset,
    id: generateId(),
    name: `${preset.name} (copy)`,
    createdAt: Date.now(),
  }

  favorites.push(duplicated)
  LocalStorageManager.setItem(FAVORITES_KEY, favorites)

  return duplicated
}

/**
 * Export all favorites to JSON string
 */
export function exportFavorites(): string {
  const favorites = loadFavorites()
  return JSON.stringify(favorites, null, 2)
}

/**
 * Import favorites from JSON string
 * @param json - JSON string containing array of presets
 * @param merge - If true, merge with existing favorites. If false, replace all.
 * @returns Number of presets imported
 */
export function importFavorites(json: string, merge = true): number {
  try {
    const imported = JSON.parse(json) as FavoritePreset[]

    if (!Array.isArray(imported)) {
      throw new Error('Invalid format: expected array of presets')
    }

    // Validate each preset has required fields
    for (const preset of imported) {
      if (!preset.id || !preset.name || !preset.accents || !preset.rudiment) {
        throw new Error('Invalid preset format')
      }
    }

    // Regenerate IDs to avoid conflicts
    const newPresets = imported.map(preset => ({
      ...preset,
      id: generateId(),
      createdAt: Date.now(),
    }))

    if (merge) {
      const existing = loadFavorites()
      LocalStorageManager.setItem(FAVORITES_KEY, [...existing, ...newPresets])
    } else {
      LocalStorageManager.setItem(FAVORITES_KEY, newPresets)
    }

    return newPresets.length
  } catch (error) {
    console.error('Failed to import favorites:', error)
    throw error
  }
}

/**
 * Download favorites as a JSON file
 */
export function downloadFavoritesFile(): void {
  const json = exportFavorites()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `sticking-syncopation-favorites-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Upload and import favorites from a file
 * @param merge - If true, merge with existing favorites. If false, replace all.
 */
export function uploadFavoritesFile(merge = true): Promise<number> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) {
        reject(new Error('No file selected'))
        return
      }

      const reader = new FileReader()
      reader.onload = event => {
        try {
          const json = event.target?.result as string
          const count = importFavorites(json, merge)
          resolve(count)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    }

    input.click()
  })
}
