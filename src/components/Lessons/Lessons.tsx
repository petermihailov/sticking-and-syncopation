import { useState, useRef } from 'react'
import { useAppState } from '../../context/AppStateContext'
import { AccentPatternDisplay } from '../AccentPatternDisplay'
import { lessons, type Exercise } from './lessonData'
import classes from './Lessons.module.css'

const formatExerciseNumber = (index: number) =>
  (index + 1).toString().padStart(2, '0')

export function Lessons() {
  const { state, actions } = useAppState()
  const [openLessonIndex, setOpenLessonIndex] = useState<number | null>(null)
  const exerciseRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const handleExerciseClick = (exercise: Exercise) => {
    const accents = exercise.accents.map(a => a === 1)
    actions.setAccents(accents)
  }

  const toggleLesson = (lessonIndex: number) => {
    setOpenLessonIndex(openLessonIndex === lessonIndex ? null : lessonIndex)
  }

  const isExerciseActive = (exercise: Exercise): boolean => {
    return exercise.accents.every((accent, index) => {
      return (accent === 1) === state.accents[index]
    })
  }

  const getExerciseKey = (lessonIndex: number, exerciseIndex: number) => {
    return `${lessonIndex}-${exerciseIndex}`
  }

  const setExerciseRef = (lessonIndex: number, exerciseIndex: number) => {
    return (el: HTMLButtonElement | null) => {
      const key = getExerciseKey(lessonIndex, exerciseIndex)
      if (el) {
        exerciseRefs.current.set(key, el)
      } else {
        exerciseRefs.current.delete(key)
      }
    }
  }

  const handleKeyDown = (
    e: React.KeyboardEvent,
    lessonIndex: number,
    exerciseIndex: number
  ) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      return
    }

    e.preventDefault()

    const lesson = lessons[lessonIndex]
    if (!lesson) return

    // Вычисляем размеры грида
    const container = e.currentTarget.parentElement
    if (!container) return

    const containerWidth = container.clientWidth
    const buttonWidth = (e.currentTarget as HTMLButtonElement).offsetWidth
    const gap = 8 // 0.5rem = 8px
    const columnsCount = Math.floor(
      (containerWidth + gap) / (buttonWidth + gap)
    )

    let nextIndex = exerciseIndex

    switch (e.key) {
      case 'ArrowRight':
        nextIndex = exerciseIndex + 1
        break
      case 'ArrowLeft':
        nextIndex = exerciseIndex - 1
        break
      case 'ArrowDown':
        nextIndex = exerciseIndex + columnsCount
        break
      case 'ArrowUp':
        nextIndex = exerciseIndex - columnsCount
        break
    }

    // Проверка границ
    if (nextIndex < 0 || nextIndex >= lesson.exercises.length) {
      return
    }

    const nextKey = getExerciseKey(lessonIndex, nextIndex)
    const nextButton = exerciseRefs.current.get(nextKey)

    if (nextButton) {
      nextButton.focus()
    }
  }

  return (
    <div className={classes.lessons}>
      <h2 className={classes.title}>Lessons</h2>
      {lessons.map((lesson, lessonIndex) => (
        <div key={lesson.title} className={classes.lesson}>
          <button
            className={classes.lessonHeader}
            onClick={() => toggleLesson(lessonIndex)}
            aria-expanded={openLessonIndex === lessonIndex}
          >
            <span className={classes.lessonTitle}>{lesson.title}</span>
            <span className={classes.arrow}>
              {openLessonIndex === lessonIndex ? '▼' : '▶'}
            </span>
          </button>

          {openLessonIndex === lessonIndex && (
            <div
              className={classes.exercises}
              role="grid"
              aria-label={`Exercises for ${lesson.title}`}
            >
              {lesson.exercises.map((exercise, exerciseIndex) => {
                const isActive = isExerciseActive(exercise)
                const number = formatExerciseNumber(exerciseIndex)
                return (
                  <button
                    key={exerciseIndex}
                    ref={setExerciseRef(lessonIndex, exerciseIndex)}
                    role="gridcell"
                    className={`${classes.exercise} ${
                      isActive ? classes.active : ''
                    }`}
                    onClick={() => handleExerciseClick(exercise)}
                    onKeyDown={(e) =>
                      handleKeyDown(e, lessonIndex, exerciseIndex)
                    }
                    aria-label={`Exercise ${number}`}
                    aria-pressed={isActive}
                  >
                    <span className={classes.exerciseNumber}>{number}</span>
                    <AccentPatternDisplay
                      accents={exercise.accents}
                      compact={lessonIndex === 0}
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
