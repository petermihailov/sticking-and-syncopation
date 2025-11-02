import { useState } from 'react'
import { useAppState } from '../../context/AppStateContext'
import { AccentPatternDisplay } from '../AccentPatternDisplay'
import { lessons, type Exercise } from './lessonData'
import classes from './Lessons.module.css'

export function Lessons() {
  const { state, actions } = useAppState()
  const [openLessonId, setOpenLessonId] = useState<number | null>(null)

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
            <div className={classes.exercises}>
              {lesson.exercises.map(exercise => {
                const isActive = isExerciseActive(exercise)
                return (
                  <button
                    key={exercise.id}
                    className={`${classes.exercise} ${
                      isActive ? classes.active : ''
                    }`}
                    onClick={() => handleExerciseClick(exercise)}
                    title={`Exercise ${exercise.id}`}
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
