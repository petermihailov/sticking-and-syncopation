import { LocalStorageManager } from './localStorage'
import type { UserExercise, UserLessonList } from '../types/userLessons'
import type { RudimentType } from '../converters/registry'
import type { StickingMapping } from '../types/sticking'

const STORAGE_KEY = 'userLessons'

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function loadLists(): UserLessonList[] {
  return LocalStorageManager.getItem<UserLessonList[]>(STORAGE_KEY) ?? []
}

type Listener = () => void
const listeners = new Set<Listener>()

export function subscribeUserLessons(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function saveLists(lists: UserLessonList[]): void {
  LocalStorageManager.setItem(STORAGE_KEY, lists)
  listeners.forEach(fn => fn())
}

export function createList(name: string): UserLessonList {
  const lists = loadLists()
  const list: UserLessonList = {
    id: genId('list'),
    name,
    createdAt: Date.now(),
    exercises: [],
  }
  lists.push(list)
  saveLists(lists)
  return list
}

export function renameList(id: string, name: string): void {
  const lists = loadLists()
  const list = lists.find(l => l.id === id)
  if (list) {
    list.name = name
    saveLists(lists)
  }
}

export function deleteList(id: string): void {
  saveLists(loadLists().filter(l => l.id !== id))
}

interface ExerciseInput {
  name: string
  accents: boolean[]
  rudiment: RudimentType
  tempo: number
  instrumentMapping: StickingMapping
}

export function addExercise(
  listId: string,
  input: ExerciseInput
): UserExercise | null {
  const lists = loadLists()
  const list = lists.find(l => l.id === listId)
  if (!list) return null
  const now = Date.now()
  const exercise: UserExercise = {
    id: genId('ex'),
    ...input,
    createdAt: now,
    updatedAt: now,
  }
  list.exercises.push(exercise)
  saveLists(lists)
  return exercise
}

/**
 * Перезаписать упражнение по id (поиск во всех списках).
 */
export function updateExercise(
  exerciseId: string,
  patch: Partial<ExerciseInput>
): UserExercise | null {
  const lists = loadLists()
  for (const list of lists) {
    const idx = list.exercises.findIndex(e => e.id === exerciseId)
    if (idx !== -1) {
      const updated: UserExercise = {
        ...list.exercises[idx],
        ...patch,
        updatedAt: Date.now(),
      }
      list.exercises[idx] = updated
      saveLists(lists)
      return updated
    }
  }
  return null
}

export function renameExercise(exerciseId: string, name: string): void {
  updateExercise(exerciseId, { name })
}

export function deleteExercise(exerciseId: string): void {
  const lists = loadLists()
  for (const list of lists) {
    const idx = list.exercises.findIndex(e => e.id === exerciseId)
    if (idx !== -1) {
      list.exercises.splice(idx, 1)
      saveLists(lists)
      return
    }
  }
}

export function findListByExerciseId(
  exerciseId: string
): UserLessonList | null {
  return loadLists().find(l => l.exercises.some(e => e.id === exerciseId)) ?? null
}

/**
 * Экспорт всех пользовательских уроков в JSON-файл.
 */
export function exportLists(): void {
  const json = JSON.stringify(loadLists(), null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `sticking-syncopation-lessons-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Импорт списков из JSON-файла. Мерджит с существующими, перегенерируя id.
 */
export function importLists(): Promise<number> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return reject(new Error('Файл не выбран'))
      const reader = new FileReader()
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target?.result as string)
          if (!Array.isArray(data)) throw new Error('Неверный формат')
          const now = Date.now()
          const newLists: UserLessonList[] = data.map(l => ({
            id: genId('list'),
            name: String(l.name ?? 'Без названия'),
            createdAt: now,
            exercises: Array.isArray(l.exercises)
              ? l.exercises.map((ex: any) => ({
                  id: genId('ex'),
                  name: String(ex.name ?? 'Без названия'),
                  accents: ex.accents,
                  rudiment: ex.rudiment,
                  tempo: ex.tempo,
                  instrumentMapping: ex.instrumentMapping,
                  createdAt: now,
                  updatedAt: now,
                }))
              : [],
          }))
          saveLists([...loadLists(), ...newLists])
          resolve(newLists.length)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
      reader.readAsText(file)
    }
    input.click()
  })
}
