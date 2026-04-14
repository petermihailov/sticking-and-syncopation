export interface Exercise {
  accents: number[]
}

export interface Lesson {
  title: string
  exercises: Exercise[]
}

export interface ActiveLessonInfo {
  lessonTitle: string
  exerciseNumber: number
  totalExercises: number
}

export const findActiveLesson = (
  accents: boolean[]
): ActiveLessonInfo | null => {
  for (const lesson of lessons) {
    for (let i = 0; i < lesson.exercises.length; i++) {
      const exercise = lesson.exercises[i]
      const match = exercise.accents.every(
        (a, idx) => (a === 1) === accents[idx]
      )
      if (match) {
        return {
          lessonTitle: lesson.title,
          exerciseNumber: i + 1,
          totalExercises: lesson.exercises.length,
        }
      }
    }
  }
  return null
}

export const lessons: Lesson[] = [
  {
    title: 'Downbeats',
    exercises: [
      { accents: [1, 0, 1, 0, 1, 0, 1, 0] },
      { accents: [0, 0, 1, 0, 1, 0, 1, 0] },
      { accents: [0, 0, 0, 0, 1, 0, 1, 0] },
      { accents: [0, 0, 0, 0, 0, 0, 1, 0] },
      { accents: [1, 0, 0, 0, 0, 0, 0, 0] },
      { accents: [1, 0, 1, 0, 0, 0, 0, 0] },
      { accents: [1, 0, 1, 0, 1, 0, 0, 0] },
      { accents: [1, 0, 0, 0, 1, 0, 1, 0] },
      { accents: [1, 0, 1, 0, 0, 0, 1, 0] },
      { accents: [0, 0, 1, 0, 1, 0, 0, 0] },
      { accents: [1, 0, 0, 0, 0, 0, 1, 0] },
      { accents: [0, 0, 1, 0, 0, 0, 0, 0] },
      { accents: [0, 0, 0, 0, 1, 0, 0, 0] },
      { accents: [0, 0, 1, 0, 0, 0, 1, 0] },
      { accents: [1, 0, 0, 0, 1, 0, 0, 0] },
    ],
  },
  {
    title: 'Off-Beats',
    exercises: [
      { accents: [1, 1, 1, 0, 1, 0, 1, 0] },
      { accents: [1, 0, 1, 1, 1, 0, 1, 0] },
      { accents: [1, 0, 1, 0, 1, 1, 1, 0] },
      { accents: [1, 0, 1, 0, 1, 0, 1, 1] },
      { accents: [1, 1, 1, 1, 1, 0, 1, 0] },
      { accents: [1, 0, 1, 1, 1, 1, 1, 0] },
      { accents: [1, 0, 1, 0, 1, 1, 1, 1] },
      { accents: [1, 1, 1, 0, 1, 0, 1, 1] },
      { accents: [1, 1, 1, 1, 1, 1, 1, 0] },
      { accents: [1, 0, 1, 1, 1, 1, 1, 1] },
      { accents: [1, 1, 1, 1, 1, 1, 1, 1] },
      { accents: [1, 1, 1, 0, 1, 1, 1, 1] },
      { accents: [1, 1, 1, 1, 1, 0, 1, 1] },
      { accents: [1, 1, 1, 0, 1, 1, 1, 0] },
      { accents: [1, 0, 1, 1, 1, 0, 1, 1] },
    ],
  },
  {
    title: 'Syncopation',
    exercises: [
      { accents: [0, 1, 1, 0, 1, 0, 1, 0] },
      { accents: [0, 1, 1, 1, 1, 0, 1, 0] },
      { accents: [1, 1, 1, 1, 0, 1, 1, 0] },
      { accents: [0, 1, 1, 1, 0, 1, 1, 1] },
      { accents: [1, 0, 1, 1, 0, 1, 1, 1] },
      { accents: [1, 0, 1, 0, 0, 1, 1, 1] },
      { accents: [0, 1, 1, 1, 1, 0, 1, 1] },
      { accents: [0, 1, 1, 0, 0, 1, 1, 1] },
      { accents: [1, 0, 1, 0, 1, 0, 0, 1] },
      { accents: [0, 1, 1, 0, 0, 1, 1, 0] },
      { accents: [1, 0, 0, 1, 1, 0, 0, 1] },
      { accents: [1, 0, 0, 1, 1, 1, 1, 0] },
      { accents: [1, 0, 1, 0, 0, 1, 1, 0] },
      { accents: [1, 0, 0, 1, 1, 0, 1, 0] },
      { accents: [0, 1, 1, 1, 0, 1, 1, 0] },
      { accents: [0, 1, 1, 0, 1, 0, 1, 1] },
      { accents: [0, 1, 1, 1, 1, 1, 1, 1] },
      { accents: [1, 1, 1, 1, 0, 1, 1, 1] },
      { accents: [0, 1, 1, 0, 1, 1, 1, 1] },
      { accents: [0, 1, 1, 1, 1, 1, 1, 0] },
      { accents: [1, 1, 1, 0, 0, 1, 1, 1] },
      { accents: [1, 1, 1, 0, 1, 0, 0, 1] },
      { accents: [1, 1, 1, 0, 0, 1, 1, 0] },
    ],
  },
]
