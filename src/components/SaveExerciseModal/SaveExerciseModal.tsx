import { useEffect, useState, type FC } from 'react'
import { createPortal } from 'react-dom'
import { useAppState } from '../../context/AppStateContext'
import { useUserLessons } from '../../hooks/useUserLessons'
import {
  addExercise,
  createList,
  findListByExerciseId,
  updateExercise,
} from '../../utils/userLessons'
import classes from './SaveExerciseModal.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  onMessage: (msg: string) => void
}

const NEW_LIST_VALUE = '__new__'

export const SaveExerciseModal: FC<Props> = ({ isOpen, onClose, onMessage }) => {
  const { state, loadedExerciseId, isDirty, actions } = useAppState()
  const lists = useUserLessons()

  const [name, setName] = useState('')
  const [listId, setListId] = useState<string>('')
  const [newListName, setNewListName] = useState('')

  // Префилл при открытии: если есть загруженное упражнение — берём его имя/список
  useEffect(() => {
    if (!isOpen) return
    if (loadedExerciseId) {
      const list = findListByExerciseId(loadedExerciseId)
      const ex = list?.exercises.find(e => e.id === loadedExerciseId)
      setName(ex?.name ?? '')
      setListId(list?.id ?? lists[0]?.id ?? NEW_LIST_VALUE)
    } else {
      setName('')
      setListId(lists[0]?.id ?? NEW_LIST_VALUE)
    }
    setNewListName('')
  }, [isOpen, loadedExerciseId])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const resolveListId = (): string | null => {
    if (listId === NEW_LIST_VALUE) {
      const trimmed = newListName.trim()
      if (!trimmed) {
        onMessage('Введите название нового списка')
        return null
      }
      return createList(trimmed).id
    }
    return listId || null
  }

  const handleSaveAsNew = () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      onMessage('Введите название упражнения')
      return
    }
    const targetListId = resolveListId()
    if (!targetListId) return
    const ex = addExercise(targetListId, {
      name: trimmedName,
      accents: state.accents,
      rudiment: state.rudiment,
      tempo: state.tempo,
      instrumentMapping: state.instrumentMapping,
    })
    if (ex) {
      actions.loadUserExercise(ex)
      onMessage('Упражнение сохранено')
      onClose()
    }
  }

  const handleOverwrite = () => {
    if (!loadedExerciseId) return
    const trimmedName = name.trim() || 'Без названия'
    const updated = updateExercise(loadedExerciseId, {
      name: trimmedName,
      accents: state.accents,
      rudiment: state.rudiment,
      tempo: state.tempo,
      instrumentMapping: state.instrumentMapping,
    })
    if (updated) {
      actions.loadUserExercise(updated)
      onMessage('Упражнение перезаписано')
      onClose()
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const showOverwrite = loadedExerciseId !== null && isDirty

  return createPortal(
    <div className={classes.overlay} onClick={handleOverlayClick}>
      <div className={classes.modal}>
        <div className={classes.header}>
          <h2 className={classes.title}>Сохранить упражнение</h2>
          <button
            className={classes.closeButton}
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className={classes.body}>
          <label className={classes.label}>
            Название
            <input
              className={classes.input}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Например: Разминка №1"
              autoFocus
            />
          </label>

          <label className={classes.label}>
            Список
            <select
              className={classes.select}
              value={listId}
              onChange={e => setListId(e.target.value)}
            >
              {lists.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
              <option value={NEW_LIST_VALUE}>+ Новый список…</option>
            </select>
          </label>

          {listId === NEW_LIST_VALUE && (
            <label className={classes.label}>
              Название нового списка
              <input
                className={classes.input}
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                placeholder="Мои разминки"
              />
            </label>
          )}
        </div>

        <div className={classes.actions}>
          <button
            className={`${classes.button} ${classes.buttonGhost}`}
            onClick={onClose}
          >
            Отмена
          </button>
          {showOverwrite && (
            <button
              className={`${classes.button} ${classes.buttonSecondary}`}
              onClick={handleOverwrite}
            >
              Перезаписать
            </button>
          )}
          <button className={classes.button} onClick={handleSaveAsNew}>
            Сохранить как новое
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
