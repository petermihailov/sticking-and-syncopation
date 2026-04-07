import type { RudimentType } from '../converters/registry'
import type { StickingMapping } from './sticking'

/**
 * Пользовательское упражнение — снапшот настроек плеера с именем.
 */
export interface UserExercise {
  id: string
  name: string
  accents: boolean[]
  rudiment: RudimentType
  tempo: number
  instrumentMapping: StickingMapping
  createdAt: number
  updatedAt: number
}

/**
 * Пользовательский список — группа упражнений (аналог встроенного урока).
 */
export interface UserLessonList {
  id: string
  name: string
  createdAt: number
  exercises: UserExercise[]
}
