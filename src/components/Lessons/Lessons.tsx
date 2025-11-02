import { useState, useRef } from 'react'
import { useAppState } from '../../context/AppStateContext'
import { AccentPatternDisplay } from '../AccentPatternDisplay'
import { lessons, type Exercise } from './lessonData'
import classes from './Lessons.module.css'

export function Lessons() {
  const { state, actions } = useAppState()
  const [openLessonId, setOpenLessonId] = useState<number | null>(null)
  const exerciseRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const handleExerciseClick = (exercise: Exercise) => {
    const accents = exercise.accents.map(a => a === 1)
    actions.setAccents(accents)
  }

  const toggleLesson = (lessonId: number) => {
    setOpenLessonId(openLessonId === lessonId ? null : lessonId)
  }

  const isExerciseActive = (exercise: Exercise): boolean => {
    return exercise.accents.every((accent, index) => {
      return (accent === 1) === state.accents[index]
    })
  }

  const getExerciseKey = (lessonId: number, exerciseId: number) => {
    return `${lessonId}-${exerciseId}`
  }

  const setExerciseRef = (lessonId: number, exerciseId: number) => {
    return (el: HTMLButtonElement | null) => {
      const key = getExerciseKey(lessonId, exerciseId)
      if (el) {
        exerciseRefs.current.set(key, el)
      } else {
        exerciseRefs.current.delete(key)
      }
    }
  }

  const handleKeyDown = (
    e: React.KeyboardEvent,
    lessonId: number,
    exerciseId: number
  ) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      return
    }

    e.preventDefault()

    const lesson = lessons.find(l => l.id === lessonId)
    if (!lesson) return

    const currentIndex = lesson.exercises.findIndex(ex => ex.id === exerciseId)
    if (currentIndex === -1) return

    // Calculate grid dimensions
    const container = e.currentTarget.parentElement
    if (!container) return

    const buttons = Array.from(exerciseRefs.current.values()).filter(btn =>
      container.contains(btn)
    )
    const containerWidth = container.clientWidth
    const buttonWidth = (e.currentTarget as HTMLButtonElement).offsetWidth
    const gap = 8 // 0.5rem = 8px
    const columnsCount = Math.floor(
      (containerWidth + gap) / (buttonWidth + gap)
    )

    let nextIndex = currentIndex

    switch (e.key) {
      case 'ArrowRight':
        nextIndex = currentIndex + 1
        break
      case 'ArrowLeft':
        nextIndex = currentIndex - 1
        break
      case 'ArrowDown':
        nextIndex = currentIndex + columnsCount
        break
      case 'ArrowUp':
        nextIndex = currentIndex - columnsCount
        break
    }

    // Check bounds
    if (nextIndex < 0 || nextIndex >= lesson.exercises.length) {
      return
    }

    const nextExercise = lesson.exercises[nextIndex]
    const nextKey = getExerciseKey(lessonId, nextExercise.id)
    const nextButton = exerciseRefs.current.get(nextKey)

    if (nextButton) {
      nextButton.focus()
    }
  }

  return (
    <div className={classes.lessons}>
      <h2 className={classes.title}>Lessons</h2>
      {lessons.map(lesson => (
        <div key={lesson.id} className={classes.lesson}>
          <button
            className={classes.lessonHeader}
            onClick={() => toggleLesson(lesson.id)}
            aria-expanded={openLessonId === lesson.id}
          >
            <span className={classes.lessonTitle}>{lesson.title}</span>
            <span className={classes.arrow}>
              {openLessonId === lesson.id ? '▼' : '▶'}
            </span>
          </button>

          {openLessonId === lesson.id && (
            <div
              className={classes.exercises}
              role="grid"
              aria-label={`Exercises for ${lesson.title}`}
            >
              {lesson.exercises.map(exercise => {
                const isActive = isExerciseActive(exercise)
                return (
                  <button
                    key={exercise.id}
                    ref={setExerciseRef(lesson.id, exercise.id)}
                    role="gridcell"
                    className={`${classes.exercise} ${
                      isActive ? classes.active : ''
                    }`}
                    onClick={() => handleExerciseClick(exercise)}
                    onKeyDown={(e) => handleKeyDown(e, lesson.id, exercise.id)}
                    aria-label={`Exercise ${exercise.id}`}
                    aria-pressed={isActive}
                  >
                    <span className={classes.exerciseNumber}>
                      {exercise.id}
                    </span>
                    <AccentPatternDisplay
                      accents={exercise.accents}
                      compact={lesson.id === 1}
                      className={classes.pattern}
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
