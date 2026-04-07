export interface Exercise {
  accents: number[]
}

export interface Lesson {
  title: string
  exercises: Exercise[]
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
