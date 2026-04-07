import { useEffect, useState } from 'react'
import {
  loadLists,
  subscribeUserLessons,
} from '../utils/userLessons'
import type { UserLessonList } from '../types/userLessons'

/**
 * Подписка на пользовательские списки уроков. Перерисовывает компонент
 * при любых изменениях через утилиты userLessons.
 */
export function useUserLessons(): UserLessonList[] {
  const [lists, setLists] = useState<UserLessonList[]>(loadLists)
  useEffect(() => subscribeUserLessons(() => setLists(loadLists())), [])
  return lists
}
