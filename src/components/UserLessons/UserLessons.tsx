import { useState, type FC } from 'react'
import { useAppState } from '../../context/AppStateContext'
import { useUserLessons } from '../../hooks/useUserLessons'
import {
  deleteExercise,
  deleteList,
  exportLists,
  importLists,
  renameExercise,
  renameList,
} from '../../utils/userLessons'
import type { UserExercise } from '../../types/userLessons'
import classes from './UserLessons.module.css'

/**
 * Сайдбар-секция «Мои уроки» — пользовательские списки и упражнения.
 */
export const UserLessons: FC = () => {
  const { loadedExerciseId, isDirty, actions } = useAppState()
  const lists = useUserLessons()
  const [openListId, setOpenListId] = useState<string | null>(null)

  const toggle = (id: string) =>
    setOpenListId(openListId === id ? null : id)

  const handleClickExercise = (ex: UserExercise) => {
    actions.loadUserExercise(ex)
  }

  const handleRenameList = (id: string, currentName: string) => {
    const next = window.prompt('Название списка', currentName)
    if (next && next.trim()) renameList(id, next.trim())
  }

  const handleDeleteList = (id: string) => {
    if (window.confirm('Удалить список со всеми упражнениями?')) {
      deleteList(id)
    }
  }

  const handleRenameExercise = (id: string, currentName: string) => {
    const next = window.prompt('Название упражнения', currentName)
    if (next && next.trim()) renameExercise(id, next.trim())
  }

  const handleDeleteExercise = (id: string) => {
    if (window.confirm('Удалить упражнение?')) deleteExercise(id)
  }

  const handleImport = async () => {
    try {
      await importLists()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className={classes.section}>
      <div className={classes.header}>
        <h2 className={classes.title}>Мои уроки</h2>
        <div className={classes.headerActions}>
          <button
            className={classes.iconBtn}
            onClick={handleImport}
            title="Импорт из файла"
          >
            ⬆
          </button>
          <button
            className={classes.iconBtn}
            onClick={exportLists}
            title="Экспорт в файл"
            disabled={lists.length === 0}
          >
            ⬇
          </button>
        </div>
      </div>

      {lists.length === 0 && (
        <div className={classes.empty}>
          Сохрани текущий пресет кнопкой «Сохранить» в плеере — он появится
          здесь.
        </div>
      )}

      {lists.map(list => {
        const isOpen = openListId === list.id
        return (
          <div key={list.id} className={classes.list}>
            <button
              className={classes.listHeader}
              onClick={() => toggle(list.id)}
              aria-expanded={isOpen}
            >
              <span className={classes.listTitleWrap}>
                <span>{list.name}</span>
                <span className={classes.meta}>({list.exercises.length})</span>
              </span>
              <span className={classes.arrow}>{isOpen ? '▼' : '▶'}</span>
            </button>

            {isOpen && (
              <div className={classes.exercises}>
                {list.exercises.length === 0 && (
                  <div className={classes.empty}>Список пуст</div>
                )}
                {list.exercises.map(ex => {
                  const active = loadedExerciseId === ex.id
                  return (
                    <div key={ex.id} className={classes.exerciseRow}>
                      <button
                        className={`${classes.exercise} ${
                          active ? classes.active : ''
                        }`}
                        onClick={() => handleClickExercise(ex)}
                        aria-pressed={active}
                      >
                        <span className={classes.exerciseName}>{ex.name}</span>
                        {active && isDirty && (
                          <span
                            className={classes.dirtyDot}
                            title="Изменено — можно перезаписать"
                          />
                        )}
                        <span className={classes.meta}>{ex.tempo}</span>
                      </button>
                      <button
                        className={classes.iconBtn}
                        onClick={() => handleRenameExercise(ex.id, ex.name)}
                        title="Переименовать"
                      >
                        ✏
                      </button>
                      <button
                        className={classes.iconBtn}
                        onClick={() => handleDeleteExercise(ex.id)}
                        title="Удалить"
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                gap: '0.25rem',
                padding: '0 1rem 0.5rem',
              }}
            >
              <button
                className={classes.iconBtn}
                onClick={() => handleRenameList(list.id, list.name)}
                title="Переименовать список"
              >
                ✏ список
              </button>
              <button
                className={classes.iconBtn}
                onClick={() => handleDeleteList(list.id)}
                title="Удалить список"
              >
                ✕ список
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
